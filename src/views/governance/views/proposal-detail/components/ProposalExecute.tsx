import { t } from '@lingui/macro'
import Governance from 'abis/Governance'
import TransactionButton from 'components/button/TransactionButton'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom } from 'state/atoms'
import { canExecuteAtom, proposalTxArgsAtom } from '../atom'

const ProposalExecute = () => {
  const governance = useAtomValue(rTokenGovernanceAtom)
  const canExecute = useAtomValue(canExecuteAtom)

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

  if (!canExecute || status === 'success') {
    return null
  }

  return (
    <TransactionButton
      small
      loading={isMining || isLoading}
      mining={isMining}
      ml="auto"
      disabled={!isReady}
      onClick={write}
      text={t`Execute proposal`}
    />
  )
}

export default ProposalExecute
