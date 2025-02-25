import { proposalDetailAtom, proposalTxArgsAtom } from '../atom'
import TransactionButton from '@/components/old/button/TransactionButton'
import { t } from '@lingui/macro'
import Governance from 'abis/Governance'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtomValue } from 'jotai'
import { rTokenGovernanceAtom } from 'state/atoms'
import { getCurrentTime } from '@/utils'
import { Address, Hex, keccak256, toBytes } from 'viem'

const canExecuteAtom = atom((get) => {
  const timestamp = getCurrentTime()
  const proposal = get(proposalDetailAtom)

  return proposal?.executionETA && proposal.executionETA <= timestamp
})

const ProposalExecute = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const canExecute = useAtomValue(canExecuteAtom)
  const deadline = proposal?.votingState.deadline
  const governor = proposal?.governor
  const txArgs = useAtomValue(proposalTxArgsAtom)

  const { write, isLoading, hash, isReady } = useContractWrite({
    abi: Governance,
    address: governor && canExecute ? governor : undefined,
    functionName: 'execute',
    value: 0n,
    args: txArgs,
  })

  const { isMining, status } = useWatchTransaction({
    hash,
    label: t`Execute proposal`,
  })

  if (!deadline || deadline > 0) return null

  return (
    <TransactionButton
      small
      loading={isMining || isLoading}
      mining={isMining}
      disabled={!isReady || !canExecute || status === 'success'}
      onClick={write}
      text={t`Execute proposal`}
      sx={{ height: '44px' }}
    />
  )
}

export default ProposalExecute
