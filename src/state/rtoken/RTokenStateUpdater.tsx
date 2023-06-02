import { Web3Provider } from '@ethersproject/providers'
import {
  BasketHandlerInterface,
  CollateralInterface,
  ERC20Interface,
  RTokenInterface,
  StRSRInterface,
} from 'abis'
import { formatEther } from 'ethers/lib/utils'
import useBlockNumber from 'hooks/useBlockNumber'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  basketNonceAtom,
  getValidWeb3Atom,
  maxIssuanceAtom,
  maxRedemptionAtom,
  rTokenAssetsAtom,
  rTokenCollateralStatusAtom,
  rTokenContractsAtom,
  rTokenStatusAtom,
  rTokenTotalSupplyAtom,
  rsrExchangeRateAtom,
  stRSRSupplyAtom,
} from 'state/atoms'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { ContractCall } from 'types'

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
  const assets = useAtomValue(rTokenAssetsAtom)
  const updateTokenStatus = useSetAtom(rTokenStatusAtom)
  const setExchangeRate = useSetAtom(rsrExchangeRateAtom)
  const setMaxIssuance = useSetAtom(maxIssuanceAtom)
  const setMaxRedemption = useSetAtom(maxRedemptionAtom)
  const setBasketNonce = useSetAtom(basketNonceAtom)
  const setSupply = useSetAtom(rTokenTotalSupplyAtom)
  const setStaked = useSetAtom(stRSRSupplyAtom)
  const setCollateralStatus = useSetAtom(rTokenCollateralStatusAtom)
  const setBackingCollateralStatus = useSetAtom(rTokenCollateralStatusAtom)
  const blockNumber = useBlockNumber()
  const contracts = useAtomValue(rTokenContractsAtom)
  const { provider } = useAtomValue(getValidWeb3Atom)

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
      assets &&
      provider &&
      contracts?.assetRegistry
    ) {
      try {
        const [basketNonce, isCollaterized, ...status] = await promiseMulticall(
          [
            {
              abi: BasketHandlerInterface,
              address: contracts.basketHandler.address,
              method: 'nonce',
              args: [],
            },
            {
              abi: BasketHandlerInterface,
              address: contracts.basketHandler.address,
              args: [],
              method: 'fullyCollateralized',
            },
            ...rToken.collaterals.map(
              (collateral) =>
                ({
                  address: assets[collateral.address]?.address ?? '',
                  abi: CollateralInterface,
                  method: 'status',
                  args: [],
                } as ContractCall)
            ),
          ],
          provider
        )

        const collateralStatusMap: { [x: string]: 0 | 1 | 2 } = {}

        for (let i = 0; i < status.length; i++) {
          collateralStatusMap[rToken.collaterals[i]?.address || ''] = status[i]
        }

        setCollateralStatus(collateralStatusMap)
        setBackingCollateralStatus(isCollaterized)
        setBasketNonce(basketNonce)
      } catch (e) {
        console.error('error fetching status', e)
      }
    }
  }

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
    if (provider && blockNumber && rToken?.main) {
      getTokenStatus(rToken.main, provider)
      getCollateralStatus()
      if (rToken.stToken?.address) {
        getTokenMetrics(rToken.address, rToken.stToken.address, provider)
      }
    }
  }, [rToken?.main, blockNumber])

  return null
}

export default RTokenStateUpdater
