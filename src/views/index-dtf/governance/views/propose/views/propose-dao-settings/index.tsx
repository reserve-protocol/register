import { useAtomValue } from 'jotai'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isProposalConfirmedAtom } from './atoms'
import DaoSettingsProposalSections from './components/dao-settings-proposal-sections'
import DaoSettingsProposalOverview from './components/dao-settings-proposal-overview'
import Updater from './updater'
import ConfirmDaoSettingsProposal from './components/confirm-dao-settings-proposal'
import { ProposeDaoSettingsSchema, ProposeDaoSettings } from './form-fields'

const ProposalStage = () => {
  const isConfirmed = useAtomValue(isProposalConfirmedAtom)

  if (isConfirmed) return <ConfirmDaoSettingsProposal />

  return <DaoSettingsProposalSections />
}

const IndexDTFDaoSettingsProposal = () => {
  const methods = useForm<ProposeDaoSettings>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: zodResolver(ProposeDaoSettingsSchema),
  })

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-2 pr-0 lg:pr-2 pb-2 sm:pb-6 relative">
        <ProposalStage />
        <DaoSettingsProposalOverview />
      </div>
      <Updater />
    </FormProvider>
  )
}

export default IndexDTFDaoSettingsProposal
