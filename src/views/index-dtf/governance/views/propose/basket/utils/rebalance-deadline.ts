export const REBALANCE_DEADLINE_BUFFER = 3n * 86_400n

export type RebalanceGovernanceTiming = {
  votingDelay: bigint
  votingPeriod: bigint
  timelockDelay: bigint
  veto?: { vetoDelay: bigint; vetoPeriod: bigint }
}

// Folio 6.0 startRebalance reverts after its deadline. A vetoed optimistic proposal restarts as a standard vote, so the worst case is the veto window plus a full standard lifecycle.
export const getRebalanceProposalDeadline = (
  anchor: bigint,
  timing: RebalanceGovernanceTiming
): bigint =>
  anchor +
  (timing.veto ? timing.veto.vetoDelay + timing.veto.vetoPeriod : 0n) +
  timing.votingDelay +
  timing.votingPeriod +
  timing.timelockDelay +
  REBALANCE_DEADLINE_BUFFER
