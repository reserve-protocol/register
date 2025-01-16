import { Box, Grid } from 'theme-ui'
import ProposalTimeline from './components/proposal-timeline/index'
import ProposalDetailContent from './components/ProposalDetailContent'
import ProposalDetailStats from './components/ProposalDetailStats'
import ProposalVotes from './components/ProposalVotes'
import ProposalHeader from './ProposalHeader'
import ProposalDetailAtomUpdater from './ProposalDetailAtomUpdater'
import ProposalVote from './components/ProposalVote'

const GovernanceProposalDetail = () => (
  <Box
    variant="layout.wrapper"
    sx={{ bg: 'reserveBackground', borderRadius: '14px', m: [1, 4], p: 1 }}
  >
    <ProposalDetailAtomUpdater />
    <Grid
      columns={[1, 1, 1, '10fr 5fr']}
      gap={[2]}
      px={[1, 2]}
      sx={{
        bg: 'focusedBackground',
        borderRadius: '14px',
        height: '100%',
        position: 'relative',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        overflowY: 'auto',
      }}
    >
      <ProposalHeader />
      <Box sx={{ py: [1, 2], height: '100%' }}>
        <ProposalVote />
      </Box>
    </Grid>
    <Grid
      columns={[1, 1, 1, '10fr 5fr']}
      gap={[2]}
      px={[1, 2]}
      sx={{
        bg: 'reserveBackground',
        height: '100%',
        position: 'relative',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        overflowY: 'auto',
        py: '12px',
      }}
    >
      <ProposalDetailContent />
      <Box>
        <ProposalDetailStats />
        <ProposalTimeline />
        <ProposalVotes />
      </Box>
    </Grid>
  </Box>
)

export default GovernanceProposalDetail
