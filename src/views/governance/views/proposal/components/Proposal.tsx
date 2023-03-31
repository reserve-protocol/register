import Layout from 'components/rtoken-setup/Layout'
import { AlertCircle } from 'react-feather'
import { Box, Text } from 'theme-ui'
import ProposalForm from './ProposalForm'
import ProposalNavigation from './ProposalNavigation'
import ProposalOverview from './ProposalOverview'

const Proposal = () => (
  <Layout>
    <ProposalNavigation />
    <Box>
      <Box
        mb={4}
        py={2}
        px={4}
        sx={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 138, 0, 0.1)',

          borderRadius: '8px',
          color: 'warning',
        }}
      >
        <AlertCircle size={16} />
        <Text ml={2} mr="auto" sx={{ fontWeight: 500 }}>
          Creating governance proposals is on development
        </Text>
      </Box>
      <ProposalForm />
    </Box>
    <ProposalOverview />
  </Layout>
)

export default Proposal
