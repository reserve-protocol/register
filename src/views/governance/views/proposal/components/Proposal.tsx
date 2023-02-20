import Layout from 'components/rtoken-setup/Layout'
import ProposalDetailForm from './ProposalDetailForm'
import ProposalForm from './ProposalForm'
import ProposalNavigation from './ProposalNavigation'
import ProposalOverview from './ProposalOverview'

const Proposal = () => (
  <Layout>
    <ProposalNavigation />
    {/* <ProposalForm /> */}
    <ProposalDetailForm />
    <ProposalOverview />
  </Layout>
)

export default Proposal
