# Earn candidate review boundary

Fixed point: `01a900cdf2589d455d04f78806d2ca8ff2b9122c`.
Scope: lab-only Earn opportunity composition and isolated source verification.
See the [transfer contract](../../design-system-table-family-earn-preparation.md).
No product migration, shared default, token, transaction or SDK changes.
The [final receipt](verification.json) records 15/15 Earn browser checks and
70/70 focused units. The [capture package](record.json) contains 52 images;
the [preceding combined regression](regression/record.json) passed 51/51.

## Independent review reconciliation

The Intent and Engineering Risk reviewers independently inspected the actual
candidate, source owners, transfer contract and evidence. Both required changes:

- Empty unmounted the sorting owner. Confirmed/fixed: DataTable stays mounted
  and uses its existing alternative renderer. Recovery retains field/direction.
- Desktop wallet and rate labels differed from the source. Confirmed/fixed:
  source “Your lock” / “Your stake” and “Avg. 30d%” are retained.
- Desktop secondary dividers were absent. Confirmed/fixed without modifying
  shared defaults; phone gray seams remain left-inset/right-edge.
- Missing underlying wallet amount had no specimen. Confirmed/fixed separately
  from known amount with unavailable USD and known zero.
- Initial browser checks lacked in-place resize and both-theme interaction
  proof. Confirmed/fixed: focused identity, sort menu, disclosure and dialog
  dismissal are checked across the 1024px available-width boundary.

Both affected-axis rechecks found no remaining important finding. They inspected
13 passing Earn cases and selected 320/390/1400px captures, and explicitly
required fresh post-extraction verification before closeout. No design acceptance
or source financial correctness is implied by their implementation verdicts.
The final narrow risk recheck also covered loading-slot stability and recovered
disclosure observation. It found no Important issue; the subsequent 15-case
post-edit run passed. No independent review result substitutes for visual approval.

## Direct visual inspection

Source review included both opportunity lists, a synthetic Index wallet, Index
loading/filtered-empty, governed disclosure, original FAQ, and both real drawer
entry boundaries. Source images remain in the [source package](../earn-source-2026-09-11/verified/record.json).

Candidate inspection includes ordinary desktop/phone, narrow wallet, long names
at 320px, zero/unavailable, loading and the keyboard-open governed-asset list.
The single-name facts were corrected to stack labels above values; desktop
secondary dividers and neutral whole-row identities are preserved. The narrow
composition is a proposal for human review, not an accepted universal row.

## Human review agenda

1. Review Index governance with Wallet position off, then on. Judge whether the
   token/vault relationship, governed DTFs and rate kind are clear together.
2. Turn on Constrained Earn column (390px). Review wallet facts and the shared
   vault's extra governed assets, then Long content and Zero / unavailable.
3. Switch to Yield staking. Compare the shared cell vocabulary without assuming
   identical data calculations or transaction mechanics.
4. Resume the still-open Discover mobile-card/inset and Portfolio header-spacing
   trials separately. Nothing in this pass accepts them by implication.

Engineer review is required before adoption: source denomination and rate-period
questions remain unresolved. Full filters, real wallet errors, slashing, claims,
screen-reader usage and transaction execution are not covered by this candidate.
