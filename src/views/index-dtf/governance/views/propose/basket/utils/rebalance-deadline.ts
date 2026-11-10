// Generous on purpose: a missed deadline voids an approved rebalance, and execution waits on a human.
export const REBALANCE_DEADLINE_BUFFER = 7n * 86_400n

export type RebalanceGovernanceTiming = {
  votingDelay: bigint
  votingPeriod: bigint
  voteExtension: bigint
  timelockDelay: bigint
  veto?: { vetoDelay: bigint; vetoPeriod: bigint }
}

// Folio 6.0 startRebalance reverts after its deadline. Worst case: a vetoed optimistic proposal restarts as a standard vote whose quorum lands late and extends it.
export const getRebalanceProposalDeadline = (
  anchor: bigint,
  timing: RebalanceGovernanceTiming
): bigint =>
  anchor +
  (timing.veto ? timing.veto.vetoDelay + timing.veto.vetoPeriod : 0n) +
  timing.votingDelay +
  timing.votingPeriod +
  timing.voteExtension +
  timing.timelockDelay +
  REBALANCE_DEADLINE_BUFFER
