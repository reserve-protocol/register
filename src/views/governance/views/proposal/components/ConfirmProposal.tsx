import Layout from 'components/rtoken-setup/Layout'
import ProposalDetail from 'views/governance/components/ProposalDetail'
import ProposalDetailNavigation from 'views/governance/components/ProposalDetailNavigation'
import useProposalTx from '../hooks/useProposalTx'
import ConfirmProposalForm from './ConfirmProposalForm'
import ConfirmProposalOverview from './ConfirmProposalOverview'

// TODO: Build proposal
const ConfirmProposal = () => {
  const tx = useProposalTx()

  return (
    <Layout>
      <ProposalDetailNavigation />
      <ConfirmProposalForm tx={tx} />
      <ConfirmProposalOverview tx={tx} />
    </Layout>
  )
}

export default ConfirmProposal
