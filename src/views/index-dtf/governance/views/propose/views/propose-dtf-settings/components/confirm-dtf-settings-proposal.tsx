import { useAtomValue, useSetAtom } from 'jotai'
import {
  dtfSettingsProposalDataAtom,
  isProposalConfirmedAtom,
  proposalDescriptionAtom,
} from '../atoms'
import ProposalDescriptionForm from '@/components/governance/proposal-description-form'
import { useEffect } from 'react'
import GovernanceProposalPreview from '@/views/index-dtf/governance/components/governance-proposal-preview'

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

const ProposalPreview = () => {
  const proposalData = useAtomValue(dtfSettingsProposalDataAtom)

  return (
    <div className="flex flex-col gap-4">
      <GovernanceProposalPreview
        targets={proposalData?.targets}
        calldatas={proposalData?.calldatas}
      />
    </div>
  )
}

const ConfirmDTFSettingsProposal = () => {
  return (
    <div className="flex flex-col gap-1 bg-secondary rounded-3xl p-1">
      <ProposalDescription />
      <ProposalPreview />
    </div>
  )
}

export default ConfirmDTFSettingsProposal
