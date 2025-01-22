import ProposalDescriptionForm from '@/components/governance/proposal-description-form'
import { proposalDescriptionAtom } from '../atoms'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

const ConfirmBasketProposal = () => {
  const setDescription = useSetAtom(proposalDescriptionAtom)

  useEffect(() => {
    return () => {
      setDescription(undefined)
    }
  }, [])

  return (
    <div className="bg-secondary rounded-3xl p-1">
      <ProposalDescriptionForm onChange={setDescription} />
    </div>
  )
}

export default ConfirmBasketProposal
