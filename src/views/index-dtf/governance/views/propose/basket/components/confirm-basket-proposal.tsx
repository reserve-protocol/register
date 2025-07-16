import ProposalDescriptionForm from '@/components/governance/proposal-description-form'
import RebalancePreview from '@/views/index-dtf/governance/components/proposal-preview/rebalance-preview'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  isProposalConfirmedAtom,
  proposalDescriptionAtom,
  basketProposalCalldatasAtom,
} from '../atoms'

const ProposalDescription = () => {
  const setDescription = useSetAtom(proposalDescriptionAtom)
  const setConfirmed = useSetAtom(isProposalConfirmedAtom)

  useEffect(() => {
    return () => {
      setDescription(undefined)
    }
  }, [])

  return (
    <ProposalDescriptionForm
      onChange={setDescription}
      onBack={() => setConfirmed(false)}
    />
  )
}

const ConfirmBasketProposal = () => {
  const calldatas = useAtomValue(basketProposalCalldatasAtom)

  return (
    <div className="flex flex-col gap-1 bg-secondary rounded-3xl p-1">
      <ProposalDescription />
      <RebalancePreview calldatas={calldatas} />
    </div>
  )
}

export default ConfirmBasketProposal
