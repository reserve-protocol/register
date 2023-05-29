import {
  AssetInterface,
  AssetRegistryInterface,
  BackingManagerInterface,
  BasketHandlerInterface,
  BrokerInterface,
  DistributorInterface,
  FacadeInterface,
  FurnaceInterface,
  LegacyBrokerInterface,
  MainInterface,
  RTokenInterface,
  RevenueTraderInterface,
  StRSRInterface,
} from 'abis'
import { AssetRegistry } from 'abis/types'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { ContractCall, Token } from 'types'
import { getContract, getTokenMetaCalls } from 'utils'
import {
  FACADE_ADDRESS,
  FURNACE_ADDRESS,
  ST_RSR_ADDRESS,
} from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import RSV from 'utils/rsv'
import rtokens from 'utils/rtokens'
import { getValidWeb3Atom } from './chainAtoms'
import { selectedRTokenAtom } from './rTokenAtoms'
import { gqlClient } from 'hooks/useQuery'
import { gql } from 'graphql-request'
import { VERSION } from 'utils/constants'

const isRSV = (address: string) => address === RSV.address

interface RToken extends Token {
  logo: string
  collaterals: Token[]
  stToken?: Token
  main?: string
  mandate?: string
  unlisted?: boolean
}

// Atoms and calls are grouped in the most optimal way to combine calls
// The order of the functions is also the expected fetching order
export const rTokenAtom = atomWithLoadable(
  async (get): Promise<RToken | null> => {
    const rTokenAddress = get(selectedRTokenAtom)
    const { provider, chainId } = get(getValidWeb3Atom)

    if (!provider || !rTokenAddress) {
      return null
    }

    if (isRSV(rTokenAddress)) {
      return RSV as RToken
    }

    const facadeCallParams = {
      abi: FacadeInterface,
      address: FACADE_ADDRESS[chainId],
      args: [rTokenAddress],
    }
    const rTokenCallParams = {
      abi: RTokenInterface,
      address: rTokenAddress,
      args: [],
    }

    const logo = rtokens[rTokenAddress]?.logo
      ? require(`@lc-labs/rtokens/images/${rtokens[rTokenAddress].logo}`)
      : '/svgs/default.svg'

    const [
      name,
      symbol,
      decimals,
      mainAddress,
      mandate,
      basket,
      stTokenAddress,
    ] = await promiseMulticall(
      [
        ...getTokenMetaCalls(rTokenAddress),
        { ...rTokenCallParams, method: 'main' },
        { ...rTokenCallParams, method: 'mandate' },
        {
          ...facadeCallParams,
          method: 'basketTokens',
        },
        {
          ...facadeCallParams,
          method: 'stToken',
        },
      ],
      provider
    )

    const tokensMeta = await promiseMulticall(
      [
        ...getTokenMetaCalls(stTokenAddress),
        ...(basket as string[]).reduce(
          (calls, collateral) => [...calls, ...getTokenMetaCalls(collateral)],
          [] as ContractCall[]
        ),
      ],
      provider
    )

    const tokens: Token[] = [stTokenAddress, ...(basket as string[])].reduce(
      (tokens, address) => {
        const [name, symbol, decimals] = tokensMeta.splice(0, 3)

        tokens.push({
          address,
          name,
          symbol,
          decimals,
        })

        return tokens
      },
      [] as Token[]
    )

    return {
      address: rTokenAddress,
      name,
      symbol,
      decimals,
      logo,
      main: mainAddress,
      mandate,
      stToken: tokens.shift() as Token,
      collaterals: tokens,
      unlisted: !rtokens[rTokenAddress],
    }
  }
)

const getMainCalls = (address: string, methods: string[]): ContractCall[] =>
  methods.map((method) => ({ abi: MainInterface, address, args: [], method }))

// TODO: Fetch state atom
// {
//   abi: BasketHandlerInterface,
//   address: basketHandler,
//   args: [],
//   method: 'fullyCollateralized',
// },

// setBackingCollateralStatus(isCollaterized)
export const rTokenContractsAtom = atomWithLoadable(async (get) => {
  const rToken = get(rTokenAtom)
  const { provider } = get(getValidWeb3Atom)

  if (!rToken?.main || !rToken?.stToken || !provider) {
    return null
  }

  const [
    distributor,
    backingManager,
    rTokenTrader,
    rsrTrader,
    furnace,
    broker,
    assetRegistry,
    basketHandler,
    mainVersion,
  ]: string[] = await promiseMulticall(
    getMainCalls(rToken.main, [
      'distributor',
      'backingManager',
      'rTokenTrader',
      'rsrTrader',
      'furnace',
      'broker',
      'assetRegistry',
      'basketHandler',
      'version',
    ]),
    provider
  )

  const [
    rTokenVersion,
    stRSRVersion,
    distributorVersion,
    backingManagerVersion,
    rTokenTraderVersion,
    rsrTraderVersion,
    furnaceVersion,
    brokerVersion,
    assetRegistryVersion,
    basketHandlerVersion,
  ]: string[] = await promiseMulticall(
    [
      {
        abi: RTokenInterface,
        address: rToken.address,
        args: [],
        method: 'version',
      },
      {
        abi: StRSRInterface,
        address: rToken.stToken.address,
        args: [],
        method: 'version',
      },
      {
        abi: DistributorInterface,
        address: distributor,
        args: [],
        method: 'version',
      },
      {
        abi: BackingManagerInterface,
        address: backingManager,
        args: [],
        method: 'version',
      },
      {
        abi: RevenueTraderInterface,
        address: rTokenTrader,
        args: [],
        method: 'version',
      },
      {
        abi: RevenueTraderInterface,
        address: rsrTrader,
        args: [],
        method: 'version',
      },
      {
        abi: FurnaceInterface,
        address: furnace,
        args: [],
        method: 'version',
      },
      {
        abi: BrokerInterface,
        address: broker,
        args: [],
        method: 'version',
      },
      {
        abi: AssetRegistryInterface,
        address: assetRegistry,
        args: [],
        method: 'version',
      },
      {
        abi: BasketHandlerInterface,
        address: basketHandler,
        args: [],
        method: 'version',
      },
    ],
    provider
  )

  return {
    token: { address: rToken.address, version: rTokenVersion },
    main: { address: rToken.main, version: mainVersion },
    stRSR: { address: rToken.stToken.address, version: stRSRVersion },
    backingManager: { address: backingManager, version: backingManagerVersion },
    rTokenTrader: { address: rTokenTrader, version: rTokenTraderVersion },
    rsrTrader: { address: rsrTrader, version: rsrTraderVersion },
    broker: { address: broker, version: brokerVersion },
    assetRegistry: { address: assetRegistry, version: assetRegistryVersion },
    furnace: { address: furnace, version: furnaceVersion },
    distributor: { address: distributor, version: distributorVersion },
    basketHandler: { address: basketHandler, version: basketHandlerVersion },
  }
})

export const rTokenAssetsAtom = atomWithLoadable(async (get) => {
  const contracts = get(rTokenContractsAtom)
  const { provider } = get(getValidWeb3Atom)

  if (!provider || !contracts) {
    return null
  }

  const registryContract = getContract(
    contracts.assetRegistry.address,
    AssetRegistryInterface,
    provider
  ) as AssetRegistry

  const [erc20s, assets] = await registryContract.getRegistry()
  const calls = assets.reduce((calls, asset, index) => {
    calls.push(...getTokenMetaCalls(erc20s[index]))
    calls.push({
      address: assets[index],
      abi: AssetInterface,
      args: [],
      method: 'price',
    })
    calls.push({
      address: assets[index],
      abi: AssetInterface,
      args: [],
      method: 'maxTradeVolume',
    })
    return calls
  }, [] as ContractCall[])

  const result = await promiseMulticall(calls, provider)

  const registeredAssets: {
    [x: string]: {
      address: string
      token: Token
      maxTradeVolume: string
      priceUsd: number
    }
  } = {}

  // For each asset 5 items of the result array
  for (let i = 0; i < assets.length; i++) {
    const [name, symbol, decimals, priceRange, maxTradeVolume] = result.splice(
      0,
      5
    )

    registeredAssets[erc20s[i]] = {
      address: assets[i],
      token: {
        address: erc20s[i],
        name,
        symbol,
        decimals,
      },
      maxTradeVolume: formatUnits(maxTradeVolume, decimals),
      priceUsd:
        (Number(formatEther(priceRange[0])) +
          Number(formatEther(priceRange[1]))) /
        2,
    }
  }

  return registeredAssets
})

export const rTokenConfigurationAtom = atomWithLoadable(async (get) => {
  const contracts = get(rTokenContractsAtom)
  const assets = get(rTokenAssetsAtom)
  const { provider } = get(getValidWeb3Atom)

  if (!contracts || !provider || !assets) {
    return null
  }

  const rTokenCall = {
    abi: RTokenInterface,
    address: contracts.token.address,
    args: [],
  }

  const stRSRCall = {
    abi: StRSRInterface,
    address: contracts.stRSR.address,
    args: [],
  }

  const mainCall = {
    abi: MainInterface,
    address: contracts.main.address,
    args: [],
  }

  const calls = [
    {
      ...mainCall,
      method: 'shortFreeze',
    },
    {
      ...mainCall,
      method: 'longFreeze',
    },
    {
      abi: BackingManagerInterface,
      address: contracts.backingManager.address,
      args: [],
      method: 'tradingDelay',
    },
    {
      abi: BackingManagerInterface,
      address: contracts.backingManager.address,
      args: [],
      method: 'backingBuffer',
    },
    {
      abi: RevenueTraderInterface,
      address: contracts.rTokenTrader.address,
      args: [],
      method: 'maxTradeSlippage',
    },
    {
      abi: RevenueTraderInterface,
      address: contracts.rTokenTrader.address,
      args: [],
      method: 'minTradeVolume',
    },
    {
      ...stRSRCall,
      method: 'rewardRatio',
    },
    {
      ...stRSRCall,
      method: 'unstakingDelay',
    },
    {
      ...rTokenCall,
      method: 'issuanceThrottleParams',
    },
    {
      ...rTokenCall,
      method: 'redemptionThrottleParams',
    },
  ]

  if (contracts.broker.version !== VERSION) {
    calls.push({
      abi: LegacyBrokerInterface,
      address: contracts.broker.address,
      args: [],
      method: 'auctionLength',
    })
  } else {
    calls.push(
      {
        abi: BrokerInterface,
        address: contracts.broker.address,
        args: [],
        method: 'batchAuctionLength',
      },
      {
        abi: BrokerInterface,
        address: contracts.broker.address,
        args: [],
        method: 'dutchAuctionLength',
      }
    )
  }

  const [
    shortFreeze,
    longFreeze,
    tradingDelay,
    backingBuffer,
    maxTradeSlippage,
    minTradeVolume,
    rewardRatio,
    unstakingDelay,
    issuanceThrottle,
    redemptionThrottle,
    batchAuctionLength,
    dutchAuctionLength,
  ] = await promiseMulticall(calls, provider)

  return {
    tradingDelay: tradingDelay.toString(),
    backingBuffer: (+formatEther(backingBuffer) * 100).toString(),
    maxTradeSlippage: (+formatEther(maxTradeSlippage) * 100).toString(),
    minTrade: formatEther(minTradeVolume),
    rewardRatio: formatEther(rewardRatio),
    unstakingDelay: unstakingDelay.toString(),
    batchAuctionLength: batchAuctionLength.toString(),
    dutchAuctionLength: dutchAuctionLength?.toString() || '0',
    issuanceThrottleAmount: Number(
      formatEther(issuanceThrottle.amtRate)
    ).toString(),
    issuanceThrottleRate: (
      +formatEther(issuanceThrottle.pctRate) * 100
    ).toString(),
    redemptionThrottleAmount: Number(
      formatEther(redemptionThrottle.amtRate)
    ).toString(),
    redemptionThrottleRate: (
      +formatEther(redemptionThrottle.pctRate) * 100
    ).toString(),
    maxTrade: assets[contracts.token.address]?.maxTradeVolume ?? '0',
    longFreeze: longFreeze.toString(),
    shortFreeze: shortFreeze.toString(),
  }
})

interface RTokenRevenueDistribution {
  holders: string
  stakers: string
  external: {
    [x: string]: {
      holders: string
      stakers: string
      total: string
      address: string
    }
  }
}

const shareToPercent = (shares: number): string => {
  return ((shares * 100) / 10000).toString()
}

interface Distribution {
  dest: string
  rTokenDist: number
  rsrDist: number
}

const formatDistribution = (data: Distribution[]) => {
  const dist: RTokenRevenueDistribution = {
    external: {},
    holders: '',
    stakers: '',
  }

  for (const distribution of data) {
    const { dest, rTokenDist, rsrDist } = distribution

    if (!rTokenDist && !rsrDist) {
      delete dist.external[dest]
    } else if (dest === FURNACE_ADDRESS) {
      dist.holders = shareToPercent(rTokenDist) || '0'
    } else if (dest === ST_RSR_ADDRESS) {
      dist.stakers = shareToPercent(rsrDist) || '0'
    } else {
      const holders = shareToPercent(rTokenDist)
      const stakers = shareToPercent(rsrDist)
      const total = +holders + +stakers

      dist.external[dest] = {
        holders: ((+holders * 100) / total).toString() || '0',
        stakers: ((+stakers * 100) / total).toString() || '0',
        total: total.toString(),
        address: dest,
      }
    }
  }

  return dist
}

export const rTokenRevenueSplitAtom = atomWithLoadable(async (get) => {
  const contracts = get(rTokenContractsAtom)
  const { provider } = get(getValidWeb3Atom)

  if (!contracts || !provider) {
    return null
  }

  try {
    const request: any = await gqlClient.request(gql`
      query getRTokenDistribution($id: String!) {
        rtoken(id: $id) {
          revenueDistribution {
            id
            rTokenDist
            rsrDist
            destination
          }
        }
      }
    `)

    console.log('request', request)

    return formatDistribution(request.rtoken.revenueDistribution)
  } catch (e) {
    // If there is a theGraph error, try fetching distribution from chain events
    const contract = getContract(
      contracts.distributor.address,
      DistributorInterface,
      provider
    )
    const events = await contract.queryFilter(
      'DistributionSet(address,uint16,uint16)'
    )

    return formatDistribution(
      events.map((event) => (event?.args || { dest: '0' }) as Distribution)
    )
  }
})
