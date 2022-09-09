import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'
import {
  ERC20Interface,
  FacadeInterface,
  MainInterface,
  RTokenInterface,
} from 'abis'
import { Facade } from 'abis/types'
import { ethers } from 'ethers'
import { gql } from 'graphql-request'
import useBlockNumber from 'hooks/useBlockNumber'
import { useFacadeContract } from 'hooks/useContract'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import useQuery from 'hooks/useQuery'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useResetAtom, useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ContractCall, ReserveToken, Token } from 'types'
import { calculateApy, isAddress } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { RTOKEN_STATUS } from 'utils/constants'
import RSV from 'utils/rsv'
import {
  accountRoleAtom,
  blockTimestampAtom,
  reserveTokensAtom,
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
): Promise<{ tokens: Token[]; main: string }> => {
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

  calls.unshift({
    abi: RTokenInterface,
    address: addresses[0],
    args: [],
    method: 'main',
  })

  const multicallResult = await promiseMulticall(calls, provider)
  const main = multicallResult.shift()

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
  const updateApy = useUpdateAtom(rTokenYieldAtom)
  const updateTokenStatus = useUpdateAtom(rTokenStatusAtom)
  const updateToken = useUpdateAtom(updateTokenAtom)
  const resetMetrics = useResetAtom(tokenMetricsAtom)
  const updateAccountRole = useUpdateAtom(accountRoleAtom)
  const setDistribution = useUpdateAtom(rTokenDistributionAtom)
  const [searchParams] = useSearchParams()
  const currentAddress = searchParams.get('token')
  const account = useAtomValue(walletAtom)
  const { provider } = useWeb3React()
  const facadeContract = useFacadeContract()
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
    async (tokenAddress: string, facade: Facade) => {
      try {
        const [backing, insurance] = await facade.backingOverview(tokenAddress)

        setDistribution({
          backing: Math.ceil(Number(formatEther(backing)) * 100),
          insurance: Math.ceil(Number(formatEther(insurance)) * 100),
        })
      } catch (e) {
        console.error('Error getting rToken backing distribution')
      }
    },
    []
  )

  const getTokenMeta = useCallback(
    async (address: string, provider: Web3Provider) => {
      const isRSV = address === RSV.address

      if (isRSV) {
        return updateToken(RSV)
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
          tokens: [rToken, stToken, ...collaterals],
        } = await getRTokenMeta([address, stTokenAddress, ...basket], provider)

        return updateToken({
          ...rToken,
          stToken,
          collaterals,
          main,
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

        const [isOwner, isPauser, isFreezer] = await promiseMulticall(
          [
            {
              ...callParams,
              args: [ethers.utils.formatBytes32String('OWNER'), accountAddress],
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
                ethers.utils.formatBytes32String('FREEZER'),
                accountAddress,
              ],
            },
          ],
          provider
        )

        updateAccountRole({
          owner: isOwner,
          pauser: isPauser,
          freezer: isFreezer,
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
    }
  }, [blockNumber, mainAddress])

  // User role
  useEffect(() => {
    if (provider) {
      if (!mainAddress) {
        updateAccountRole({ owner: false, freezer: false, pauser: false })
      } else {
        getUserRole(provider, mainAddress, account)
      }
    }
  }, [mainAddress, account, blockNumber])

  useEffect(() => {
    // Use mainAddress to validate we have an rToken selected
    if (mainAddress && facadeContract) {
      getBackingDistribution(selectedAddress, facadeContract)
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
