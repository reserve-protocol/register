# Governance — remaining work, not a migration sign-off

September 14 overnight assessment, followed by an authorized
[bounded layout implementation](../design-system-table-governance-followup-2026-09-14/README.md).
Full-width narrow titles/qualifiers, standard evidence stacking without an orphan
divider, and content-height lab notes are now implemented. The subsequent
[presentation closeout](../design-system-governance-presentation-closeout.md)
implements the authorized one-pill, prominent deadline and Waiting period trial,
with active-only timeline help. Calculation, routes, voting and execution remain
unchanged. Human visual acceptance and engineer integration are separate.

## Original findings and current disposition

The following table records the original observed defects and recommendations,
not outstanding implementation tasks. The layout and presentation closeouts
supersede those next steps. Keep the retained proposal-record composition; do not
turn it into another auction workspace or a redesign of voting/execution.

| Finding                                               | Evidence and impact                                                                                                                              | Bounded next step / unresolved decision                                                                                                                                                                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Qualifier consumes too much title width               | At 320px, the Contested fixture's title wraps into six lines; its record is 328px tall versus 244px at 390px. Fast similarly squeezes its title. | Let the title take the full narrow width and move the unchanged qualifier into a nearby supporting group. Preserve Fast/Contested as qualifiers, not lifecycle states. Desktop can retain the current relationship. Human visual review needed. |
| Evidence separator survives after its peers wrap      | At 320px, a vertical divider trails Quorum while the vote distribution moves below it. The separator no longer separates adjacent facts.         | Use a narrow stacked evidence recipe without that divider; retain the inline divider only when its complete groups sit beside one another. Do not remove quorum or the For/Against/Abstain values.                                              |
| Time competes with lifecycle/outcome                  | Queued has Passed, Pending execution and Ready in 8h as three separate pills; at 320px the clock becomes another row.                            | Review rendering the unchanged countdown as supporting metadata rather than another pill. Keep outcome and next-action status distinct. This is a proposed visual choice, not approved copy or state consolidation.                             |
| Timeline is difficult to interpret unaided            | The 4px multi-stage strip is visually prominent across each record, but the record has no visible stage names. Closed rows retain a quiet strip. | Determine what information the strip must add beyond the explicit status and clock before changing it. Do not invent equal-duration phases, remove stages or recompute progress. Current shared ProposalStatusBar remains untouched.            |
| Lab framing looks like an empty second product column | At desktop, the Review now/Leave for later aside stretches beside the entire list; most of it is blank.                                          | A lab-chrome-only follow-up can keep the aside content-height and clearly separate review notes from the proposed product layout. This is not evidence the production record needs a wider table.                                               |

Original ordinary-viewport examples: 320px contested/title and evidence *(capture generated locally; not tracked)*,
320px queued *(capture generated locally; not tracked)*.
Exact retained filenames and hashes are in [inspection results](evidence/inspection/results.json).

## State and integration coverage

The original lab contained 11 fixtures: pending, standard active, optimistic active,
contested active, standard succeeded, queued, optimistic succeeded, executed,
defeated, quorum not reached, canceled. Browser inventory mounted all 11 at
320/390/768/1400px in both themes and checked programmatic focus on the first
native record link. That original inventory did not exercise Tab traversal or link
activation; the follow-up now verifies both for the existing overview reference.
Captures
scrolled through six anchor states per case; neighboring records are visible.
Measured record boxes stay within their host. These are visual inventory checks,
not proof that every label is derived correctly from real governance data.

The current sheet adds Expired and a separately supplied queued-ready example
(13 total), plus local Loading and Empty previews. It does not derive a deadline
crossing or reproduce production Show all/Show less beyond ten proposals.
Account/network/eligibility, vote submission, queue/execute/rejection/recovery,
proposal details and stale/partial RPC/indexing transitions are not implemented
by the record sheet. Missing/failed data is not automatically another lifecycle
state; verify source ownership and obtain copy approval before adding fixtures.

Every lab record currently links to the same governance overview in a new tab.
Production links to the actual proposal identity. This is a reference destination,
not a completed navigation adapter. Preserve native link behavior, real proposal
identity, and independent details/actions when migration is separately scoped.

## What must stay out of a visual cleanup

- Governance status is derived from proposal metadata, tallies and time; do not
  replace it with a raw subgraph label or a fixture label-to-state map.
- Standard quorum/vote distribution is not optimistic challenge evidence.
  Contested reproposals must not be treated as the same lifecycle branch as an
  unchallenged optimistic proposal.
- Queue versus execute, proposal governor identity, deadlines and eligibility
  remain production/SDK-owned. Preserve familiar terminology unless approved.
- No new vote colors, shared timeline defaults, final detail UX, or data-error
  policy is authorized by this assessment. No transaction was submitted.

Before adoption, an engineer must review the real list/record adapter and its
state/action boundaries. The next design review can be limited to title width,
metadata wrapping and evidence grouping; it does not need an engineering rewrite.

Sources: [lab records](../../../src/views/internal/design-system/governance-proposal-state-review.tsx),
[fixtures](../../../src/views/internal/design-system/governance-proposal-state-fixtures.ts),
[production record](../../../src/views/index-dtf/governance/components/proposal-list-item.tsx),
[production list](../../../src/views/index-dtf/governance/components/governance-proposal-list.tsx),
[governance area guide](../../../src/views/index-dtf/governance/CLAUDE.md).
