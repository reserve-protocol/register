import { useAtomValue } from 'jotai'
import { isProposalConfirmedAtom } from './atoms'
import VaultProposalForm from './components/vault-proposal-form'
import VaultProposalOverview from './components/vault-proposal-overview'
import Updater from './updater'
import ConfirmVaultProposal from './components/confirm-vault-proposal'

const ProposalStage = () => {
  const isConfirmed = useAtomValue(isProposalConfirmedAtom)

  if (isConfirmed) return <ConfirmVaultProposal />

  return <VaultProposalForm />
}

const IndexDTFWhitelistProposal = () => (
  <>
    <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-2 pr-0 lg:pr-2 pb-2 sm:pb-6 relative">
      <ProposalStage />
      <VaultProposalOverview />
    </div>
    <Updater />
  </>
)

export default IndexDTFWhitelistProposal
