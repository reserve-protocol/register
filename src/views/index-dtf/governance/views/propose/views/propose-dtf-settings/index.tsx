import { useAtomValue } from 'jotai'
import { isProposalConfirmedAtom } from './atoms'
import Updater from './updater'
import DTFSettingsProposalOverview from './components/dtf-settings-proposal-overview'
import ConfirmDTFSettingsProposal from './components/confirm-dtf-settings-proposal'
import { FormProvider, useForm } from 'react-hook-form'
import { createProposeSettingsSchema } from './form-fields'
import { zodResolver } from '@hookform/resolvers/zod'
import DTFSettingsProposalSections from './components/dtf-settings-proposal-sections'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useMemo } from 'react'

const ProposalStage = () => {
  const isConfirmed = useAtomValue(isProposalConfirmedAtom)

  if (isConfirmed) return <ConfirmDTFSettingsProposal />

  return <DTFSettingsProposalSections />
}

const ProposeDTFSettings = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const quorumDenominator = indexDTF?.ownerGovernance?.quorumDenominator

  const schema = useMemo(() => {
    return createProposeSettingsSchema(Number(quorumDenominator))
  }, [quorumDenominator])

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange', // Enable validation on every change
  })

  return (
    <FormProvider {...form}>
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-2 pr-0 lg:pr-2 pb-2 sm:pb-6 overflow-hidden">
        <ProposalStage />
        <DTFSettingsProposalOverview />
      </div>
      <Updater />
    </FormProvider>
  )
}

export default ProposeDTFSettings
