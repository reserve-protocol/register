import {
  BasketHandlerInterface,
  CollateralInterface,
  ERC20Interface,
  MainInterface,
  RTokenInterface,
  StRSRInterface,
  _MainInterface,
} from 'abis'
import { formatEther } from 'ethers/lib/utils'
import useBlockNumber from 'hooks/useBlockNumber'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  basketNonceAtom,
  maxIssuanceAtom,
  maxRedemptionAtom,
  multicallAtom,
  rTokenAssetsAtom,
  rTokenCollateralStatusAtom,
  rTokenCollaterizedAtom,
  rTokenContractsAtom,
  rTokenStatusAtom,
  rTokenTotalSupplyAtom,
  rsrExchangeRateAtom,
  stRSRSupplyAtom,
} from 'state/atoms'
import { ContractCall } from 'types'
import { VERSION } from 'utils/constants'

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
  const setBackingCollateralStatus = useSetAtom(rTokenCollaterizedAtom)
  const blockNumber = useBlockNumber()
  const contracts = useAtomValue(rTokenContractsAtom)
  const multicall = useAtomValue(multicallAtom)

  // TODO: Finish
  const getTokenStatus = useCallback(
    async (mainAddress: string, isLegacy: boolean) => {
      if (!multicall) {
        return
      }

      try {
        const call = { abi: MainInterface, address: mainAddress, args: [] }

        if (!isLegacy) {
          const [isIssuancePaused, isTradingPaused, isFrozen] = await multicall(
            [
              {
                ...call,
                method: 'issuancePaused',
              },
              {
                ...call,
                method: 'tradingPaused',
              },
              {
                ...call,
                method: 'frozen',
              },
            ]
          )
          updateTokenStatus({
            issuancePaused: isIssuancePaused,
            tradingPaused: isTradingPaused,
            frozen: isFrozen,
          })
        } else {
          const [isPaused, isFrozen] = await multicall([
            {
              ...call,
              abi: _MainInterface,
              method: 'paused',
            },
            {
              ...call,
              abi: _MainInterface,
              method: 'frozen',
            },
          ])
          updateTokenStatus({
            issuancePaused: isPaused,
            tradingPaused: isPaused,
            frozen: isFrozen,
          })
        }
      } catch (e) {
        console.error('Error getting token status', e)
      }
    },
    [multicall]
  )

  const getCollateralStatus = async () => {
    if (
      rToken &&
      !rToken.isRSV &&
      assets &&
      multicall &&
      contracts?.assetRegistry
    ) {
      try {
        const [basketNonce, isCollaterized, ...status] = await multicall([
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
        ])

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
    async (rTokenAddress: string, stRSRAddress: string) => {
      if (!multicall) {
        return
      }

      try {
        const [
          tokenSupply,
          stTokenSupply,
          exchangeRate,
          issuanceAvailable,
          redemptionAvailable,
        ] = await multicall([
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
        ])
        setSupply(formatEther(tokenSupply))
        setStaked(formatEther(stTokenSupply))
        setExchangeRate(+formatEther(exchangeRate))
        setMaxIssuance(+formatEther(issuanceAvailable))
        setMaxRedemption(+formatEther(redemptionAvailable))
      } catch (e) {
        console.error('Error fetching exchange rate', e)
      }
    },
    [multicall]
  )

  useEffect(() => {
    if (blockNumber && contracts?.main) {
      getTokenStatus(contracts.main.address, contracts.main.version !== VERSION)
      getCollateralStatus()
      getTokenMetrics(contracts.token.address, contracts.stRSR.address)
    }
  }, [contracts, getTokenMetrics, blockNumber])

  return null
}

export default RTokenStateUpdater
