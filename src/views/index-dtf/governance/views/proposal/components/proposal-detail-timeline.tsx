import ExplorerAddress from '@/components/utils/explorer-address'
import { useAtomValue } from 'jotai'
import {
  CheckCircle,
  Circle,
  Clock,
  MoreHorizontal,
  PlayCircle,
  StopCircle,
  XCircle,
  XOctagon,
  XSquare,
} from 'lucide-react'
import { ReactNode } from 'react'
import { blockTimestampAtom } from 'state/atoms'
import { colors } from 'theme'
import { Box, Progress, Text } from 'theme-ui'
import { formatDate, getCurrentTime, parseDuration } from 'utils'
import { PROPOSAL_STATES } from 'utils/constants'
import { proposalDetailAtom } from '../atom'

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
    <div>
      <div className="flex items-center gap-3 px-4 py-2">
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-lg bg-muted z-0 ${enabled ? 'opacity-100' : 'opacity-80'}`}
        >
          {icon}
        </div>
        <div className={enabled ? 'opacity-100' : 'opacity-50'}>
          {!!subtitle && <div className="text-sm">{surtitle}</div>}
          <div className="font-semibold">{title}</div>
          <div className="text-sm">{subtitle || surtitle}</div>
        </div>
      </div>
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
            zIndex: 1,
          }}
        />
      )}
    </div>
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
          <ExplorerAddress address={proposal?.proposer || ''} chain={1} />
        </Box>
      }
    />
  )
}

export const TimelineItemVotingDelay = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const currentTime = getCurrentTime()

  const startTime = +(proposal?.voteStart || 0)
  const creationTime = +(proposal?.creationTime || 0)
  const duration = startTime - creationTime
  const showProgress = currentTime < startTime
  const progress = duration > 0 ? (startTime - currentTime) / duration : 0

  return (
    <TimelineItem
      icon={<Clock size={18} />}
      title="Voting delay"
      surtitle={parseDuration(duration)}
      showProgress={showProgress}
      progress={progress * 100}
    />
  )
}

export const TimelineItemVotingPeriod = () => {
  const currentTime = getCurrentTime()
  const proposal = useAtomValue(proposalDetailAtom)
  const startTime = proposal?.voteStart
  const endTime = proposal?.voteEnd
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
  const startTime = proposal?.voteStart
  const endTime = proposal?.voteEnd
  const currentTime = getCurrentTime()
  const enabled = currentTime > (endTime || 0)
  const elapsed = Math.max(currentTime, startTime || 0) - (endTime || 0)

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
  PROPOSAL_STATES.QUEUED,
  PROPOSAL_STATES.EXECUTED,
  PROPOSAL_STATES.CANCELED,
]
const TITLE_BY_STATE = {
  [PROPOSAL_STATES.DEFEATED]: 'Proposal defeated',
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: 'Quorum not reached',
  [PROPOSAL_STATES.EXPIRED]: 'Proposal expired',
  [PROPOSAL_STATES.SUCCEEDED]: 'Proposal succeeded',
  [PROPOSAL_STATES.QUEUED]: 'Proposal succeeded',
  [PROPOSAL_STATES.EXECUTED]: 'Proposal succeeded',
  [PROPOSAL_STATES.CANCELED]: 'Proposal succeeded',
}
const ICON_BY_STATE = {
  [PROPOSAL_STATES.DEFEATED]: <XCircle color="red" size={18} />,
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: <XSquare color="orange" size={18} />,
  [PROPOSAL_STATES.EXPIRED]: <XOctagon color="gray" size={18} />,
  [PROPOSAL_STATES.SUCCEEDED]: <CheckCircle color={colors.success} size={18} />,
  [PROPOSAL_STATES.QUEUED]: <CheckCircle color={colors.success} size={18} />,
  [PROPOSAL_STATES.EXECUTED]: <CheckCircle color={colors.success} size={18} />,
  [PROPOSAL_STATES.CANCELED]: <CheckCircle color={colors.success} size={18} />,
}
const COLOR_BY_STATE = {
  [PROPOSAL_STATES.DEFEATED]: 'red',
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: 'orange',
  [PROPOSAL_STATES.EXPIRED]: 'gray',
  [PROPOSAL_STATES.SUCCEEDED]: 'success',
  [PROPOSAL_STATES.QUEUED]: 'success',
  [PROPOSAL_STATES.EXECUTED]: 'success',
  [PROPOSAL_STATES.CANCELED]: 'success',
}
export const TimelineItemVotingResult = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const show = VALID_STATES.includes(proposal?.votingState.state ?? '')

  if (!show) return null

  return (
    <TimelineItem
      icon={ICON_BY_STATE[proposal?.votingState.state ?? '']}
      title={
        <Text color={COLOR_BY_STATE[proposal?.votingState.state ?? '']}>
          {TITLE_BY_STATE[proposal?.votingState.state ?? '']}
        </Text>
      }
    />
  )
}

const VALID_STATES_QUEUED = [
  PROPOSAL_STATES.QUEUED,
  PROPOSAL_STATES.EXECUTED,
  PROPOSAL_STATES.CANCELED,
]
export const TimelineItemQueued = () => {
  const proposal = useAtomValue(proposalDetailAtom)

  const queueTime = +(proposal?.queueTime || 0)
  const executionTime = +(proposal?.executionETA || 0)
  const currentTime = useAtomValue(blockTimestampAtom)
  const duration = executionTime - queueTime
  const elapsed = currentTime - queueTime
  const show = VALID_STATES_QUEUED.includes(proposal?.votingState.state ?? '')
  const showProgress = proposal?.votingState.state === PROPOSAL_STATES.QUEUED

  if (!show) return null

  return (
    <TimelineItem
      icon={<MoreHorizontal size={18} />}
      title="Queued"
      surtitle={formatDate(queueTime * 1000)}
      subtitle={parseDuration(duration)}
      showProgress={showProgress}
      progress={(duration > 0 ? elapsed / duration : 0) * 100}
    />
  )
}

const VALID_STATES_END = [
  PROPOSAL_STATES.QUEUED,
  PROPOSAL_STATES.EXECUTED,
  PROPOSAL_STATES.CANCELED,
]
const TITLE_BY_STATE_END = {
  [PROPOSAL_STATES.QUEUED]: 'Execute proposal',
  [PROPOSAL_STATES.EXECUTED]: 'Executed',
  [PROPOSAL_STATES.CANCELED]: 'Canceled',
}
export const TimelineItemEnd = () => {
  const proposal = useAtomValue(proposalDetailAtom)

  const show = VALID_STATES_END.includes(proposal?.votingState.state ?? '')
  const enabled = proposal?.votingState.state !== PROPOSAL_STATES.QUEUED
  const executionTime = +(proposal?.executionTime || 0)
  const executionETA = +(proposal?.executionETA || 0)
  const cancellationTime = +(proposal?.cancellationTime || 0)

  if (!show) return null

  return (
    <TimelineItem
      icon={<Circle size={18} />}
      title={TITLE_BY_STATE_END[proposal?.votingState.state ?? '']}
      surtitle={formatDate(
        (proposal?.votingState.state === PROPOSAL_STATES.QUEUED
          ? executionETA
          : proposal?.votingState.state === PROPOSAL_STATES.EXECUTED
            ? executionTime
            : cancellationTime) * 1000
      )}
      enabled={enabled}
    />
  )
}

const ProposalDetailTimeline = () => {
  return (
    <div className="bg-background rounded-3xl p-2">
      <h4 className="font-bold text-xl p-4">Status</h4>
      <div className="bg-card rounded-3xl border relative">
        <div className="absolute border-l border-borderSecondary top-[40px] left-[29px] h-[calc(100%-64px)] " />
        <div>
          <TimelineItemCreated />
          <TimelineItemVotingDelay />
          <TimelineItemVotingPeriod />
          <TimelineItemVotingPeriodEnds />
          <TimelineItemVotingResult />
          <TimelineItemQueued />
          <TimelineItemEnd />
        </div>
      </div>
    </div>
  )
}

export default ProposalDetailTimeline
