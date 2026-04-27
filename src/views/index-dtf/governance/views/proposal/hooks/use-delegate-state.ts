import votesTokenAbi from '@/abis/votes-token'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Address, erc20Abi, zeroAddress } from 'viem'
import { useReadContracts } from 'wagmi'
import { accountVotesAtom } from '../atom'
import { proposalDetailAtom } from '../atom'

const useDelegateState = () => {
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)
  const proposal = useAtomValue(proposalDetailAtom)

  const { votePower = '0.0' } = useAtomValue(accountVotesAtom)
  const { data } = useReadContracts({
    contracts: [
      {
        address: proposal?.voteToken ?? '0x',
        abi: erc20Abi,
        functionName: 'balanceOf',
        chainId,
        args: [account ?? '0x'],
      },
      {
        address: proposal?.voteToken ?? '0x',
        abi: votesTokenAbi,
        functionName: proposal?.isOptimistic
          ? 'optimisticDelegates'
          : 'delegates',
        chainId,
        args: [account ?? '0x'],
      },
    ],
    allowFailure: false,
    query: {
      enabled:
        !!account &&
        !!proposal?.voteToken &&
        proposal.isOptimistic !== undefined,
      select: (data) => {
        return {
          balance: data[0] as bigint,
          delegate: data[1] as Address,
        }
      },
    },
  })

  const hasNoDelegates = !data?.delegate || data?.delegate === zeroAddress

  const hasUndelegatedBalance = Boolean(
    !!account &&
      votePower &&
      !Number(votePower) &&
      !!Number(data?.balance) &&
      hasNoDelegates
  )

  return useMemo(() => {
    return {
      balance: data?.balance ?? 0n,
      delegate: data?.delegate,
      hasNoDelegates,
      hasUndelegatedBalance,
    }
  }, [data?.balance, data?.delegate, hasNoDelegates, hasUndelegatedBalance])
}

export default useDelegateState
