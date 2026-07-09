import ProposalDescriptionForm from '@/components/governance/proposal-description-form'
import RebalancePreview from '@/views/index-dtf/governance/components/proposal-preview/rebalance-preview'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import {
  isProposalConfirmedAtom,
  proposalDescriptionAtom,
  basketProposalCalldatasAtom,
} from '../atoms'
import ProposalTypeSelector from '../../components/proposal-type-selector'
import { indexDTFAtom } from '@/state/dtf/atoms'

const ProposalDescription = () => {
  const setDescription = useSetAtom(proposalDescriptionAtom)
  const setConfirmed = useSetAtom(isProposalConfirmedAtom)
  const calldatas = useAtomValue(basketProposalCalldatasAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const targets = useMemo(() => {
    if (!calldatas || !indexDTF?.id) return undefined

    return calldatas.map(() => indexDTF.id)
  }, [calldatas, indexDTF?.id])

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
        governance={indexDTF?.tradingGovernance}
        targets={targets}
        calldatas={calldatas}
      />
    </>
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
