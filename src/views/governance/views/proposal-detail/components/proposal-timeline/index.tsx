import { Box, Text } from 'theme-ui'
import {
  TimelineItemCreated,
  TimelineItemVotingPeriod,
  TimelineItemVotingDelay,
  TimelineItemVotingPeriodEnds,
  TimelineItemVotingResult,
  TimelineItemQueued,
  TimelineItemEnd,
} from './TimelineItem'

const ProposalTimeline = () => {
  return (
    <Box sx={{ bg: 'background', borderRadius: '8px', p: 2, mt: 2 }}>
      <Text
        variant="title"
        sx={{ fontWeight: 'bold', lineHeight: '20px' }}
        p={3}
      >
        Status
      </Text>
      <Box
        sx={{
          position: 'relative',
          bg: 'focusedBackground',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: '0px 10px 38px 6px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            borderLeft: '2px solid',
            borderColor: 'borderSecondary',
            top: '40px',
            left: '29px',
            height: 'calc(100% - 80px)',
            zIndex: 10,
          }}
        />
        <Box py={2}>
          <TimelineItemCreated />
          <TimelineItemVotingDelay />
          <TimelineItemVotingPeriod />
          <TimelineItemVotingPeriodEnds />
          <TimelineItemVotingResult />
          <TimelineItemQueued />
          <TimelineItemEnd />
        </Box>
      </Box>
    </Box>
  )
}

export default ProposalTimeline
