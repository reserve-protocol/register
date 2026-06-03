import { useAtomValue, useSetAtom } from 'jotai'
import {
  isProposalConfirmedAtom,
  proposalDescriptionAtom,
  daoSettingsProposalDataAtom,
} from '../atoms'
import ProposalDescriptionForm from '@/components/governance/proposal-description-form'
import { useEffect } from 'react'
import GovernanceProposalPreview from '@/views/index-dtf/governance/components/governance-proposal-preview'
import ProposalTypeSelector from '../../../components/proposal-type-selector'
import { indexDTFAtom } from '@/state/dtf/atoms'

const ProposalDescription = () => {
  const setDescription = useSetAtom(proposalDescriptionAtom)
  const setConfirmed = useSetAtom(isProposalConfirmedAtom)
  const proposalData = useAtomValue(daoSettingsProposalDataAtom)
  const indexDTF = useAtomValue(indexDTFAtom)

  useEffect(() => {
    return () => {
      setDescription(undefined)
    }
  }, [])

  return (
    <>
      <ProposalDescriptionForm
        onChange={setDescription}
        onBack={() => setConfirmed(false)}
      />
      <ProposalTypeSelector
        governance={indexDTF?.stToken?.governance}
        targets={proposalData?.targets}
        calldatas={proposalData?.calldatas}
      />
    </>
  )
}

const ProposalPreview = () => {
  const proposalData = useAtomValue(daoSettingsProposalDataAtom)

  return (
    <div className="flex flex-col gap-4">
      <GovernanceProposalPreview
        targets={proposalData?.targets}
        calldatas={proposalData?.calldatas}
      />
    </div>
  )
}

const ConfirmDaoSettingsProposal = () => {
  return (
    <div className="flex flex-col gap-1 bg-secondary rounded-3xl p-1">
      <ProposalDescription />
      <ProposalPreview />
    </div>
  )
}

export default ConfirmDaoSettingsProposal
