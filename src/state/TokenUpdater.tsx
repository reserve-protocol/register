import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'
import {
  ERC20Interface,
  FacadeInterface,
  MainInterface,
  RTokenInterface,
} from 'abis'
import { ethers } from 'ethers'
import { gql } from 'graphql-request'
import useBlockNumber from 'hooks/useBlockNumber'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import useQuery from 'hooks/useQuery'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ContractCall, ReserveToken, Token } from 'types'
import { calculateApy, isAddress, truncateDecimals } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { RTOKEN_STATUS } from 'utils/constants'
import RSV from 'utils/rsv'
import rtokens from 'utils/rtokens'
import {
  accountRoleAtom,
  blockTimestampAtom,
  reserveTokensAtom,
  rTokenCollateralDist,
  rTokenDistributionAtom,
  rTokenMainAtom,
  rTokenStatusAtom,
  rTokenYieldAtom,
  selectedRTokenAtom,
  walletAtom,
} from './atoms'
import { tokenMetricsAtom } from './metrics/atoms'
import { promiseMulticall } from './web3/lib/multicall'
import { error } from './web3/lib/notifications'

const apyQuery = gql`
  query getRTokenGrowth($id: String!, $fromTime: Int!) {
    rToken(id: $id) {
      recentRate: hourlySnapshots(
        first: 1
        orderBy: timestamp
        where: { timestamp_gte: $fromTime }
        orderDirection: desc
      ) {
        rsrExchangeRate
        basketRate
        timestamp
      }
      lastRate: hourlySnapshots(
        first: 1
        orderBy: timestamp
        where: { timestamp_gte: $fromTime }
        orderDirection: asc
      ) {
        rsrExchangeRate
        basketRate
        timestamp
      }
    }
  }
`

/**
 * Fetch a list of tokens metadata from the blockchain
 */
const getRTokenMeta = async (
  addresses: string[],
  provider: Web3Provider
): Promise<{ tokens: Token[]; main: string; mandate: string }> => {
  const calls = addresses.reduce((acc, address) => {
    const params = { abi: ERC20Interface, address, args: [] }

    return [
      ...acc,
      {
        ...params,
        method: 'name',
      },
      {
        ...params,
        method: 'symbol',
      },
      {
        ...params,
        method: 'decimals',
      },
    ]
  }, [] as ContractCall[])

  calls.unshift(
    {
      abi: RTokenInterface,
      address: addresses[0],
      args: [],
      method: 'main',
    },
    {
      abi: RTokenInterface,
      address: addresses[0],
      args: [],
      method: 'mandate',
    }
  )

  const multicallResult = await promiseMulticall(calls, provider)
  const main = multicallResult.shift()
  const mandate = multicallResult.shift()

  const tokens = addresses.reduce((tokens, address) => {
    const [name, symbol, decimals] = multicallResult.splice(0, 3)

    tokens.push({
      address,
      name,
      symbol,
      decimals,
    })

    return tokens
  }, [] as Token[])

  return {
    tokens,
    main,
    mandate,
  }
}

const updateTokenAtom = atom(null, (get, set, data: ReserveToken) => {
  const tokens = get(reserveTokensAtom)
  set(reserveTokensAtom, { ...tokens, [data.address]: data })
})

// Try to grab the token meta from theGraph
// If it fails, get it from the blockchain (only whitelisted tokens)
// TODO: Loading state?
const ReserveTokenUpdater = () => {
  const [selectedAddress, setSelectedToken] = useAtom(selectedRTokenAtom)
  const blockNumber = useBlockNumber()
  const windowVisible = useIsWindowVisible()
  const mainAddress = useAtomValue(rTokenMainAtom)
  const updateApy = useSetAtom(rTokenYieldAtom)
  const updateTokenStatus = useSetAtom(rTokenStatusAtom)
  const updateToken = useSetAtom(updateTokenAtom)
  const resetMetrics = useResetAtom(tokenMetricsAtom)
  const updateAccountRole = useSetAtom(accountRoleAtom)
  const setDistribution = useSetAtom(rTokenDistributionAtom)
  const setCollateralDist = useSetAtom(rTokenCollateralDist)
  const [searchParams] = useSearchParams()
  const currentAddress = searchParams.get('token')
  const account = useAtomValue(walletAtom)
  const { provider } = useWeb3React()
  const timestamp = useAtomValue(blockTimestampAtom)
  const fromTime = useMemo(() => {
    return timestamp - 2592000
  }, [!!timestamp])
  // TODO: poll from blockNumber
  const { data } = useQuery(mainAddress ? apyQuery : null, {
    id: selectedAddress.toLowerCase(),
    fromTime,
  })

  const setTokenStatus = useCallback(
    async (mainAddress: string, provider: Web3Provider) => {
      try {
        let status = RTOKEN_STATUS.SOUND
        const [isPaused, isFrozen] = await promiseMulticall(
          [
            {
              abi: MainInterface,
              address: mainAddress,
              args: [],
              method: 'paused',
            },
            {
              abi: MainInterface,
              address: mainAddress,
              args: [],
              method: 'frozen',
            },
          ],
          provider
        )

        if (isPaused) {
          status = RTOKEN_STATUS.PAUSED
        } else if (isFrozen) {
          status = RTOKEN_STATUS.FROZEN
        }

        updateTokenStatus(status)
      } catch (e) {
        console.error('Error getting token status', e)
      }
    },
    []
  )

  const getBackingDistribution = useCallback(
    async (tokenAddress: string, provider: Web3Provider) => {
      try {
        const callParams = {
          abi: FacadeInterface,
          address: FACADE_ADDRESS[CHAIN_ID],
          args: [tokenAddress],
        }

        // TODO: Remove insurance term from theGraph
        const [{ erc20s, uoaShares, targets }, { backing, insurance: staked }] =
          await promiseMulticall(
            [
              {
                ...callParams,
                method: 'basketBreakdown',
              },
              {
                ...callParams,
                method: 'backingOverview',
              },
            ],
            provider
          )

        setDistribution({
          backing: Math.ceil(Number(formatEther(backing)) * 100),
          staked: Math.ceil(Number(formatEther(staked)) * 100),
        })
        setCollateralDist(
          erc20s.reduce(
            (acc: any, current: any, index: any) => ({
              ...acc,
              [current]: {
                share: truncateDecimals(
                  +formatEther(uoaShares[index]) * 100,
                  4
                ),
                targetUnit: ethers.utils
                  .parseBytes32String(targets[index])
                  .toUpperCase(),
              },
            }),
            {}
          )
        )
      } catch (e) {
        console.error('Error getting rToken backing distribution', e)
      }
    },
    []
  )

  const getTokenMeta = useCallback(
    async (address: string, provider: Web3Provider) => {
      const isRSV = address === RSV.address

      if (isRSV) {
        return updateToken({ ...RSV, meta: rtokens[address] })
      }

      try {
        const callParams = {
          abi: FacadeInterface,
          address: FACADE_ADDRESS[CHAIN_ID],
          args: [address],
        }

        const [basket, stTokenAddress] = await promiseMulticall(
          [
            {
              ...callParams,
              method: 'basketTokens',
            },
            {
              ...callParams,
              method: 'stToken',
            },
          ],
          provider
        )

        const {
          main,
          mandate,
          tokens: [rToken, stToken, ...collaterals],
        } = await getRTokenMeta([address, stTokenAddress, ...basket], provider)

        const logo = rtokens[address]?.logo
          ? require(`@lc-labs/rtokens/images/${rtokens[address].logo}`)
          : '/svgs/default.svg'

        return updateToken({
          ...rToken,
          stToken,
          collaterals,
          main,
          logo,
          mandate,
          unlisted: !rtokens[rToken.address],
          meta: rtokens[rToken.address],
        })
      } catch (e) {
        console.error('Error fetching token info', e)
        if (windowVisible) {
          error('Network Error', 'Error fetching token information')
        }
      }
    },
    []
  )

  const getUserRole = useCallback(
    async (
      provider: Web3Provider,
      mainAddress: string,
      accountAddress: string
    ) => {
      try {
        const callParams = {
          abi: MainInterface,
          address: mainAddress,
          method: 'hasRole',
        }

        const [isOwner, isPauser, isShortFreezer, isLongFreezer] =
          await promiseMulticall(
            [
              {
                ...callParams,
                args: [
                  ethers.utils.formatBytes32String('OWNER'),
                  accountAddress,
                ],
              },
              {
                ...callParams,
                args: [
                  ethers.utils.formatBytes32String('PAUSER'),
                  accountAddress,
                ],
              },
              {
                ...callParams,
                args: [
                  ethers.utils.formatBytes32String('SHORT_FREEZER'),
                  accountAddress,
                ],
              },
              {
                ...callParams,
                args: [
                  ethers.utils.formatBytes32String('LONG_FREEZER'),
                  accountAddress,
                ],
              },
            ],
            provider
          )

        updateAccountRole({
          owner: isOwner,
          pauser: isPauser,
          shortFreezer: isShortFreezer,
          longFreezer: isLongFreezer,
        })
      } catch (e) {
        console.error('Error fetching user role', e)
      }
    },
    []
  )

  useEffect(() => {
    const token = isAddress(currentAddress ?? '')

    if (token && token !== selectedAddress) {
      setSelectedToken(token)
    }
  }, [currentAddress])

  useEffect(() => {
    if (selectedAddress && provider) {
      getTokenMeta(selectedAddress, provider)
    }
  }, [provider, selectedAddress])

  useEffect(() => {
    if (selectedAddress) {
      resetMetrics()
    }
  }, [selectedAddress])

  // Checks rToken status on every block
  useEffect(() => {
    if (provider && blockNumber && mainAddress) {
      setTokenStatus(mainAddress, provider)
    } else {
      updateTokenStatus(RTOKEN_STATUS.SOUND)
    }
  }, [blockNumber, mainAddress])

  // User role
  useEffect(() => {
    if (provider) {
      if (!mainAddress || !account) {
        updateAccountRole({
          owner: false,
          shortFreezer: false,
          longFreezer: false,
          pauser: false,
        })
      } else {
        getUserRole(provider, mainAddress, account)
      }
    }
  }, [mainAddress, account, blockNumber])

  useEffect(() => {
    // Use mainAddress to validate we have an rToken selected
    if (mainAddress && provider) {
      getBackingDistribution(selectedAddress, provider)
    }
  }, [blockNumber, mainAddress])

  useEffect(() => {
    if (data) {
      // TODO: Repeated logic, encapsulate in a diff place
      let tokenApy = 0
      let stakingApy = 0

      const recentRate = data.rToken?.recentRate[0]
      const lastRate = data.rToken?.lastRate[0]

      if (
        recentRate &&
        lastRate &&
        recentRate.timestamp !== lastRate.timestamp
      ) {
        ;[tokenApy, stakingApy] = calculateApy(recentRate, lastRate)
      }

      updateApy({ tokenApy, stakingApy })
    }
  }, [data])

  return null
}

export default ReserveTokenUpdater
