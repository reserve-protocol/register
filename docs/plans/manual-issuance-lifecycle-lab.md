# Manual issuance lifecycle lab

## Goal

Expand the reviewed Manual Mint/Redeem anchors into a production-backed, visually
reviewable lifecycle without changing production or approval/security policy.

## Current state

Fixed point: `2e64876fb7ea28084ac8bee2b39cab9fd028f2d3`, plus the inspected,
uncommitted anchor refinements. Preserve all existing work. The source audit and
geometry owners remain in [the readiness map](manual-mint-design-system-readiness.md).
The page-host contract is deliberately retained: natural-height task contents
within a desktop lab workspace of 736px, matching Automated's full review width,
with both columns filling that height
and scrolling on overflow (spare space below the content; stacked mobile remains
natural-height). This is review-host geometry, not a production height rule;
persistent asset ledger, standard identity typography, compact row rhythm,
canonical checkbox/help, and local soft-Approve trial.

### Manual Mint section trial

The left task follows desired share amount, Token approvals, and final Mint.
The amount remains at the top and unnumbered; it is the desired result, not a
funding-token input. `ManualMintStages` owns the two lower regions. The amount
and approval count consume TransactionAmountObject's label/value/supporting
hierarchy, matching Automated. The final region uses a readiness-led summary:
16px Mint label, the approval count's responsive light headline scale
(22px/28px below 360px, 28px/32px below 640px, then 32px/38px), existing 32px CMC20 mark, and
14px explanation of exchanging basket tokens for CMC20. The numeric amount stays
in the input and button. Automated retains its distinct output summary;
matching primitives does not require identical section content.
The former large introductory heading and equally weighted
approval prose remain superseded.

The two full-width 2px secondary boundaries now include Automated's connected
down-arrow circle. Both flows consume the local `TransactionStageBoundary`
owner so their geometry stays identical. The arrows communicate ordered stages;
they do not imply a collateral swap or add an extra progress stepper.

- The middle region owns the Unlimited setting, its factual help, aggregate
  approval progress/retry, and readiness. Individual actions remain beside
  their basket assets; there is no mutually exclusive approval mode.
- A prominent count identifies tokens with sufficient allowance, including those
  approved before this attempt; it is not a transaction counter. The factual
  explanation of separate token transactions and individual approvals lives in
  a HelpTooltip beside the short supporting label. Unlimited retains its own
  separate factual help and unchanged policy. Readiness retains the count and
  replaces controls with the short confirmation, without hidden spacing.
- The final Mint button remains mounted and disabled while permissions are
  outstanding. Its signing, confirmation, rejection and transaction-failure
  states belong here, not to the approval region. Wallet gates have only one
  actionable entry point. Loading does not expose fixture approval counts.
- Active approval and final-mint actions retain primary tone while loading;
  spinner, busy semantics and blocked repeat clicks communicate waiting. The
  separate upcoming Mint remains disabled and neutral until permissions are
  ready. Secondary styling is reserved for genuinely secondary actions, not
  for identifying an approval prerequisite.
- The final summary distinguishes “Approvals needed,” “Ready to mint,” and
  “Mint in progress.” It expresses coarse step readiness; the action alone names
  wallet signing versus chain confirmation. Empty, unloaded, blocked or
  insufficiently funded states use the existing neutral “Mint CMC20” text rather
  than falsely claiming readiness. Recovery can be ready to retry while its
  existing error message remains visible. This presentation does not alter gates.
- The summary has the same label-to-headline spacing, 24px content axis and label top inset as preceding
  sections, followed by 24px from explanation to action. Recovery uses 16px
  explanation/message and 8px message/action gaps. The action retains 8px side
  and bottom edges. Text wraps rather than truncating and the token mark stays
  32px; English ready/signing/confirming share the same geometry.
- Current-task emphasis is primary blue on the active label and main
  amount/count; completed content stays normal foreground and upcoming labels
  are muted without fading their amounts. The editable shares become neutral
  when attention moves to approvals or Mint, retaining their normal focus ring.
  `aria-current="step"` identifies the same region without relying on color.
  The small green completion check accompanies normal-foreground confirmation;
  structural arrows and section backgrounds do not become completion indicators.
  Mint's label and readiness text join its primary action in blue only while
  that section is current; the token identity and explanation stay neutral.
- Insufficient collateral is explained with the existing compact balance message
  directly below the amount. It keeps attention on that region and Mint blocked,
  but does not disable production-supported approvals. Completed allowances can
  truthfully coexist with insufficient balances; neither the check nor a full
  approval count implies Mint readiness. Active wallet/chain work takes emphasis
  while it is running. The local stage-emphasis recipe does not change shared
  amount-component defaults.
- Labels use the amount primitive's 16px light type, values use its responsive
  financial scale, and supporting text stays 14px. Each section uses the same
  24px content axis. Controls retain 8px horizontal edges and 16px setting/action
  spacing. Supporting content sits 24px above the following control/action.
  A middle-section button has 24px clearance before the arrow boundary rather
  than the final footer's 8px edge; otherwise the circle overlaps the button.
  The final section follows directly and spare host height stays below it.
- Switch to Zapper belongs to the first amount/configuration section, on the
  24px axis with its action right-aligned. Mode tabs remain compact; the amount
  starts 16px after them without a separate dominant heading.
- Redeem retains its one-transaction input/action relationship, without an
  empty approvals region. Right-column information and outcome treatment are
  unchanged.

This is a local composition trial, not a shared three-step transaction pattern.
The reducer, allowance amounts/defaults, aggregate request semantics and USDT
reset mismatch are unchanged. The separately discussed explicit Edit amount
interaction and relaxing the lab's global individual-approval lock while other
tokens confirm are **not implemented by this layout pass**. They need a bounded
follow-up; the lock must not be represented as a production requirement.

## Non-goals

No production changes, on-chain writes, SDK changes, allowance-policy changes,
shared defaults, commits, or pushes. Do not claim receipt-decoded outputs from
input fixtures. No CoW orders, quote routes, or redundant global stepper.

## Acceptance evidence

- Configuration: both modes, empty/non-preset/Max/insufficient amounts, loading,
  disconnected/wrong-chain host action, deprecated and restricted Mint exits.
- Approvals: individual Approve/Revoke, separate signing/confirmation boundaries,
  concurrent aggregate progress, partial failure, failed-only retry, ready Mint.
- Mint/Redeem: wallet request, confirmation, rejection/revert recovery preserving
  amount, terminal outcome/reset and mode-correct basket evidence.
- Lab controls explicitly simulate wallet/chain results; no actual wallet prompt.
  Enabled task actions advance fixtures; real explorer/navigation links retain
  correct identity shape and synthetic execution records remain preview-only.
- Mounted light/dark, 320/390px, intermediate and desktop review checks all states
  for clipping, associations, continuity, typography, and spacing. Required ledger
  actions remain visible on narrow screens. Reduced motion remains supported.

## Test seams

Pure lifecycle reducer plus rendered public controls and state selectors. Existing
Manual anchor browser checks pin accepted geometry; lifecycle checks exercise
non-preset journeys and partial progress. Catalog/type checks and wiki-lint at
closeout. Independent intent/risk review before handoff.

## Slices

1. Anchor hardening and source reconciliation; blocked by: none.
2. Configuration gates plus approval lifecycle with deterministic lab controls;
   blocked by: source reconciliation.
3. Direct transaction lifecycle and conservative outcomes using existing result
   primitives; blocked by: configuration/approval state owner.
4. Full visual and interaction verification, independent review, repairs, and
   documentation reconciliation; blocked by: lifecycle composition.

## Unresolved decisions

- Engineering must resolve the aggregate USDT Revoke mismatch, parallel wallet
  prompt behavior, address normalization, input grammar and minimum-output math.
  The lab exposes rather than repairs these boundaries.
- Persistent outcomes extend today's toast. Their displayed share amount is the
  submitted amount, not independently verified net shares. Basket values remain
  explicitly expected unless an executed source is later supplied by engineering.
- Production scroll ownership remains a migration decision. The user-approved
  desktop lab host is 736px with scrollable columns; mobile uses page scrolling.

## Experience and countercase

Keep the left task sufficient for what happens next, with per-token evidence on
the right. Preserve the same field/action seam through recovery. The three
regions describe existing Manual jobs, not Automated's collateral-acquisition
phases or order-panel model. The risk of this approach is
that aggregate progress must clearly distinguish concurrent permissions from the
single final transaction; verify that relationship in both columns.

## Status

Paused at the [verified transaction checkpoint](transaction-consolidated-regression.md#checkpoint-disposition).
Retain current human-directed refinements; no further general review pass is
scheduled. This is not blanket acceptance or production adoption. The review
map remains a resumption reference, not an unfinished implementation checklist.

## Review map

The Manual lab selector exposes 29 states in five groups:

| Group | Coverage |
| --- | --- |
| Review anchors | Mint requirements and Redeem preview; original amount, Max, mode, Unlimited, and row geometry retained |
| Configuration and access | Empty Mint/Redeem, five-row loading, disconnected/wrong-chain host CTA, insufficient basket/shares, restricted Mint with Redeem exit, deprecated Redeem-only |
| Permissions | Aggregate signing/confirming, mixed independent progress, partial failure, individual Revoke signing/confirming, after Revoke, ready Mint |
| Direct Mint | Wallet request, confirmation, rejection, revert, outcome |
| Direct Redeem | Wallet request, confirmation, rejection, revert, outcome; no approvals |

Selectors seed coherent review fixtures; a non-preset amount is preserved while
using task/simulator controls. A lifecycle preset substitutes a valid 100-share
example if the remembered amount is empty or insufficient. The synthetic
Ethereum basket is not the live CMC20 basket. Token explorer links are real;
View DTF is an explicit navigation simulation, not a different-chain destination.

Potential review on explicit resumption is visual: the persistent outcome trial, mixed per-token
progress beside the stable main action, narrow row wrapping, and local soft-blue
Approve treatment. Approval security/defaults are not human design choices here.
The existing count sentence can produce “1 approvals”; a copy-only singular/plural
correction is requested separately, not silently treated as approved.

## Review reconciliation

Independent intent/risk review identified missing underlying transaction errors,
aggregate versus individual USDT allowance differences, insufficient mixed-state
simulation, stale two-anchor-only guidance, and ambiguous repeated action names.
These were corrected with factual error help, captured bigint allowances,
symbol-targeted simulation, reconciled docs, and asset-specific accessible names.
The risk reviewer rechecked affected source and found no remaining material issue.

Browser review additionally corrected a synthetic-DTF navigation crash, subdued
processing-button continuity, trailing recovery-help placement, and premature
loading counts. Existing anchor geometry remains covered by its measured tests.
No generic component, shared default, production behavior, SDK, or policy changed.

## Verification

- `pnpm exec vitest run src/views/internal/design-system/tests`: 169/169.
- Mounted `manual-anchors.spec.ts` + `manual-lifecycle.spec.ts`: 6/6 on the
  existing client at port 3005. All 29 states checked at 320/390/1024/1280px
  in both themes; anchor geometry additionally covers 639/640/1023/1183/1184px.
- Representative rendered desktop/mobile views inspected for loading, wallet
  gates, mixed permissions, partial failure, direct recovery, and both outcomes.
- App/E2E typechecks, scoped oxlint, isolated new-copy extraction, four-language
  catalog compilation, wiki-lint, and diff checks.
- RED evidence: missing lifecycle module at the initial reducer seam; browser
  outcome navigation crash; obsolete accessible-name selectors after improving
  per-token names. Final lifecycle journey uses a non-preset 73.25-share amount.
- The broad scope runner was inspected but did not finish its mapped full gate.
  This lab-only stage uses the V1 bounded cadence; no full-repository or production
  smoke claim is made.

### Mobile follow-up

- The earlier 128px permission slot prevented a signing-state jump but forced
  controls into unnecessary extra rows. It is superseded by container-aware
  identity/action columns: natural trailing width on wide rows, equal tracks
  below 320px of row content. Names may wrap, and actions remain beside identity
  through signing/confirming/approved states. Loading uses the same column layout.
- Fresh mounted anchors/lifecycle/mobile checks: 8/8. The new transition check
  compares row and quantity positions at 320/360/375/390/430/640/1024px; short
  and landscape viewports verify amount entry, tooltip containment, mode-value
  preservation, main-action reachability, and access to the last asset.
- Focused Manual unit tests: 19/19; app/E2E typechecks, scoped lint, wiki/diff
  checks. Light/dark lifecycle coverage was rerun; 320/390px rows inspected.
- Short viewports approximate reduced usable height, not native mobile-keyboard
  behavior. No copy, approval policy, or shared component defaults changed.

### Dense-row and supporting-copy follow-up

- Revoke uses the accepted neutral inline action rather than a padded quiet
  Button. Its full explanation and failed-state marker remain; Approve keeps
  the existing local soft-blue trial and status pills retain their defaults.
- In constrained rows, addresses deliberately retain an ellipsis and their final four
  characters, with the full value in accessible/hover text and the correct
  token explorer destination. Required/balance units use a consistent second
  line below 272px of row content; long numeric/fiat values remain contained.
  Insufficiency stays visibly stated with shorter narrow-row wording, never
  only a color or tooltip.
- Switch to Zapper now produces a nearby, explicit lab navigation preview
  without discarding the manual amount or executing a swap. This is not a
  production navigation integration.
- Recovery's banner identifies the failed assets; the action says Retry N
  approval(s). The approval section keeps its progress outside the button;
  the button communicates the pending phase without a second counter. Redeem
  retains its explanatory processing context. New wording is
  translated in all four supported languages; permission/retry mechanics stay
  unchanged.

## Authorized recovery and outcome refinements

The user authorized the audit's small-improvement list after the mobile pass.
This is a bounded, flow-local presentation change, not an approval-policy review.

- The existing failure summary names affected symbols; an alert icon in each
  failed asset's existing action marks the row without adding a tier. USDT still
  offers Revoke and its existing explanation; aggregate retry is not repaired.
- Only the known simulated pre-submission rejection uses information-tone
  `Signing declined`; on-chain/unknown failures retain danger treatment. The
  underlying reason remains accessible in help. This fixture distinction is not
  a production error-string classification contract.
- Sufficient allowances replace the approval instructions and controls with
  `Required tokens approved`, without retaining invisible control geometry.
  The setting value stays in the session and the control returns if
  edited requirements need approvals again. Its help unmounts when replaced.
- Outcomes retain the prominent Completed pill and Network detail. Minted/Redeemed
  identifies the share amount, with the same indicative USD share valuation used
  by the input beneath it; this is not a receipt-derived cash amount. The
  default-sized secondary View transaction footer action opens an explicit
  Etherscan navigation preview, never a fabricated hash or unrelated transaction.
  Production adoption must retain the submitted hash through confirmation.
- The basket headings are Basket assets used/received, with Estimated amounts
  explicitly qualifying the fixture quantities and total. The intended outcome
  should use confirmed quantities when available; submitted amounts and estimates
  do not become executed evidence through relabeling.
- View DTF remains the primary page continuation beside View transaction.
  New mint / New redeem in the header preserves the prior Done/reset behavior
  without a third footer button or duplicate explorer detail row.
  No approval ledger, wallet-balance claim or unsupported fee,
  slippage or exchange-rate detail is added to the completed result.
- The desktop outcome fills the 736px column, with surplus height between the
  status and amount inside the brand region, not below the footer. Both footer
  buttons retain canonical default sizing and the 8px edge. Mint reuses Zapper's
  bookmark action beside the received DTF; Redeem does not offer to track burned
  shares. Bookmark feedback is simulated and performs no wallet write.

Verification: 173/173 design-system tests and 9/9 mounted Manual tests, app/E2E
types, scoped lint, catalog compilation and wiki/diff checks. New rendered
tests failed before implementation for missing token attribution/readiness,
rejection treatment, and duplicated outcome status. The mounted readiness
journey covers finite allowances, retained Unlimited-off, and compact completed
content at 320/390/1024/1280px. No production, reducer policy, or shared default
changed. Visual acceptance remains the user's next step.
