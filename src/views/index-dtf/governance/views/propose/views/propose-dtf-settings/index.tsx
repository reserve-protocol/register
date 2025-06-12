import { useAtomValue } from 'jotai'
import { isProposalConfirmedAtom } from './atoms'
import DTFSettingsProposalForm from './components/dtf-settings-proposal-form'
import Updater from './updater'
import DTFSettingsProposalOverview from './components/dtf-settings-proposal-overview'
import ConfirmDTFSettingsProposal from './components/confirm-dtf-settings-proposal'

const ProposalStage = () => {
  const isConfirmed = useAtomValue(isProposalConfirmedAtom)

  if (isConfirmed) return <ConfirmDTFSettingsProposal />

  return <DTFSettingsProposalForm />
}

const ProposeDTFSettings = () => (
  <>
    <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-2 pr-0 lg:pr-2 pb-2 sm:pb-6 relative">
      <ProposalStage />
      <DTFSettingsProposalOverview />
    </div>
    <Updater />
  </>
)

export default ProposeDTFSettings
