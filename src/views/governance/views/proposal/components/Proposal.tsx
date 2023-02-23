import Layout from 'components/rtoken-setup/Layout'
import ProposalForm from './ProposalForm'
import ProposalNavigation from './ProposalNavigation'
import ProposalOverview from './ProposalOverview'

const Proposal = () => (
  <Layout>
    <ProposalNavigation />
    <ProposalForm />
    <ProposalOverview />
  </Layout>
)

export default Proposal
