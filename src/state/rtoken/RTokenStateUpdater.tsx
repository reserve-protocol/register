import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { BasketHandlerInterface, FacadeInterface, MainInterface } from 'abis'
import { ethers } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import useBlockNumber from 'hooks/useBlockNumber'
import { useContractCall } from 'hooks/useCall'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  basketNonceAtom,
  rTokenCollateralDist,
  rTokenContractsAtom,
  rTokenDistributionAtom,
  rTokenStatusAtom,
} from 'state/atoms'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { truncateDecimals } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'

/**
 * Fetchs RToken state variables that could change block by block
 *
 * ? Fetch block by block / when rToken changes
 */
const RTokenStateUpdater = () => {
  const rToken = useRToken()
  const updateTokenStatus = useSetAtom(rTokenStatusAtom)
  const setDistribution = useSetAtom(rTokenDistributionAtom)
  const setCollateralDist = useSetAtom(rTokenCollateralDist)
  const setBasketNonce = useSetAtom(basketNonceAtom)
  const { provider, chainId } = useWeb3React()
  const blockNumber = useBlockNumber()
  const contracts = useAtomValue(rTokenContractsAtom)

  const { value } = useContractCall(
    contracts.basketHandler && {
      abi: BasketHandlerInterface,
      address: contracts.basketHandler,
      method: 'nonce',
      args: [],
    }
  ) || { value: [0], error: null }
  const basketNonce = value ? value[0] : 0

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
          backing: Math.min(100, Math.ceil(Number(formatEther(backing)) * 100)),
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
    }
  }, [rToken?.address, blockNumber])

  useEffect(() => {
    if (basketNonce) {
      setBasketNonce(basketNonce)
    }
  }, [basketNonce])

  useEffect(() => {
    if (
      rToken?.address &&
      provider &&
      blockNumber &&
      rToken.main &&
      chainId === CHAIN_ID
    ) {
      getBackingDistribution(rToken.address, provider)
    }
  }, [rToken?.address, !!blockNumber, chainId])

  return null
}

export default RTokenStateUpdater
