import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { FacadeInterface, MainInterface } from 'abis'
import { ethers } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import useBlockNumber from 'hooks/useBlockNumber'
import useRToken from 'hooks/useRToken'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  rTokenCollateralDist,
  rTokenDistributionAtom,
  rTokenStatusAtom,
} from 'state/atoms'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { truncateDecimals } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'

const StateUpdater = () => {
  const rToken = useRToken()
  const updateTokenStatus = useSetAtom(rTokenStatusAtom)
  const setDistribution = useSetAtom(rTokenDistributionAtom)
  const setCollateralDist = useSetAtom(rTokenCollateralDist)
  const { provider, chainId } = useWeb3React()
  const blockNumber = useBlockNumber()

  const getTokenStatus = useCallback(
    async (mainAddress: string, provider: Web3Provider) => {
      try {
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

        updateTokenStatus({ paused: isPaused, frozen: isFrozen })
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

        const [
          { erc20s, uoaShares, targets },
          { backing, overCollateralization },
        ] = await promiseMulticall(
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
          staked: Math.ceil(Number(formatEther(overCollateralization)) * 100),
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

  useEffect(() => {
    if (
      rToken?.address &&
      provider &&
      blockNumber &&
      rToken.main &&
      chainId === CHAIN_ID
    ) {
      getTokenStatus(rToken.main, provider)
      getBackingDistribution(rToken.address, provider)
    }
  }, [rToken?.address, blockNumber])

  return null
}

export default StateUpdater
