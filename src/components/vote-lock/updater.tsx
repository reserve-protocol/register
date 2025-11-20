import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import { useAssetPrice } from '@/hooks/useAssetPrices'
import { useWatchReadContract } from '@/hooks/useWatchReadContract'
import { walletAtom } from '@/state/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Address, zeroAddress } from 'viem'
import { useBalance } from 'wagmi'
import {
  currentDelegateAtom,
  delegateAtom,
  stTokenAtom,
  underlyingBalanceAtom,
  underlyingStTokenPriceAtom,
  unlockBalanceRawAtom,
} from './atoms'

const Updater = () => {
  const wallet = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)
  const setUnderlyingPrice = useSetAtom(underlyingStTokenPriceAtom)
  const setUnderlyingBalance = useSetAtom(underlyingBalanceAtom)
  const setUnlockBalanceRaw = useSetAtom(unlockBalanceRawAtom)
  const setCurrentDelegate = useSetAtom(currentDelegateAtom)
  const setDelegate = useSetAtom(delegateAtom)

  // Fetch price data
  const { data: priceResponse } = useAssetPrice(
    stToken?.underlying.address,
    stToken?.chainId
  )

  // Fetch balance data
  const { data: balanceData } = useBalance({
    address: wallet ?? undefined,
    token: stToken?.underlying.address as Address,
    chainId: stToken?.chainId,
    enabled: !!wallet && !!stToken,
  })
  const balance = balanceData?.value

  // Fetch unlock balance
  const { data: unlockBalanceRaw } = useWatchReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'maxWithdraw',
    address: stToken?.id as Address,
    args: [wallet ?? zeroAddress],
    chainId: stToken?.chainId,
    query: { enabled: !!wallet && !!stToken },
  })

  // Fetch delegation data
  const { data: delegates } = useWatchReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'delegates',
    address: stToken?.id as Address,
    args: [wallet ?? zeroAddress],
    chainId: stToken?.chainId,
    query: { enabled: !!wallet && !!stToken },
  })

  // Update price
  useEffect(() => {
    if (priceResponse?.[0]?.price) {
      setUnderlyingPrice(priceResponse[0].price)
    }
  }, [priceResponse, setUnderlyingPrice])

  // Update balance
  useEffect(() => {
    setUnderlyingBalance(balance)
  }, [balance, setUnderlyingBalance])

  // Update unlock balance
  useEffect(() => {
    setUnlockBalanceRaw(unlockBalanceRaw)
  }, [unlockBalanceRaw, setUnlockBalanceRaw])

  // Update delegation
  useEffect(() => {
    const delegateOrSelf =
      delegates && delegates !== zeroAddress ? delegates : (wallet ?? '')
    setDelegate(delegateOrSelf)
    setCurrentDelegate(delegateOrSelf)
  }, [delegates, wallet, setDelegate, setCurrentDelegate])

  return null
}

export default Updater