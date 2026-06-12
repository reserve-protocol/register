import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useIndexDtfVoterState } from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { zeroAddress } from 'viem'
import { accountVotesAtom } from '../atom'

const useDelegateState = () => {
  const account = useAtomValue(walletAtom)
  const dtf = useAtomValue(indexDTFAtom)

  const { votePower = '0.0', vote } = useAtomValue(accountVotesAtom)
  const params =
    account && dtf?.stToken?.id
      ? {
          chainId: dtf.chainId,
          stToken: dtf.stToken.id,
          account,
        }
      : undefined
  const { data } = useIndexDtfVoterState(params, { refetchInterval: 30_000 })

  const hasNoDelegates = !data?.delegate || data?.delegate === zeroAddress

  const hasUndelegatedBalance = Boolean(
    !!account &&
      votePower &&
      !Number(votePower) &&
      !!data?.balance.raw &&
      hasNoDelegates
  )

  return useMemo(() => {
    return {
      hasNoDelegates,
      hasUndelegatedBalance,
    }
  }, [hasNoDelegates, hasUndelegatedBalance])
}

export default useDelegateState
