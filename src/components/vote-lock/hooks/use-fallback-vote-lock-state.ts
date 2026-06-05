import { useQuery } from '@tanstack/react-query'
import {
  readVoteLockDelegates,
  readVoteLockMaxWithdraw,
  readVoteLockOptimisticDelegates,
  readVoteLockOptimisticVotes,
  readVoteLockUnderlyingAllowance,
  readVoteLockUnderlyingBalance,
  readVoteLockUnstakingDelay,
  useDtfSdk,
  type Amount,
} from '@reserve-protocol/react-sdk'
import { type Address, formatUnits } from 'viem'
import type { StTokenExtended, VoteLockDrawerState } from '../atoms'

const mapAmount = (raw: bigint, decimals = 18): Amount => ({
  raw,
  formatted: formatUnits(raw, decimals),
})

export const useFallbackVoteLockState = ({
  stToken,
  account,
  enabled = true,
}: {
  stToken: StTokenExtended | undefined
  account: Address | null | undefined
  enabled?: boolean
}) => {
  const sdk = useDtfSdk()

  return useQuery({
    queryKey: [
      'vote-lock-state-fallback',
      stToken?.id,
      stToken?.chainId,
      account,
    ],
    enabled: enabled && !!stToken && !!account,
    queryFn: async (): Promise<VoteLockDrawerState> => {
      if (!stToken || !account) {
        throw new Error('Missing vote-lock state params')
      }

      const [
        balance,
        allowance,
        delegate,
        maxWithdraw,
        unstakingDelay,
        prices,
      ] = await Promise.all([
        readVoteLockUnderlyingBalance(sdk.client, {
          chainId: stToken.chainId,
          underlying: stToken.underlying.address,
          account,
        }),
        readVoteLockUnderlyingAllowance(sdk.client, {
          chainId: stToken.chainId,
          underlying: stToken.underlying.address,
          stToken: stToken.id,
          account,
        }),
        readVoteLockDelegates(sdk.client, {
          chainId: stToken.chainId,
          stToken: stToken.id,
          account,
        }),
        readVoteLockMaxWithdraw(sdk.client, {
          chainId: stToken.chainId,
          stToken: stToken.id,
          account,
        }),
        readVoteLockUnstakingDelay(sdk.client, {
          chainId: stToken.chainId,
          stToken: stToken.id,
        }),
        sdk.client.api
          .getTokenPrices({
            chainId: stToken.chainId,
            addresses: [stToken.underlying.address],
          })
          .catch(() => []),
      ])

      let optimisticDelegate: Address | null = null
      let optimisticVotingPower: Amount | null = null

      const [delegateResult, votesResult] = await Promise.allSettled([
        readVoteLockOptimisticDelegates(sdk.client, {
          chainId: stToken.chainId,
          stToken: stToken.id,
          account,
        }),
        readVoteLockOptimisticVotes(sdk.client, {
          chainId: stToken.chainId,
          stToken: stToken.id,
          account,
        }),
      ])

      optimisticDelegate =
        delegateResult.status === 'fulfilled' ? delegateResult.value : null
      optimisticVotingPower =
        votesResult.status === 'fulfilled'
          ? mapAmount(votesResult.value, stToken.token.decimals)
          : null

      return {
        underlyingBalance: mapAmount(balance, stToken.underlying.decimals),
        underlyingAllowance: mapAmount(allowance, stToken.underlying.decimals),
        delegate,
        optimisticDelegate,
        maxWithdraw: mapAmount(maxWithdraw, stToken.underlying.decimals),
        optimisticVotingPower,
        hasOptimisticVotingPower: (optimisticVotingPower?.raw ?? 0n) > 0n,
        unstakingDelay,
        ...(prices[0] ? { underlyingPrice: prices[0].price } : {}),
      }
    },
  })
}
