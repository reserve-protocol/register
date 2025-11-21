import { useEffect } from 'react'
import { useAccount, useReadContract, useBlockNumber } from 'wagmi'
import { useSetAtom, useAtomValue } from 'jotai'
import { Address, formatUnits, zeroAddress } from 'viem'
import {
  stTokenAtom,
  rsrBalanceAtom,
  stTokenBalanceAtom,
  exchangeRateAtom,
  currentDelegateAtom,
  delegateAtom,
  isLegacyAtom,
  delegationLoadingAtom,
} from './atoms'
import { RSR_ADDRESS } from '@/utils/addresses'
import { erc20Abi } from 'viem'
import StRSR from 'abis/StRSR'
import StRSRVotes from 'abis/StRSRVotes'

const Updater = () => {
  const stToken = useAtomValue(stTokenAtom)
  const setRsrBalance = useSetAtom(rsrBalanceAtom)
  const setStTokenBalance = useSetAtom(stTokenBalanceAtom)
  const setExchangeRate = useSetAtom(exchangeRateAtom)
  const setCurrentDelegate = useSetAtom(currentDelegateAtom)
  const delegate = useAtomValue(delegateAtom)
  const setDelegate = useSetAtom(delegateAtom)
  const setIsLegacy = useSetAtom(isLegacyAtom)
  const setDelegationLoading = useSetAtom(delegationLoadingAtom)

  const { address } = useAccount()
  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { data: rsrBalance } = useReadContract({
    address: stToken?.chainId ? RSR_ADDRESS[stToken.chainId] as Address : undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!stToken,
    },
  })

  const { data: stRsrBalance } = useReadContract({
    address: stToken?.stToken.address as Address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!stToken,
    },
  })

  const { data: exchangeRateRaw } = useReadContract({
    address: stToken?.stToken.address as Address,
    abi: StRSR,
    functionName: 'exchangeRate',
    query: {
      enabled: !!stToken,
    },
  })

  const { data: version } = useReadContract({
    address: stToken?.stToken.address as Address,
    abi: StRSR,
    functionName: 'version',
    query: {
      enabled: !!stToken,
    },
  })

  const { data: currentDelegateData } = useReadContract({
    address: stToken?.stToken.address as Address,
    abi: StRSRVotes,
    functionName: 'delegates',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!stToken && version === '3.0.0',
    },
  })

  useEffect(() => {
    if (rsrBalance !== undefined) {
      setRsrBalance(rsrBalance)
    }
  }, [rsrBalance, setRsrBalance, blockNumber])

  useEffect(() => {
    if (stRsrBalance !== undefined) {
      setStTokenBalance(stRsrBalance)
    }
  }, [stRsrBalance, setStTokenBalance, blockNumber])

  useEffect(() => {
    if (exchangeRateRaw) {
      const rate = Number(formatUnits(exchangeRateRaw as bigint, 18))
      setExchangeRate(rate)
    }
  }, [exchangeRateRaw, setExchangeRate])

  useEffect(() => {
    if (!address) {
      setDelegationLoading(true)
      return
    }

    if (version === undefined) {
      setDelegationLoading(true)
      return
    }

    if (version === '3.0.0') {
      if (currentDelegateData === undefined) {
        setDelegationLoading(true)
        return
      }

      const effectiveDelegate =
        currentDelegateData && currentDelegateData !== zeroAddress
          ? (currentDelegateData as string)
          : address

      setCurrentDelegate(effectiveDelegate)

      if (!delegate) {
        setDelegate(effectiveDelegate)
      }

      setDelegationLoading(false)
    } else {
      if (!delegate) {
        setDelegate(address)
      }
      setCurrentDelegate(address)
      setDelegationLoading(false)
    }
  }, [currentDelegateData, address, delegate, version, setDelegate, setCurrentDelegate, setDelegationLoading, blockNumber])

  useEffect(() => {
    if (version !== undefined) {
      setIsLegacy(version !== '3.0.0')
    }
  }, [version, setIsLegacy])

  return null
}

export default Updater