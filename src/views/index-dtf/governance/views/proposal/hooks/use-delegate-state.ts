import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Address, erc20Abi, zeroAddress } from 'viem'
import { useReadContracts } from 'wagmi'
import { accountVotesAtom } from '../atom'

const useDelegateState = () => {
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)
  const dtf = useAtomValue(indexDTFAtom)

  const { votePower = '0.0', vote } = useAtomValue(accountVotesAtom)
  const { data } = useReadContracts({
    contracts: [
      {
        address: dtf?.stToken?.id ?? '0x',
        abi: erc20Abi,
        functionName: 'balanceOf',
        chainId,
        args: [account ?? '0x'],
      },
      {
        address: dtf?.stToken?.id ?? '0x',
        abi: dtfIndexStakingVault,
        functionName: 'delegates',
        chainId,
        args: [account ?? '0x'],
      },
    ],
    allowFailure: false,
    query: {
      enabled: !!account && !!dtf?.stToken?.id,
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
      hasNoDelegates,
      hasUndelegatedBalance,
    }
  }, [hasNoDelegates, hasUndelegatedBalance])
}

export default useDelegateState
