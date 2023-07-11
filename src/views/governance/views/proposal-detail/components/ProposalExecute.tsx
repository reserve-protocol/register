import { t } from '@lingui/macro'
import Governance from 'abis/Governance'
import TransactionButton from 'components/button/TransactionButton'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { blockAtom, rTokenGovernanceAtom } from 'state/atoms'
import { proposalDetailAtom, proposalTxArgsAtom } from '../atom'

const ProposalExecute = () => {
  const blockNumber = useAtomValue(blockAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)
  const proposal = useAtomValue(proposalDetailAtom)
  const canExecute =
    blockNumber &&
    proposal?.executionStartBlock &&
    proposal?.executionStartBlock <= blockNumber

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
