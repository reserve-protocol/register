import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { MainInterface } from 'abis'
import { ethers } from 'ethers'
import { gql } from 'graphql-request'
import useBlockNumber from 'hooks/useBlockNumber'
import useQuery from 'hooks/useQuery'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { calculateApy, isAddress } from 'utils'
import {
  accountRoleAtom,
  blockTimestampAtom, rTokenMainAtom,
  rTokenYieldAtom,
  searchParamAtom,
  selectedRTokenAtom,
  walletAtom
} from './atoms'
import { tokenMetricsAtom } from './metrics/atoms'
import { promiseMulticall } from './web3/lib/multicall'

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
// Try to grab the token meta from theGraph
// If it fails, get it from the blockchain (only whitelisted tokens)
// TODO: Loading state?
const ReserveTokenUpdater = () => {
  const [selectedAddress, setSelectedToken] = useAtom(selectedRTokenAtom)
  const blockNumber = useBlockNumber()
  const mainAddress = useAtomValue(rTokenMainAtom)
  const updateApy = useSetAtom(rTokenYieldAtom)
  const resetMetrics = useResetAtom(tokenMetricsAtom)
  const updateAccountRole = useSetAtom(accountRoleAtom)
  const currentAddress = useAtomValue(searchParamAtom('token'))
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
    if (selectedAddress) {
      resetMetrics()
    }
  }, [selectedAddress])

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
