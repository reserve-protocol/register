import { useAtomValue } from 'jotai'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isProposalConfirmedAtom } from './atoms'
import DaoSettingsProposalSections from './components/dao-settings-proposal-sections'
import DaoSettingsProposalOverview from './components/dao-settings-proposal-overview'
import Updater from './updater'
import ConfirmDaoSettingsProposal from './components/confirm-dao-settings-proposal'
import { createProposeDaoSettingsSchema, ProposeDaoSettings } from './form-fields'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useMemo } from 'react'

const ProposalStage = () => {
  const isConfirmed = useAtomValue(isProposalConfirmedAtom)

  if (isConfirmed) return <ConfirmDaoSettingsProposal />

  return <DaoSettingsProposalSections />
}

const IndexDTFDaoSettingsProposal = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const quorumDenominator = indexDTF?.stToken?.governance?.quorumDenominator

  const schema = useMemo(() => {
    return createProposeDaoSettingsSchema(Number(quorumDenominator))
  }, [quorumDenominator])

  const methods = useForm<ProposeDaoSettings>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(schema),
  })

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-2 pr-0 lg:pr-2 pb-2 sm:pb-6 overflow-hidden">
        <ProposalStage />
        <DaoSettingsProposalOverview />
      </div>
      <Updater />
    </FormProvider>
  )
}

export default IndexDTFDaoSettingsProposal
