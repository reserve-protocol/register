import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import {
  BasketHandlerInterface,
  CollateralInterface,
  ERC20Interface,
  FacadeInterface,
  RTokenInterface,
  StRSRInterface,
} from 'abis'
import { ethers } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import useBlockNumber from 'hooks/useBlockNumber'
import { useContractCall } from 'hooks/useCall'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  basketNonceAtom,
  maxIssuanceAtom,
  maxRedemptionAtom,
  rTokenCollateralAssetsAtom,
  rTokenCollateralDist,
  rTokenCollateralStatusAtom,
  rTokenContractsAtom,
  rTokenDistributionAtom,
  rTokenStatusAtom,
  rTokenTotalSupplyAtom,
  rsrExchangeRateAtom,
  stRSRSupplyAtom,
} from 'state/atoms'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { truncateDecimals } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'

// ## System States

// - `tradingPaused`: all interactions disabled EXCEPT ERC20 functions + RToken.issue + RToken.redeem + StRSR.stake + StRSR.payoutRewards
// - `issuancePaused`: all interactions enabled EXCEPT RToken.issue
// - `frozen`: all interactions disabled EXCEPT ERC20 functions + StRSR.stake

/**
 * Fetchs RToken state variables that could change block by block
 *
 * ? Fetch block by block / when rToken changes
 */
const RTokenStateUpdater = () => {
  const rToken = useRToken()
  const assets = useAtomValue(rTokenCollateralAssetsAtom)
  const updateTokenStatus = useSetAtom(rTokenStatusAtom)
  const setDistribution = useSetAtom(rTokenDistributionAtom)
  const setExchangeRate = useSetAtom(rsrExchangeRateAtom)
  const setMaxIssuance = useSetAtom(maxIssuanceAtom)
  const setMaxRedemption = useSetAtom(maxRedemptionAtom)
  const setCollateralDist = useSetAtom(rTokenCollateralDist)
  const setBasketNonce = useSetAtom(basketNonceAtom)
  const setSupply = useSetAtom(rTokenTotalSupplyAtom)
  const setStaked = useSetAtom(stRSRSupplyAtom)
  const setCollateralStatus = useSetAtom(rTokenCollateralStatusAtom)
  const { provider, chainId } = useWeb3React()
  const blockNumber = useBlockNumber()
  const contracts = useAtomValue(rTokenContractsAtom)

  const { value } = useContractCall(
    contracts?.basketHandler && {
      abi: BasketHandlerInterface,
      address: contracts.basketHandler.address,
      method: 'nonce',
      args: [],
    }
  ) || { value: [0], error: null }
  const basketNonce = value ? value[0] : 0

  // TODO: Finish
  const getTokenStatus = useCallback(
    async (mainAddress: string, provider: Web3Provider) => {
      try {
        // const [isPaused, isFrozen] = await promiseMulticall(
        //   [
        //     {
        //       abi: MainInterface,
        //       address: mainAddress,
        //       args: [],
        //       method: 'paused',
        //     },
        //     {
        //       abi: MainInterface,
        //       address: mainAddress,
        //       args: [],
        //       method: 'frozen',
        //     },
        //   ],
        //   provider
        // )
        // updateTokenStatus({ paused: isPaused, frozen: isFrozen })
      } catch (e) {
        console.error('Error getting token status', e)
      }
    },
    []
  )

  const getCollateralStatus = async () => {
    if (
      rToken &&
      !rToken.isRSV &&
      assets.length &&
      provider &&
      contracts?.assetRegistry
    ) {
      try {
        const status = await promiseMulticall(
          assets.map((asset) => ({
            address: asset,
            abi: CollateralInterface,
            method: 'status',
            args: [],
          })),
          provider
        )

        const collateralStatusMap: { [x: string]: 0 | 1 | 2 } = {}

        for (let i = 0; i < status.length; i++) {
          collateralStatusMap[rToken.collaterals[i]?.address || ''] = status[i]
        }

        setCollateralStatus(collateralStatusMap)
      } catch (e) {
        console.error('error fetching status', e)
      }
    }
  }

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

  const getTokenMetrics = useCallback(
    async (
      rTokenAddress: string,
      stRSRAddress: string,
      provider: Web3Provider
    ) => {
      try {
        const [
          tokenSupply,
          stTokenSupply,
          exchangeRate,
          issuanceAvailable,
          redemptionAvailable,
        ] = await promiseMulticall(
          [
            {
              abi: ERC20Interface,
              method: 'totalSupply',
              args: [],
              address: rTokenAddress,
            },
            {
              abi: ERC20Interface,
              method: 'totalSupply',
              args: [],
              address: stRSRAddress,
            },
            {
              abi: StRSRInterface,
              method: 'exchangeRate',
              args: [],
              address: stRSRAddress,
            },
            {
              abi: RTokenInterface,
              method: 'issuanceAvailable',
              args: [],
              address: rTokenAddress,
            },
            {
              abi: RTokenInterface,
              method: 'redemptionAvailable',
              args: [],
              address: rTokenAddress,
            },
          ],
          provider
        )
        setSupply(formatEther(tokenSupply))
        setStaked(formatEther(stTokenSupply))
        setExchangeRate(+formatEther(exchangeRate))
        setMaxIssuance(+formatEther(issuanceAvailable))
        setMaxRedemption(+formatEther(redemptionAvailable))
      } catch (e) {
        console.error('Error fetching exchange rate', e)
      }
    },
    []
  )

  useEffect(() => {
    if (provider && blockNumber && rToken?.main && chainId === CHAIN_ID) {
      getTokenStatus(rToken.main, provider)
      getCollateralStatus()
      if (rToken.stToken?.address) {
        getTokenMetrics(rToken.address, rToken.stToken.address, provider)
      }
    }
  }, [rToken?.main, blockNumber])

  useEffect(() => {
    getCollateralStatus()
  }, [contracts?.assetRegistry.address, JSON.stringify(assets), blockNumber])

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
