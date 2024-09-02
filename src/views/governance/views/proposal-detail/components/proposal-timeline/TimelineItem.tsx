import Address from 'components/address'
import { useAtom, useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import {
  CheckCircle,
  Circle,
  Clock,
  Lock,
  PlayCircle,
  Plus,
  Slash,
  StopCircle,
  XCircle,
  XOctagon,
  XSquare,
} from 'react-feather'
import { Box, Progress, Text } from 'theme-ui'
import { getProposalStateAtom, proposalDetailAtom } from '../../atom'
import dayjs from 'dayjs'
import { formatDate, parseDuration } from 'utils'
import useBlockTimestamp from 'hooks/useBlockTimestamp'
import { isTimeunitGovernance } from 'views/governance/utils'
import { end } from '@popperjs/core'
import { blockTimestampAtom } from 'state/atoms'
import { PROPOSAL_STATES } from 'utils/constants'
import { proposalStatus } from 'views/explorer/components/governance/Filters'
import { colors } from 'theme'

// const mockTimeline = [
//   {
//     surtitle: 'Mon Jul 29, 04:40 pm',
//     icon: <Plus size={18} />,
//     title: 'Proposal created',
//     subtitle: (
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//         <Text>By:</Text>
//         <Address
//           address="0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4"
//           chain={1}
//         />
//       </Box>
//     ),
//     enabled: true,
//   },
//   {
//     surtitle: '2 day',
//     icon: <Clock size={18} />,
//     title: 'Voting delay',
//     enabled: true,
//   },
//   {
//     surtitle: 'Mon Jul 31, 04:40 pm',
//     icon: <Lock size={18} />,
//     title: 'Snapshot taken',
//     subtitle: (
//       <Address address="0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4" chain={1} />
//     ),
//     enabled: true,
//   },
//   {
//     surtitle: 'Mon Jul 31, 04:40 pm',
//     icon: <Slash size={18} />,
//     title: 'Voting period',
//     enabled: true,
//   },
//   {
//     surtitle: 'Mon Jul 31, 04:40 pm',
//     icon: <Slash size={18} />,
//     title: 'Voting period ends',
//     subtitle: 'in 11 days',
//     enabled: false,
//   },
//   {
//     surtitle: 'Fast proposal',
//     icon: <Clock size={18} />,
//     title: 'Execution delay',
//     subtitle: '1 week delay',
//     enabled: false,
//   },
//   {
//     icon: <Circle size={18} />,
//     title: 'Execute proposal',
//     enabled: false,
//   },
// ]

type TimelineItemProps = {
  icon: ReactNode
  title: ReactNode
  surtitle?: ReactNode
  subtitle?: ReactNode
  enabled?: boolean
  showProgress?: boolean
  progress?: number
}

const TimelineItem = ({
  icon,
  title,
  surtitle,
  subtitle,
  enabled = true,
  showProgress = false,
  progress = 0,
}: TimelineItemProps) => {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          px: 3,
          py: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            bg: 'bgIcon',
            zIndex: 10,
            opacity: enabled ? 1 : 0.8,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ opacity: enabled ? 1 : 0.5 }}>
          <Box sx={{ fontSize: 1 }}>{surtitle}</Box>
          <Box sx={{ fontWeight: 'bold' }}>{title}</Box>
          <Box sx={{ fontSize: 1 }}>{subtitle}</Box>
        </Box>
      </Box>
      {showProgress && (
        <Progress
          value={progress}
          max={100}
          sx={{
            position: 'absolute',
            width: '100%',
            color: 'primary',
            backgroundColor: 'lightgray',
            height: 2,
            zIndex: 20,
          }}
        />
      )}
    </Box>
  )
}

export const TimelineItemCreated = () => {
  const proposal = useAtomValue(proposalDetailAtom)

  return (
    <TimelineItem
      icon={<Circle size={18} />}
      title="Proposal created"
      surtitle={formatDate(+(proposal?.creationTime || 0) * 1000)}
      subtitle={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Text>By:</Text>
          <Address address={proposal?.proposer || ''} chain={1} />
        </Box>
      }
    />
  )
}

export const TimelineItemVotingDelay = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const isTimeunit = isTimeunitGovernance(proposal?.version ?? '1')
  const _startTime = useBlockTimestamp(proposal?.startBlock)

  const startTime = isTimeunit ? proposal?.startBlock : _startTime
  const creationTime = proposal?.creationTime
  const duration = (startTime || 0) - +(creationTime || 0)

  return (
    <TimelineItem
      icon={<Clock size={18} />}
      title="Voting delay"
      surtitle={parseDuration(duration)}
    />
  )
}

export const TimelineItemVotingPeriod = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const isTimeunit = isTimeunitGovernance(proposal?.version ?? '1')
  const _startTime = useBlockTimestamp(proposal?.startBlock)
  const _endTime = useBlockTimestamp(proposal?.endBlock)

  const currentTime = useAtomValue(blockTimestampAtom)
  const startTime = isTimeunit ? proposal?.startBlock : _startTime
  const endTime = isTimeunit ? proposal?.endBlock : _endTime
  const duration = (endTime || 0) - (startTime || 0)
  const elapsed = currentTime - (startTime || 0)
  const enabled = currentTime > (startTime || 0)
  const inProgress = currentTime < (endTime || 0)

  return (
    <TimelineItem
      icon={<PlayCircle size={18} />}
      title="Voting Period"
      surtitle={formatDate(+(startTime || 0) * 1000)}
      showProgress={enabled && inProgress}
      progress={(duration > 0 ? elapsed / duration : 0) * 100}
      enabled={enabled}
    />
  )
}

export const TimelineItemVotingPeriodEnds = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const isTimeunit = isTimeunitGovernance(proposal?.version ?? '1')
  const _endTime = useBlockTimestamp(proposal?.endBlock)

  const endTime = isTimeunit ? proposal?.endBlock : _endTime
  const currentTime = useAtomValue(blockTimestampAtom)
  const enabled = currentTime > (endTime || 0)
  const elapsed = currentTime - (endTime || 0)

  return (
    <TimelineItem
      icon={<StopCircle size={18} />}
      title="Voting Period Ends"
      surtitle={formatDate(+(endTime || 0) * 1000)}
      subtitle={enabled ? '' : `in ${parseDuration(elapsed)}`}
      enabled={enabled}
    />
  )
}

const VALID_STATES = [
  PROPOSAL_STATES.DEFEATED,
  PROPOSAL_STATES.QUORUM_NOT_REACHED,
  PROPOSAL_STATES.SUCCEEDED,
  PROPOSAL_STATES.EXPIRED,
]
const ICON_BY_STATE = {
  [PROPOSAL_STATES.DEFEATED]: <XCircle color="red" size={18} />,
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: <XSquare color="orange" size={18} />,
  [PROPOSAL_STATES.EXPIRED]: <XOctagon color="gray" size={18} />,
  [PROPOSAL_STATES.SUCCEEDED]: <CheckCircle color={colors.success} size={18} />,
}
const COLOR_BY_STATE = {
  [PROPOSAL_STATES.DEFEATED]: 'red',
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: 'orange',
  [PROPOSAL_STATES.EXPIRED]: 'gray',
  [PROPOSAL_STATES.SUCCEEDED]: 'success',
}
export const TimelineItemVotingResult = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const proposalState = useAtomValue(getProposalStateAtom)
  const isTimeunit = isTimeunitGovernance(proposal?.version ?? '1')

  const currentTime = useAtomValue(blockTimestampAtom)
  const _endTime = useBlockTimestamp(proposal?.endBlock)
  const endTime = isTimeunit ? proposal?.endBlock : _endTime
  const show =
    currentTime > (endTime || 0) && VALID_STATES.includes(proposalState.state)

  if (!show) return null

  return (
    <TimelineItem
      icon={ICON_BY_STATE[proposalState.state]}
      title={
        <Text color={COLOR_BY_STATE[proposalState.state]}>
          {proposalStatus[proposalState.state]}
        </Text>
      }
    />
  )
}
