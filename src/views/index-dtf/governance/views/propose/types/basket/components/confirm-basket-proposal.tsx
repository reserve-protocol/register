import ProposalDescriptionForm from '@/components/governance/proposal-description-form'
import {
  indexDTFBasketAtom,
  indexDTFBasketSharesAtom,
  iTokenAddressAtom,
} from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  basketProposalCalldatasAtom,
  priceMapAtom,
  proposalDescriptionAtom,
} from '../atoms'
import BasketProposalPreview from './proposal-basket-preview'

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
  const calldatas = useAtomValue(basketProposalCalldatasAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const shares = useAtomValue(indexDTFBasketSharesAtom)
  const prices = useAtomValue(priceMapAtom)
  const address = useAtomValue(iTokenAddressAtom)

  return (
    <BasketProposalPreview
      calldatas={calldatas}
      basket={basket}
      shares={shares}
      prices={prices}
      address={address}
    />
  )
}

const ConfirmBasketProposal = () => {
  return (
    <div className="flex flex-col gap-1 bg-secondary rounded-3xl p-1">
      <ProposalDescription />
      <ProposalPreview />
    </div>
  )
}

export default ConfirmBasketProposal
