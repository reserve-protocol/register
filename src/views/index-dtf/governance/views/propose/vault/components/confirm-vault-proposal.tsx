import { useAtomValue, useSetAtom } from 'jotai'
import { proposalDescriptionAtom, vaultProposalCalldatasAtom } from '../atoms'
import ProposalDescriptionForm from '@/components/governance/proposal-description-form'
import { useEffect } from 'react'

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

  console.log('calldatas', calldatas)

  return <div>preview!!!</div>
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
