import FacadeAct from 'abis/FacadeAct'
import FacadeRead from 'abis/FacadeRead'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import {
  chainIdAtom,
  publicClientAtom,
  rTokenAssetsAtom,
  rTokenAtom,
  rTokenContractsAtom,
  rTokenPriceAtom,
} from 'state/atoms'
import { Token } from 'types'
import {
  FACADE_ACT_ADDRESS,
  FACADE_ADDRESS,
  RSR_ADDRESS,
} from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import { Address, formatUnits, zeroAddress } from 'viem'
import { readContracts } from 'wagmi/actions'

export interface Auction {
  sell: Token
  buy: Token
  amount: string
  minAmount: string
  trader: Address
  canStart: boolean
  output: number // estimated token output
}

type AuctionType = 'Revenue' | 'Recollaterization'

export enum TradeKind {
  DutchTrade,
  BatchTrade,
}

export const AUCTION_TYPES = {
  REVENUE: 'Revenue' as AuctionType,
  BACKING: 'Recollaterization' as AuctionType,
}

export interface AuctionToSettle {
  type: AuctionType
  trader: Address
  sell: Token
  buy: Token | null
}

export interface Trade {
  id: string
  amount: number
  auctionId?: number
  buying: string
  buyingTokenSymbol: string
  sellingTokenSymbol: string
  endAt: number
  selling: string
  startedAt: number
  worstCasePrice: number
}

export const tradesAtom = atom<{ current: Trade[]; ended: Trade[] }>({
  current: [],
  ended: [],
})
export const currentTradesAtom = atom((get) => get(tradesAtom).current)
export const endedTradesAtom = atom((get) => get(tradesAtom).ended)

export const selectedAuctionsAtom = atomWithReset<number[]>([])

export const auctionSessionAtom = atom(1)

const sidebarAtom = atom(false)
export const auctionSidebarAtom = atom(
  (get) => get(sidebarAtom),
  (get, set) => {
    const current = get(sidebarAtom)

    if (current) {
      set(sidebarAtom, false)
    } else {
      set(auctionSessionAtom, Math.random())
      set(sidebarAtom, true)
    }
  }
)

export const auctionPlatformAtom = atom<TradeKind>(TradeKind.BatchTrade)

export const accumulatedRevenueAtom = atomWithLoadable(async (get) => {
  get(auctionSessionAtom) // just for refresh sake
  const rToken = get(rTokenAtom)
  const assets = get(rTokenAssetsAtom)
  const chainId = get(chainIdAtom)
  const client = get(publicClientAtom)
  const price = get(rTokenPriceAtom)

  if (!rToken || !assets || !client || !price) {
    return 0
  }

  const {
    result: [erc20s, balances, balancesNeededByBackingManager],
  } = await client.simulateContract({
    address: FACADE_ADDRESS[chainId],
    abi: FacadeRead,
    functionName: 'balancesAcrossAllTraders',
    args: [rToken.address],
  })

  return erc20s.reduce((revenue, erc20, index) => {
    const priceUsd = assets[erc20]?.priceUsd || 0
    const decimals = assets[erc20]?.token.decimals || 18

    return (
      revenue +
      Number(
        formatUnits(
          balances[index] - balancesNeededByBackingManager[index],
          decimals
        )
      ) *
        priceUsd
    )
  }, 0)
})

export const auctionsToSettleAtom = atomWithLoadable(
  async (get): Promise<AuctionToSettle[] | null> => {
    get(auctionSessionAtom) // just for refresh sake
    const chainId = get(chainIdAtom)
    const rToken = get(rTokenAtom)
    const assets = get(rTokenAssetsAtom)
    const contracts = get(rTokenContractsAtom)

    if (!rToken || !assets || !contracts) {
      return null
    }

    const traders = [
      {
        ...contracts.rsrTrader,
        buy: assets[RSR_ADDRESS[chainId]].token,
        type: AUCTION_TYPES.REVENUE,
      },
      {
        ...contracts.rTokenTrader,
        buy: {
          symbol: rToken.symbol,
          address: rToken.address,
          name: rToken.name,
          decimals: rToken.decimals,
        },
        type: AUCTION_TYPES.REVENUE,
      },
      { ...contracts.backingManager, buy: null, type: AUCTION_TYPES.BACKING },
    ]

    try {
      const result = await (<Promise<[string[], string[], string[]]>>(
        readContracts({
          contracts: traders.map(({ address, version }) => ({
            abi: FacadeRead,
            address: FACADE_ADDRESS[chainId],
            functionName: 'auctionsSettleable',
            args: [address],
          })),
          allowFailure: false,
        })
      ))

      return result.reduce((auctionsToSettle, current, index) => {
        auctionsToSettle.push(
          ...current.map((erc20: string) => ({
            type: traders[index].type,
            trader: traders[index].address,
            sell: assets[erc20].token,
            buy: traders[index].buy,
          }))
        )

        return auctionsToSettle
      }, [] as AuctionToSettle[])
    } catch (e) {
      console.error('error here', e)
    }

    return null
  }
)

// TODO: This can be executed from the global context to display the number of auctions available
export const auctionsOverviewAtom = atomWithLoadable(
  async (
    get
  ): Promise<{
    revenue: Auction[]
    recollaterization: Auction | null
  } | null> => {
    get(auctionSessionAtom) // just for refresh sake
    const contracts = get(rTokenContractsAtom)
    const assets = get(rTokenAssetsAtom)
    const rToken = get(rTokenAtom)
    const client = get(publicClientAtom)
    const chainId = get(chainIdAtom)

    if (!client || !contracts || !rToken || !assets) {
      return null
    }
    const call = {
      abi: FacadeAct,
      address: FACADE_ACT_ADDRESS[chainId],
    }

    const [
      { result: rsrRevenueOverview },
      { result: rTokenRevenueOverview },
      recoAuction,
    ] = await Promise.all([
      client.simulateContract({
        ...call,
        functionName: 'revenueOverview',
        args: [contracts.rsrTrader.address],
      }),
      client.simulateContract({
        ...call,
        functionName: 'revenueOverview',
        args: [contracts.rTokenTrader.address],
      }),
      (async (): Promise<[boolean, Address, Address, bigint]> => {
        try {
          const { result } = await client.simulateContract({
            ...call,
            functionName: 'nextRecollateralizationAuction',
            args: [contracts.backingManager.address, 0],
          })

          return result as any
        } catch (e) {
          console.log('error reco', e)
          return [false, zeroAddress, zeroAddress, 0n]
        }
      })(),
    ])

    const auctions = rsrRevenueOverview[0].reduce((acc, erc20, index) => {
      const asset = assets[erc20]
      const rsrTradeAmount = formatUnits(
        rsrRevenueOverview[2][index],
        asset.token.decimals
      )
      const rTokenTradeAmount = formatUnits(
        rTokenRevenueOverview[2][index],
        asset.token.decimals
      )

      if (asset.token.address !== RSR_ADDRESS[chainId]) {
        acc[rsrRevenueOverview[1][index] ? 'unshift' : 'push']({
          sell: asset.token,
          buy: assets[RSR_ADDRESS[chainId]].token,
          amount: rsrTradeAmount,
          minAmount: formatUnits(
            rsrRevenueOverview[3][index],
            asset.token.decimals
          ),
          trader: contracts.rsrTrader.address,
          canStart: rsrRevenueOverview[1][index],
          output:
            +rsrTradeAmount /
            (assets[RSR_ADDRESS[chainId]].priceUsd / asset.priceUsd),
        })
      }

      if (asset.token.address !== rToken.address) {
        acc[rTokenRevenueOverview[1][index] ? 'unshift' : 'push']({
          sell: asset.token,
          buy: assets[rToken.address].token,
          amount: rTokenTradeAmount,
          minAmount: formatUnits(
            rTokenRevenueOverview[4][index],
            asset.token.decimals
          ),
          trader: contracts.rTokenTrader.address,
          canStart: rTokenRevenueOverview[1][index],
          output:
            +rTokenTradeAmount /
            (assets[rToken.address].priceUsd / asset.priceUsd),
        })
      }

      return acc
    }, [] as Auction[])

    let recollaterizationAuction = null

    if (recoAuction[0]) {
      const sell = assets[recoAuction[1]]
      const buy = assets[recoAuction[2]]
      const amount = formatUnits(recoAuction[3], sell.token.decimals)

      recollaterizationAuction = {
        sell: sell.token,
        buy: buy.token,
        amount,
        minAmount: '0',
        trader: contracts.backingManager.address,
        canStart: true,
        output: +amount / (buy.priceUsd / sell.priceUsd),
      }
    }

    return { revenue: auctions, recollaterization: recollaterizationAuction }
  }
)
