import { t } from '@lingui/macro'
import Governance from 'abis/Governance'
import TransactionButton from '@/components/old/button/TransactionButton'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom } from 'state/atoms'
import { proposalTxArgsAtom } from '../atom'

const ProposalQueue = () => {
  const governance = useAtomValue(rTokenGovernanceAtom)

  const { write, isLoading, hash, isReady } = useContractWrite({
    abi: Governance,
    address: governance.governor ? governance.governor : undefined,
    functionName: 'queue',
    args: useAtomValue(proposalTxArgsAtom),
  })
  const { isMining } = useWatchTransaction({
    hash,
    label: 'Queue proposal',
  })

  return (
    <TransactionButton
      fullWidth
      loading={isMining || isLoading}
      mining={isMining}
      ml="auto"
      disabled={!isReady}
      onClick={write}
      text={t`Queue proposal`}
    />
  )
}

export default ProposalQueue
