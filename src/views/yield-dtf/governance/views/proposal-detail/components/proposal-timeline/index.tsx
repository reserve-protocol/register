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
    <div className="bg-secondary rounded-lg p-2 mt-2">
      <span className="text-xl font-bold leading-5 p-4 block">
        Status
      </span>
      <div
        className="relative bg-muted/50 rounded-md overflow-hidden border border-border shadow-[0px_10px_38px_6px_rgba(0,0,0,0.05)]"
      >
        <div
          className="absolute border-l-2 border-border top-10 left-[29px] h-[calc(100%-80px)] z-10"
        />
        <div className="py-2">
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

export default ProposalTimeline
