import ProposalDescriptionForm from '@/components/governance/proposal-description-form'
import {
  basketProposalCalldatasAtom,
  priceMapAtom,
  proposalDescriptionAtom,
} from '../atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Hex } from 'viem'
import { Token } from '@/types'
import BasketProposalPreview from './proposal-basket-preview'
import {
  indexDTFBasketAtom,
  indexDTFBasketSharesAtom,
  iTokenAddressAtom,
} from '@/state/dtf/atoms'

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

  console.log('calldatas', calldatas)

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
