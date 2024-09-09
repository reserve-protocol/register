import { t } from '@lingui/macro'
import Governance from 'abis/Governance'
import TransactionButton from 'components/button/TransactionButton'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom } from 'state/atoms'
import {
  canExecuteAtom,
  getProposalStateAtom,
  proposalTxArgsAtom,
} from '../atom'

const ProposalExecute = () => {
  const governance = useAtomValue(rTokenGovernanceAtom)
  const canExecute = useAtomValue(canExecuteAtom)
  const { deadline } = useAtomValue(getProposalStateAtom)

  const { write, isLoading, hash, isReady } = useContractWrite({
    abi: Governance,
    address:
      governance.governor && canExecute ? governance.governor : undefined,
    functionName: 'execute',
    value: 0n,
    args: useAtomValue(proposalTxArgsAtom),
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
