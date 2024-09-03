import { Box, Grid } from 'theme-ui'
import ProposalTimeline from './components/proposal-timeline/index'
import ProposalDetailContent from './components/ProposalDetailContent'
import ProposalDetailStats from './components/ProposalDetailStats'
import ProposalVotes from './components/ProposalVotes'
import ProposalHeader from './ProposalHeader'
import ProposalDetailAtomUpdater from './ProposalDetailAtomUpdater'

const GovernanceProposalDetail = () => {
  return (
    <Box variant="layout.wrapper">
      <ProposalDetailAtomUpdater />
      <ProposalHeader />
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
}

export default GovernanceProposalDetail
