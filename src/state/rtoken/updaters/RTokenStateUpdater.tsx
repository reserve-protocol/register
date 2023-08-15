import BasketHandler from 'abis/BasketHandler'
import CollateralAbi from 'abis/CollateralAbi'
import ERC20 from 'abis/ERC20'
import Main from 'abis/Main'
import MainLegacy from 'abis/MainLegacy'
import RToken from 'abis/RToken'
import StRSR from 'abis/StRSR'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import {
  rTokenAssetsAtom,
  rTokenCollateralStatusAtom,
  rTokenContractsAtom,
  selectedRTokenAtom,
} from 'state/atoms'
import { VERSION } from 'utils/constants'
import { Address, formatEther } from 'viem'
import { useContractReads } from 'wagmi'
import { rTokenStateAtom } from '../atoms/rTokenStateAtom'
import { useSearchParams } from 'react-router-dom'
import { isAddress } from 'utils'

type StateMulticallResult = {
  data:
    | [
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        boolean,
        boolean,
        boolean,
        boolean | undefined
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
  const contracts = useAtomValue(rTokenContractsAtom)
  const assets = useAtomValue(rTokenAssetsAtom)
  // Setters
  const setState = useSetAtom(rTokenStateAtom)
  const setCollateralStatus = useSetAtom(rTokenCollateralStatusAtom)
  const setRToken = useSetAtom(selectedRTokenAtom)
  const [searchParams] = useSearchParams()

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
        functionName: 'redemptionAvailable', // bigint
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
    if (contracts.main.version !== VERSION) {
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

    return commonCalls
  }, [contracts])

  // Type result manually, data inferring doesn't work with conditional calls
  const { data: rTokenState }: StateMulticallResult = useContractReads({
    contracts: calls,
    watch: true,
    allowFailure: false,
  })

  const { data: collateralStatus }: { data: (0 | 1 | 2)[] | undefined } =
    useContractReads({
      contracts:
        rToken && assets
          ? rToken.collaterals.map((c) => ({
              address: assets[c.address].address as Address,
              abi: CollateralAbi,
              functionName: 'status',
            }))
          : [],
      watch: true,
      allowFailure: false,
    })

  useEffect(() => {
    if (rTokenState?.length) {
      const [
        tokenSupply,
        stTokenSupply,
        exchangeRate,
        issuanceAvailable,
        redemptionAvailable,
        nonce,
        isCollaterized,
        frozen,
        tradingPaused,
        issuancePaused,
      ] = rTokenState

      setState({
        tokenSupply: +formatEther(tokenSupply),
        stTokenSupply: +formatEther(stTokenSupply),
        exchangeRate: +formatEther(exchangeRate),
        issuanceAvailable: +formatEther(issuanceAvailable),
        redemptionAvailable: +formatEther(redemptionAvailable),
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
      (collateralStatus || []).reduce((prev, status, index) => {
        prev[rToken?.collaterals[index]?.address ?? ''] = status

        return prev
      }, {} as { [x: string]: 0 | 1 | 2 })
    )
  }, [collateralStatus])

  useEffect(() => {
    const token = isAddress(searchParams.get('token') || '')

    if (token !== rToken?.address) {
      setRToken(token)
    }
  }, [searchParams.get('token')])

  return null
}

export default RTokenStateUpdater
