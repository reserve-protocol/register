import BasketHandler from 'abis/BasketHandler'
import CollateralAbi from 'abis/CollateralAbi'
import ERC20 from 'abis/ERC20'
import Main from 'abis/Main'
import MainLegacy from 'abis/MainLegacy'
import RToken from 'abis/RToken'
import StRSR from 'abis/StRSR'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useMemo } from 'react'
import {
  chainIdAtom,
  rTokenAssetsAtom,
  rTokenCollateralStatusAtom,
  rTokenContractsAtom,
  selectedRTokenAtom,
} from 'state/atoms'
import { VERSION } from 'utils/constants'
import { Address, formatEther } from 'viem'
import { rTokenStateAtom } from '../atoms/rTokenStateAtom'
import { useWatchReadContracts } from 'hooks/useWatchReadContract'

type StateMulticallResult = {
  data:
    | [
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        { amtRate: bigint; pctRate: bigint },
        bigint,
        { amtRate: bigint; pctRate: bigint },
        bigint,
        boolean,
        boolean,
        boolean,
        boolean | undefined,
      ]
    | undefined
}

/**
 * Fetchs RToken state variables that could change block by block
 *
 * ? Fetch block by block / when rToken changes
 */
const RTokenStateUpdater = () => {
  const rToken = useRToken()
  const rTokenAddress = useAtomValue(selectedRTokenAtom)
  const contracts = useAtomValue(rTokenContractsAtom)
  const assets = useAtomValue(rTokenAssetsAtom)
  const chainId = useAtomValue(chainIdAtom)
  // Setters
  const setState = useSetAtom(rTokenStateAtom)
  const resetState = useResetAtom(rTokenStateAtom)
  const setCollateralStatus = useSetAtom(rTokenCollateralStatusAtom)

  // RToken state multicall
  const calls = useMemo(() => {
    if (!contracts) {
      return undefined
    }

    const rTokenCall = { abi: RToken, address: contracts.token.address }
    const basketHandlerCall = {
      abi: BasketHandler,
      address: contracts.basketHandler.address,
    }
    const mainCall = { abi: Main, address: contracts.main.address }

    const commonCalls: any[] = [
      {
        ...rTokenCall,
        functionName: 'totalSupply', // bigint
      },
      {
        ...rTokenCall,
        functionName: 'basketsNeeded', // bigint
      },
      {
        abi: ERC20,
        functionName: 'totalSupply', // bigint
        address: contracts.stRSR.address,
      },
      {
        abi: StRSR,
        functionName: 'exchangeRate',
        address: contracts.stRSR.address, // bigint
      },
      {
        ...rTokenCall,
        functionName: 'issuanceAvailable', // bigint
      },
      {
        ...rTokenCall,
        functionName: 'issuanceThrottleParams',
      },
      {
        ...rTokenCall,
        functionName: 'redemptionAvailable', // bigint
      },
      {
        ...rTokenCall,
        functionName: 'redemptionThrottleParams',
      },
      {
        ...basketHandlerCall,
        functionName: 'nonce', // bigint
      },
      {
        ...basketHandlerCall,
        functionName: 'fullyCollateralized', // boolean
      },
      {
        ...mainCall,
        functionName: 'frozen', // boolean
      },
    ]

    // Legacy
    if (contracts.main.version[0] !== VERSION[0]) {
      commonCalls.push({
        ...mainCall,
        abi: MainLegacy,
        functionName: 'paused', // boolean
      })
    } else {
      commonCalls.push(
        {
          ...mainCall,
          functionName: 'tradingPaused', // boolean
        },
        {
          ...mainCall,
          functionName: 'issuancePaused', // boolean
        }
      )
    }

    return commonCalls.map((call) => ({ ...call, chainId }))
  }, [contracts, chainId])

  // Type result manually, data inferring doesn't work with conditional calls
  const { data: rTokenState }: StateMulticallResult = useWatchReadContracts({
    contracts: calls,
    allowFailure: false,
  })

  const { data: collateralStatus }: { data: (0 | 1 | 2)[] | undefined } =
    useWatchReadContracts({
      contracts:
        rToken && assets
          ? rToken.collaterals.map((c) => ({
              address: assets[c.address].address as Address,
              abi: CollateralAbi,
              functionName: 'status',
              chainId,
            }))
          : [],
      allowFailure: false,
    })

  useEffect(() => {
    if (rTokenState?.length) {
      const [
        tokenSupply,
        basketsNeeded,
        stTokenSupply,
        exchangeRate,
        issuanceAvailable,
        issuanceThrottleParams,
        redemptionAvailable,
        redemptionThrottleParams,
        nonce,
        isCollaterized,
        frozen,
        tradingPaused,
        issuancePaused,
      ] = rTokenState

      setState({
        tokenSupply: +formatEther(tokenSupply),
        basketsNeeded: +formatEther(basketsNeeded),
        stTokenSupply: +formatEther(stTokenSupply),
        exchangeRate: +formatEther(exchangeRate),
        issuanceAvailable: +formatEther(issuanceAvailable),
        issuanceThrottleAmount: Number(
          formatEther(issuanceThrottleParams.amtRate)
        ),
        issuanceThrottleRate: +formatEther(issuanceThrottleParams.pctRate),
        redemptionAvailable: +formatEther(redemptionAvailable),
        redemptionThrottleAmount: Number(
          formatEther(redemptionThrottleParams.amtRate)
        ),
        redemptionThrottleRate: +formatEther(redemptionThrottleParams.pctRate),
        basketNonce: Number(nonce),
        isCollaterized,
        tradingPaused,
        issuancePaused:
          issuancePaused !== undefined ? issuancePaused : tradingPaused, // if is undefined, used other pause
        frozen,
      })
    }
  }, [rTokenState])

  useEffect(() => {
    setCollateralStatus(
      (collateralStatus || []).reduce(
        (prev, status, index) => {
          prev[rToken?.collaterals[index]?.address ?? ''] = status

          return prev
        },
        {} as { [x: string]: 0 | 1 | 2 }
      )
    )
  }, [collateralStatus])

  useEffect(() => {
    resetState()
  }, [rTokenAddress])

  return null
}

export default RTokenStateUpdater
