import { useAtomValue, useSetAtom } from 'jotai'
import { proposalDescriptionAtom, vaultProposalCalldatasAtom } from '../atoms'
import ProposalDescriptionForm from '@/components/governance/proposal-description-form'
import { useEffect } from 'react'
import VaultProposalPreview from './vault-proposal-preview'

const ProposalDescription = () => {
  const setDescription = useSetAtom(proposalDescriptionAtom)

  useEffect(() => {
    return () => {
      setDescription(undefined)
    }
  }, [])

  return <ProposalDescriptionForm onChange={setDescription} />
}

const ProposalPreview = () => {
  const calldatas = useAtomValue(vaultProposalCalldatasAtom)

  return <VaultProposalPreview calldatas={calldatas} />
}

const ConfirmVaultProposal = () => {
  return (
    <div className="flex flex-col gap-1 bg-secondary rounded-3xl p-1">
      <ProposalDescription />
      <ProposalPreview />
    </div>
  )
}

export default ConfirmVaultProposal
