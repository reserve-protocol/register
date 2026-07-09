import { Progress } from '@/components/ui/progress'
import ExplorerAddress from '@/components/utils/explorer-address'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import {
  ArrowUpRight,
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
import { Link } from 'react-router-dom'
import { blockTimestampAtom, chainIdAtom } from 'state/atoms'
import { colors } from 'theme'
import { formatDate, getCurrentTime, parseDuration } from 'utils'
import { PROPOSAL_STATES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import {
  canExecuteProposal,
  shouldShowEndStep,
  shouldShowQueueStep,
} from '@/views/index-dtf/governance/utils/proposal-flow'
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
    <div className="relative">
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
          className="absolute inset-x-0 bottom-0 h-0.5 z-0"
        />
      )}
    </div>
  )
}

const TimelineTitleLink = ({
  hash,
  title,
}: {
  hash?: string
  title: ReactNode
}) => {
  const chainId = useAtomValue(chainIdAtom)

  if (!hash) return <>{title}</>

  return (
    <Link
      to={getExplorerLink(hash, chainId, ExplorerDataType.TRANSACTION)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 hover:text-primary"
    >
      <span>{title}</span>
      <ArrowUpRight size={14} strokeWidth={1.5} />
    </Link>
  )
}

export const TimelineItemCreated = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <TimelineItem
      icon={<Circle size={18} />}
      title={
        <TimelineTitleLink
          title={<Trans>Proposal created</Trans>}
          hash={proposal?.txnHash}
        />
      }
      surtitle={formatDate(+(proposal?.creationTime || 0) * 1000)}
      subtitle={
        <div className="flex items-center gap-1">
          <span>
            <Trans>By:</Trans>
          </span>
          <ExplorerAddress
            address={proposal?.proposer?.address || ''}
            chain={chainId}
            ens
            showIcon={false}
          />
        </div>
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
      title={<Trans>Voting delay</Trans>}
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
      title={<Trans>Voting Period</Trans>}
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
      title={<Trans>Voting Period Ends</Trans>}
      surtitle={formatDate(+(endTime || 0) * 1000)}
      subtitle={enabled ? '' : <Trans>in {parseDuration(elapsed)}</Trans>}
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
const TITLE_BY_STATE: Record<string, MessageDescriptor> = {
  [PROPOSAL_STATES.DEFEATED]: msg`Proposal defeated`,
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: msg`Quorum not reached`,
  [PROPOSAL_STATES.EXPIRED]: msg`Proposal expired`,
  [PROPOSAL_STATES.SUCCEEDED]: msg`Proposal succeeded`,
  [PROPOSAL_STATES.QUEUED]: msg`Proposal succeeded`,
  [PROPOSAL_STATES.EXECUTED]: msg`Proposal succeeded`,
  [PROPOSAL_STATES.CANCELED]: msg`Proposal canceled`,
}
const ICON_BY_STATE: Record<string, ReactNode> = {
  [PROPOSAL_STATES.DEFEATED]: <XCircle color="red" size={18} />,
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: <XSquare color="orange" size={18} />,
  [PROPOSAL_STATES.EXPIRED]: <XOctagon color="gray" size={18} />,
  [PROPOSAL_STATES.SUCCEEDED]: <CheckCircle color={colors.success} size={18} />,
  [PROPOSAL_STATES.QUEUED]: <CheckCircle size={18} />,
  [PROPOSAL_STATES.EXECUTED]: <CheckCircle size={18} />,
  [PROPOSAL_STATES.CANCELED]: <XCircle color="red" size={18} />,
}
const COLOR_BY_STATE: Record<string, string> = {
  [PROPOSAL_STATES.DEFEATED]: 'red',
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: 'orange',
  [PROPOSAL_STATES.EXPIRED]: 'gray',
  [PROPOSAL_STATES.SUCCEEDED]: 'success',
  [PROPOSAL_STATES.QUEUED]: 'inherit',
  [PROPOSAL_STATES.EXECUTED]: 'inherit',
  [PROPOSAL_STATES.CANCELED]: 'red',
}
export const TimelineItemVotingResult = () => {
  const { t } = useLingui()
  const proposal = useAtomValue(proposalDetailAtom)
  const show = VALID_STATES.includes(proposal?.votingState.state ?? '')

  if (!show) return null

  return (
    <TimelineItem
      icon={ICON_BY_STATE[proposal?.votingState.state ?? '']}
      title={
        <span style={{ color: COLOR_BY_STATE[proposal?.votingState.state ?? ''] }}>
          {t(TITLE_BY_STATE[proposal?.votingState.state ?? ''])}
        </span>
      }
    />
  )
}

export const TimelineItemQueued = () => {
  const proposal = useAtomValue(proposalDetailAtom)

  const queueTime = +(proposal?.queueTime || 0)
  const executionTime = +(proposal?.executionETA || 0)
  const currentTime = useAtomValue(blockTimestampAtom)
  const duration = executionTime - queueTime
  const elapsed = currentTime - queueTime
  const show = shouldShowQueueStep(proposal)
  const showProgress = proposal?.votingState.state === PROPOSAL_STATES.QUEUED

  if (!show) return null

  return (
    <TimelineItem
      icon={<MoreHorizontal size={18} />}
      title={
        <TimelineTitleLink
          title={<Trans>Queued</Trans>}
          hash={proposal?.queueTxnHash}
        />
      }
      surtitle={formatDate(queueTime * 1000)}
      subtitle={parseDuration(duration)}
      showProgress={showProgress}
      progress={(duration > 0 ? elapsed / duration : 0) * 100}
    />
  )
}

const VALID_STATES_END = [
  PROPOSAL_STATES.SUCCEEDED,
  PROPOSAL_STATES.QUEUED,
  PROPOSAL_STATES.EXECUTED,
  PROPOSAL_STATES.CANCELED,
]
const TITLE_BY_STATE_END: Record<string, MessageDescriptor> = {
  [PROPOSAL_STATES.SUCCEEDED]: msg`Execute proposal`,
  [PROPOSAL_STATES.QUEUED]: msg`Execute proposal`,
  [PROPOSAL_STATES.EXECUTED]: msg`Executed`,
  [PROPOSAL_STATES.CANCELED]: msg`Canceled`,
}

const ICON_BY_STATE_END: Record<string, ReactNode> = {
  [PROPOSAL_STATES.SUCCEEDED]: <Circle size={18} />,
  [PROPOSAL_STATES.QUEUED]: <Circle size={18} />,
  [PROPOSAL_STATES.EXECUTED]: <CheckCircle color={colors.success} size={18} />,
  [PROPOSAL_STATES.CANCELED]: <XCircle color="red" size={18} />,
}

export const TimelineItemEnd = () => {
  const { t } = useLingui()
  const proposal = useAtomValue(proposalDetailAtom)
  const state = proposal?.votingState.state ?? ''
  const currentTime = Math.max(useAtomValue(blockTimestampAtom), getCurrentTime())

  const show = VALID_STATES_END.includes(state) && shouldShowEndStep(proposal)
  const enabled =
    state !== PROPOSAL_STATES.QUEUED || canExecuteProposal(proposal, currentTime)
  const executionTime = +(proposal?.executionTime || 0)
  const executionETA = +(proposal?.executionETA || 0)
  const cancellationTime = +(proposal?.cancellationTime || 0)
  const eventTime =
    state === PROPOSAL_STATES.QUEUED
      ? executionETA
      : state === PROPOSAL_STATES.EXECUTED
        ? executionTime
        : state === PROPOSAL_STATES.CANCELED
          ? cancellationTime
          : undefined
  const transactionHash =
    state === PROPOSAL_STATES.EXECUTED ? proposal?.executionTxnHash : undefined

  if (!show) return null

  return (
    <TimelineItem
      icon={ICON_BY_STATE_END[state]}
      title={
        <TimelineTitleLink
          title={t(TITLE_BY_STATE_END[state])}
          hash={transactionHash}
        />
      }
      surtitle={eventTime ? formatDate(eventTime * 1000) : undefined}
      enabled={enabled}
    />
  )
}

const ProposalDetailTimeline = () => {
  return (
    <div className="bg-background rounded-3xl p-2">
      <h4 className="font-bold text-xl p-4">
        <Trans>Status</Trans>
      </h4>
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
