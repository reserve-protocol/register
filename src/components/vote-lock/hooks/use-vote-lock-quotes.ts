import useDebounce from '@/hooks/useDebounce'
import {
  useIndexDtfVoteLockPreviewDeposit,
  useIndexDtfVoteLockPreviewRedeem,
} from '@reserve-protocol/react-sdk'
import { keepPreviousData } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { parseUnits } from 'viem'
import { stakingInputAtom, stTokenAtom } from '../atoms'

const QUOTE_DEBOUNCE_MS = 300

// ERC4626 previews are exact for every StakingVault: ~1:1 on legacy vaults,
// rate-adjusted on self-appreciating ones (vlRSR), so no vault-type branching.
// WHY share decimals: StakingVault has no ERC4626 decimals offset, so share
// decimals == underlying decimals — the SDK maps shareBalance/exchangeRate
// with underlying.decimals on the same assumption.
export const useLockQuote = () => {
  const stToken = useAtomValue(stTokenAtom)
  const input = useAtomValue(stakingInputAtom)
  const debouncedInput = useDebounce(input, QUOTE_DEBOUNCE_MS)
  const amount = stToken
    ? parseUnits(debouncedInput || '0', stToken.underlying.decimals)
    : 0n

  const active = !!stToken && amount > 0n
  const query = useIndexDtfVoteLockPreviewDeposit(
    active
      ? { stToken: stToken.id, chainId: stToken.chainId, amount }
      : undefined,
    // Editing an amount keeps the previous quote visible (dimmed) instead of
    // flashing a skeleton; isPlaceholderData marks it stale. The interval
    // keeps an open drawer's quote live against the drip.
    { placeholderData: keepPreviousData, refetchInterval: 15_000 }
  )

  // quotedAmount lets callers detect a quote that lags the live input
  // (debounce window) — never trust sharesOut for an amount it wasn't quoted
  // for. With keepPreviousData, also check isPlaceholderData: data may belong
  // to the previous amount entirely. When inactive (cleared input) the query
  // is disabled and would hold the old quote as a forever-stale placeholder —
  // clear it so the UI empties instead of pulsing.
  return {
    ...query,
    data: active ? query.data : undefined,
    isPlaceholderData: active && query.isPlaceholderData,
    quotedAmount: amount,
  }
}

export const useUnlockQuote = () => {
  const stToken = useAtomValue(stTokenAtom)
  const input = useAtomValue(stakingInputAtom)
  const debouncedInput = useDebounce(input, QUOTE_DEBOUNCE_MS)
  const shares = stToken
    ? parseUnits(debouncedInput || '0', stToken.token.decimals)
    : 0n

  const active = !!stToken && shares > 0n
  const query = useIndexDtfVoteLockPreviewRedeem(
    active
      ? { stToken: stToken.id, chainId: stToken.chainId, shares }
      : undefined,
    { placeholderData: keepPreviousData, refetchInterval: 15_000 }
  )

  return {
    ...query,
    data: active ? query.data : undefined,
    isPlaceholderData: active && query.isPlaceholderData,
  }
}
