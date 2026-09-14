# Morning handoff — September 14

Overnight preparation is complete. It kept the reviewed primary source frozen.
After Claude's review ended, the user authorized the
[follow-up integration](../design-system-table-governance-followup-2026-09-14/README.md):
the two table fixes and bounded governance layout changes are now in the main
lab. No production/data/financial changes, commits or new checkpoint.

## Ready to use

- [Table findings and before/after images](tables.md): Earn's vault label no
  longer overlaps its rate at 320px; owned-position amounts wrap as complete
  fact groups instead of splitting a decimal. [Original patch, now integrated](isolated-layout.patch).
- [Governance's remaining work](governance.md): layout and the authorized
  [status/timing presentation](../design-system-governance-presentation-closeout.md)
  are implemented in the lab, including expired/loading/empty/queued-ready examples.
  Visual acceptance and production integration remain separate; no flow changes.
- [Chart first-slice brief](charts.md): one consistent time-series visual in
  compact, card and full containers; retain distinct candles, signed period
  bars and composition jobs. Use the stronger Home/Overview styles as the lead.
- [Engineer-facing chart questions](chart-engineering.md): source observations,
  unresolved meaning and audit corrections are separate from visual work.
  No change to figures, sources, freshness rules or financial calculations.

## What to do first

1. Auction closeout is [reconciled](../design-system-current-rebalance-table-evidence/closeout/README.md).
   The near-term tables and deferred workspace remain separate migration scopes.
2. Review the integrated table/governance layout changes in the
   [follow-up receipt](../design-system-table-governance-followup-2026-09-14/README.md).
3. Next visual decision: the first chart-style comparison. It must not decide new
   financial definitions or rewrite adapters.

## Confidence and boundaries

53 baseline browser checks passed. After the fixes, 42 affected browser checks
and 29 unit checks passed; application/E2E types and scoped lint passed. Eight
additional Discover-card checks also passed. Required independent Dark/Light
review found no substantive blocker; three documentation corrections were made.
[Exact verification and limitations](verification.md) · [review dispositions](review.md).

At overnight closeout, the source fingerprint matched all 2,437 reviewed files. The
isolated diff is exactly two local column owners and one regression/inventory
test. The preview used for this work has stopped; your and Claude's preview
ports were not restarted. The temporary copy remains available, but the patch,
evidence and handoff here do not depend on keeping it.

Human visual acceptance and production adoption remain separate. Governance
permissions/actions, chart data meanings and other sensitive adapters still
need separately scoped engineer review. The [active V1 plan](../design-system-v1.md)
retains the short-term auction-table versus deferred-workspace boundary.
