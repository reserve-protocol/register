# Current rebalance workspace — verification

The September 13 auction-owned hierarchy revision is ready for human review,
not production adoption. This receipt supersedes the earlier 27-case workspace
receipt and its rejected geometry. Contract:
[workspace brief](../design-system-current-rebalance-workspace.md).
Claude's [source audit](../design-system-current-rebalance-flow-audit/report.md)
is preserved unchanged.

The [September 13 checkpoint](../design-system-review-checkpoint-evidence-2026-09-13/README.md)
losslessly externalizes this package's report attachments. Resolve attachment paths
relative to their JSON report. Historical timestamps/source digests remain unchanged;
fresh checkpoint captures live separately and do not overwrite these named images.

## Recent feedback — current candidate

The [weight summary and unit-label follow-up](weight-summary-followup/README.md)
is the latest bounded change: unconfirmed estimates stay visible as dashes above
Duration, with one prerequisite explanation; Current units and New units restore
the familiar editor terms. Nineteen browser checks pass, including reload and
missing-price cases. Production behavior remains unchanged.

The [auction-size editing affordance](limits-affordance/README.md) is the preceding
bounded follow-up: an outlined pencil/disclosure control with the production
USD/default explanation. Editing and save behavior are unchanged; 12 browser
checks pass, with closed/open desktop and phone captures inspected.

The [weight comparison clarification](weights-clarity/README.md) retains
first-auction confirmation, distinct current/starting/edited
targets, and explicit local-save/reload meaning. It supersedes the weight labels
and comparison fixture in the state-composition receipt, not that candidate's
other state interiors. Only this weight-copy direction has been approved; other
proposed status wording remains held.

The latest [state-composition candidate](state-composition-verified/README.md)
supersedes the state interiors described below: compact hybrid setup and initial
context, visible saved weights, exchange-led live bids and selected chart labels,
grouped outcomes, and locally owned cap/transaction feedback. It retains the outer
card, expiry/Details treatment, full asset stacks and borderless history. New
status copy remains held pending the user's decision. The receipt distinguishes
fresh post-repair proof from earlier captures and lists remaining product/engineer
questions; previous runs below retain their original scope and source bindings.

The [bounded batch](../design-system-current-rebalance-workspace.md#september-13-recent-feedback-batch)
groups each auction description 8px below its heading, puts hybrid weight editing
beside Basket with a prerequisite-blocked Start in the operation column, and aligns
live chart/Bids headings and plot/timestamp edges. A schematic Now point follows
the default-running, pausable preview clock; unknown auction state hides it.
The guarded history handoff exists only in collapsed Lab simulation controls.
Complete asset stacks, centered header, preparation bottom alignment and history
remain unchanged. No production behavior, shared defaults or chart system changed.

### Fresh verification

**Expiry emphasis:** the remaining time now consumes the foreground 14px/500
label role; Expires in and proposal metadata remain muted 14px/300. Position,
formatting, Ended handling and the Details button are unchanged.
[Header report](expiry-emphasis/browser-report.json): **8/8 passed** across
1400/900/390/320px in light/dark. Checks pin matched inline sizing, color/weight,
header geometry and popover/expiry behavior. Owner inspected light desktop and
dark phone; E2E types, scoped lint/format and docs checks pass. Touch-up/self-review.

**Borderless liquidity tables:** TableHeader's descendant selector was overriding
the row's border-free class. A local matching override removes the Selling and
Buying header divider without changing shared defaults or main section separators.
The computed-border regression failed at **1px** before the fix and now checks
every header/body row in both tables. [Focused report](liquidity-borderless/browser-report.json):
**4/4 passed** at 1400/900/390/320px. Owner inspected the
[desktop capture](liquidity-borderless/hierarchy-1400-liquidity.png); E2E types,
scoped lint/format and docs checks pass. Touch-up/self-review only.

**Auction clarity follow-up:** scenario-backed preparation purpose, plainer
permission timing, Execution target help, a quieter recap heading and simulation
controls outside the product article. Source inspection traced the target to the
installed rebalance library's initial-progression-normalized auction target;
no production calculation or launch policy changed. The new control-ownership
test failed before the move. The first implementation run exposed mobile pill
alignment and a 2px subtitle-gap mismatch; both were corrected.

The [scoped report](clarity-refinement/browser-report.json) passed **47/47**;
after tightening only the phone clock/pill gap, the
[final responsive report](clarity-refinement/final-report.json) passed **12/12**.
Each report preserves its own source-bound attachments. Named captures reflect
the latest run for their suite. Owner inspected [desktop](clarity-refinement/composition-1400-repeat.png),
[390px](clarity-refinement/clarity-light-390-repeat.png),
[320px](clarity-refinement/clarity-light-320-repeat.png), dark desktop and hybrid
phone states. Target label/value fit and 390px clock/pill alignment are asserted.
App/E2E types, scoped lint/format and documentation checks pass. Low-profile
local self-review; the accumulated-tree medium size signal does not widen this
lab-only presentation/controls scope. No fresh full repository, unit or CI claim.

**Percentage-only summary follow-up:** removed the local cumulative progress bar
from ongoing and outcome summaries, retaining numeric, pending and unavailable
values. [Focused report](percentage-summary/browser-report.json): **8/8 passed**
at 1400/900/390/320px in both themes. E2E typecheck and scoped lint pass.
Owner inspected the [desktop summary](percentage-summary/review-light-1400-repeat.png)
and [phone summary](percentage-summary/review-light-390-repeat.png). Existing
stacked desktop and matched 14px inline phone facts remain; history is unchanged.
This is a touch-up with self-review, not a fresh whole-flow or production claim.

**Subsequent chart-edge correction:** the earlier checks aligned the plot with its
timestamps but missed their shared 8px inset from the caption, description and
note. The strengthened desktop regression failed with an 8px delta before the
local SVG/time padding was removed. Chart strokes may extend beyond the SVG
viewport so endpoint marks are not clipped; the surrounding card inset is intact.
The [focused report](chart-alignment/browser-report.json) passes **6/6**, no
failures/skips/flakiness, starting **18:46:10 UTC**, duration 32.0s. Its six
source attachments match public digest
`0256cfb2f44019328cbf5ec7c0d1d071b1707edcc94592e1f771726f5a99c712`;
all 16 attachments round-trip to report digest
`dfc4d33eb6e145ef812d2246e873a64e1fa13ab152cca7fe3b22266a433cbaa1`.
Owner inspected [light desktop](chart-alignment/feedback-1400-live.png),
[light 320px](chart-alignment/feedback-320-live.png),
[dark desktop](chart-alignment/sections-dark-1400-live.png) and
[dark 320px](chart-alignment/sections-dark-320-live.png). App/E2E types,
scoped lint/format and docs checks pass. Low-profile local correction and
self-review; accumulated evidence causes scope's medium size hint, not a widened
boundary. No fresh whole-flow/unit/CI claim. The separate hybrid-layout proposal
has not been implemented. Earlier reports below retain their own source versions.

The [broader browser report](recent-feedback/browser-report.json) passed **78/78**,
with no failures, skips or flaky cases, starting **18:12:24 UTC**, duration 297.0s.
Its 78 source attachments share public digest
`fff8bdc62edeae17e8876cb7dea12af281656a44c7bfe287e03c1abce8ac7011`.
All 229 attachments are retained; lossless externalization round-trips to report
digest `9bc596406e0fae3ce924873b0d4ea23fbd9ab22db16eb240a5fb2f734bd19ef8`.

After correcting stale descriptive lab metadata and its area guide, the
[final focused report](recent-feedback/final-report.json) passed **9/9**, with no
failures, skips or flaky cases, starting **18:18:00 UTC**, duration 37.1s.
All nine source attachments match the final 2,421-file public digest
`ba96915176fe0a78971fc84cb62022677c144c05480ec90a609ec3140a2b12e7`.
Its 18 attachments round-trip to report digest
`cbf26701a37f97d5e2db98bdd2c4d30b448180576f2bcc153fdbca4308c8ecc6`.
Each report preserves its own capture bytes; the named feedback images reflect
the final pass. Functional application code was unchanged between these runs.

Current model/result/workspace/clock/scene/source units passed **34/34** in six
files. Final app/E2E types, scoped oxlint/Prettier and docs checks passed. The browser
checks include ordinary non-preset weight edits, wallet/network/data gates,
recovery, responsive ownership and clock advance/pause under both motion
preferences. This is bounded lab verification, not a full repository gate or CI
claim. The owned test preview exited; the user's 3005 preview remains running.

RED established missing description ownership, misplaced weight editing, absent
current marker, stopped preview clock and the product outcome handoff. The negative
handoff assertion initially ran before mounting; waiting for the outcome made it
fail correctly. The first GREEN pass was 7/9: two SVG alignment measurements used
paint bounds with a 2px outset. Native path geometry confirmed the centerline;
correcting that measurement produced the final passing alignment checks.

### Visual review and disposition

The bounded read-only Dark/Light pair found no additional correctness or intent
blockers. The primary owner completed their requested final rendering proof:
[desktop live](recent-feedback/composition-1400-live.png),
[dark desktop](recent-feedback/sections-dark-1400-live.png),
[dark 320px chart](recent-feedback/sections-dark-320-live.png), and separately
the full expanded bid at [320px light](recent-feedback/review-light-320-bid-expanded.png)
and [390px dark](recent-feedback/review-dark-390-bid-expanded.png).
Final [description](recent-feedback/feedback-1400-description.png),
[phone weights](recent-feedback/feedback-320-weights-required.png) and
[completed outcome](recent-feedback/feedback-complete.png) were inspected too.
Unknown-state guards and timer cleanup were traced; no automatic archive or
launch re-arming was introduced. Existing workflow rules cover the measurement
and premature-negative-assertion lessons; no workflow-kit change is warranted.

Human visual review remains open. The curve and bid prices remain illustrative,
and offline asset art can fall back to existing placeholders. No real transaction,
production adoption, commit or push occurred. Engineer review remains required
before adopting any auction-flow behavior in production.

## Preparation asset summaries — latest follow-up

### Full-stack revision — current

**Latest width follow-up:** Selling/Buying use their full allocated plan column,
without the redundant 672px cap. The action column, 24px separator gap, 3:2 split,
14px muted type and natural wrapping are unchanged. The separate hybrid Basket
retains its bound. RED measured a 40px/two-line Buying list at 1400px; GREEN
measures 20px/one line with SUI included and the original 24px gap.
The [asset and hybrid report](asset-plan-width/browser-report.json) passes
**10/10**, no failures/skips/flakiness, starting **19:17:08 UTC**, duration 49.4s,
with source digest `884d271dc6d318e099f574f6db137e3ad5271e9b63e3f4d87d94788303c33782`.
After formatter-only cleanup, the [final desktop recheck](asset-plan-width/final-report.json)
passes **2/2**, starting **19:18:13 UTC**, duration 21.3s, with final source digest
`057e768f204564cb2516aafa1fe28d3078a72d19a52ec14bb12906e99a2838c8`.
Both reports retain losslessly externalized attachments. Owner inspected
[desktop](asset-plan-width/assets-light-1400-repeat.png),
[900px](asset-plan-width/assets-light-900-repeat.png),
[320px removal](asset-plan-width/assets-light-320-remove.png) and
[dark phone](asset-plan-width/assets-dark-390-repeat.png). E2E types, scoped
lint/format and docs checks pass. Touch-up/self-review; scope's medium size hint
is accumulated work, not an expanded shared boundary. No significant downside
found in these states; no fresh whole-flow/CI claim. No progress-bar change,
hybrid redesign, production change, commit or preview restart.

**Earlier typography follow-up:** ticker lists now use the existing muted
14px/20px supporting role. The 32px logos, group labels, complete order and 8px
logo/text gap are unchanged. RED received 16px where 14px was required; the
[focused report](muted-asset-lists/browser-report.json) then passed **8/8**, no
failures/skips/flakiness, starting **18:48:57 UTC**, duration 43.2s. All eight
source attachments match final public digest
`56856ad6df2ec6474ce4995ed04d35b7a5ec6362e97557063d5850e9c5e96d1a`;
24 attachments round-trip to report digest
`8c8605558b13fe3f23bffe03a48d3e98543d58966568f4b58c8c0cd1f8d70962`.
Owner inspected [desktop](muted-asset-lists/assets-light-1400-repeat.png),
[320px removal](muted-asset-lists/assets-light-320-remove.png) and
[dark phone](muted-asset-lists/assets-dark-390-repeat.png). E2E types,
scoped lint/format and docs checks pass. Touch-up/self-review only: scope's medium
size hint includes accumulated work, not a shared/default change. No fresh broad
flow/unit/CI claim; user preview preserved, no commit or production change.

The user's latest direction supersedes the individual-grid trial below. Each
Selling/Buying group uses the canonical 32px logo stack with every asset and the
complete comma-separated ticker list 8px beneath it, preserving order. Local
adaptive overlap keeps the 17-asset removal case contained at narrow widths;
the text wraps without a `+N` abbreviation. Bottom-aligned desktop preparation,
top-aligned live bids, mobile reading order and the full liquidity disclosure
remain intact. No shared defaults or production behavior changed.

RED: the new full-stack assertion failed on the individual grid. The
[layout report](full-asset-stacks/browser-report.json) passed **22/22**, no
failures, skips or flaky cases, starting **17:57:47 UTC**, duration 88.6 seconds.
Its 22 source attachments share public digest
`56f516c177602f8248f40ff32302a1ce58675af5d40a68470f3287c38f102af3`.
All 59 attachments were preserved with lossless report round-trip digest
`b57d8f6a7cca9f1f736c2345a3624b65eaa37610b6afeb15db17e9a281bd7cfa`.

After a test-formatting-only correction, the [final asset recheck](full-asset-stacks/final-report.json)
passed **8/8**, no failures, skips or flaky cases, starting **18:00:24 UTC**,
duration 42.2 seconds. All eight source attachments match the final 2,420-file
public digest `f82f368a64383344d267e7b8b60aea0496ce62c9691ad6ed1e38b6a38c665869`.
Its 24 attachments round-trip to report digest
`8f36bb026f3ddc34ed54f7a515934be3c92fff9cab0911687759298c709904f2`.
App/E2E types, the workspace mount unit (1/1), scoped lint/format and final docs
checks pass. The unit run used its existing offline wallet-config fallback.
This low-profile local follow-up uses scoped verification and owner self-review,
not a full lifecycle/CI run or checkpoint. The test preview exited normally;
3005 stayed running and no commit or push was made.

Owner inspected [desktop](full-asset-stacks/assets-light-1400-repeat.png),
[320px removal](full-asset-stacks/assets-light-320-remove.png), and
[dark phone](full-asset-stacks/assets-dark-390-repeat.png). Offline captures retain
the existing fallback logos where token artwork is unavailable. No chart,
weights-editor, subtitle or transaction changes are included in this follow-up.

### Earlier individual-grid trial

The user requested fuller Selling/Buying summaries instead of the fixed two-token
stack. This earlier trial used individual 24px TokenLogo/body ticker pairs in a three-row grid:
two columns below a 288px side width, three above. Lists of six/nine fit completely;
longer lists reserve the last slot for `+N`. The full liquidity disclosure retains
detail ownership. No shared logo defaults, fixture order, launch behavior or
historical table geometry changed; metadata-unavailable remains unknown.

RED: the new individual-asset check failed on the old stack. Fresh
[browser report](asset-summaries/browser-report.json): **12/12**, no failures,
skips or flaky cases, starting **17:48:05 UTC**, duration 56.4 seconds.
All source attachments match public digest
`b55d6827cab4787fe45438154205ca2070f6fed239736758fc01cc3a8c947fb5`.
All 36 attachment bytes were retained with lossless report round-trip digest
`84259afdebdc193357ac1f73689ef862153a98ee0768bb417b1b32b2701c1f8e`.
App/E2E typecheck, focused oxlint/Prettier, wiki and diff checks pass. No fresh
full-lifecycle/unit/CI claim for this isolated presentation follow-up.

Owner inspected [wide](asset-summaries/assets-light-1400-repeat.png),
[middle](asset-summaries/assets-light-900-repeat.png),
[320px](asset-summaries/assets-light-320-repeat.png), and
[dark asymmetric removal](asset-summaries/assets-dark-390-remove.png).
Checks cover both themes at all four widths, overflow counts, unavailable/pending
metadata context, resizing, retained disclosure and live bid selection.
Low profile: one local presentation owner and one focused spec; scope's medium
size hint includes the accumulated dirty tree and earlier evidence. Correctness,
intent and product self-review only. Earlier candidate work remains preserved.
The test preview exited; 3005 remains running. Nothing committed or pushed.

### Bottom-aligned preparation operation

The subsequent user-directed refinement bottom-aligns the whole wide preparation
terms/action group, leaving surplus height above it. Live bids remain top-aligned;
mobile order, internal spacing and full-height separator are unchanged. RED
measured the preceding 72px bottom gap. Fresh
[focused report](bottom-aligned-operation/browser-report.json): **22/22**, no
failures, skips or flaky cases, starting **17:51:06 UTC**, duration 85.9 seconds.
All source attachments share final public digest
`3599786b11d1f69e38e27504beb30203cb290b3679e86aaffd53730b837c1d0a`.
The 59 attachments round-trip to report digest
`630d974c9614eccb8fbf303144b974dca58c84c37ab806e09fa6c4fb33ea3009`.
App/E2E types, scoped oxlint/Prettier, wiki and diff checks pass.

Owner inspected [desktop](bottom-aligned-operation/assets-light-1400-repeat.png),
[non-launcher at 900px](bottom-aligned-operation/hierarchy-900-member-bottom.png)
and [dark phone](bottom-aligned-operation/assets-dark-390-remove.png). Geometry
checks pin both preparation bottom alignment and unchanged live top alignment.
Low-profile local composition adjustment; scope's medium size hint reflects the
accumulated tree, not a widened shared boundary. Existing work and previews are
preserved. No fresh full-lifecycle/CI claim or production adoption.

## Independent visual-review refinements — preceding candidate

The [independent visual review](../design-system-current-rebalance-visual-review/report.md)
is reconciled in the [workspace contract](../design-system-current-rebalance-workspace.md#september-13-independent-visual-review-refinement).
This pass preserves the single card, three bands, 24px axes and retained history.
Status and its event clock share the auction heading; the plan owns its disclosure
position. Desktop results stack with progress attached to its own fact, outcomes
use one group, bids expand beneath their own row, and long asset inspection closes
at its end with focus return. Invalid fields have associated lab explanations.
History handoff retains its existing focus destination and leaves a current empty
state; transferred trade values use the history's whole-dollar precision.

The fixed 440px rail, hidden launcher timing or still-open deadlines, conflated
metrics, arbitrary 48px asset rows, changed dark tokens, alternate Details behavior
and new production copy were not adopted. The schematic chart is unchanged; bid
ownership is improved, not evidence of a redesigned or financially accurate chart.

### Verification and review

The [full regression report](visual-review-refinements/browser-report.json) passes
**74/74**, no failures, skips or flaky cases, starting **17:16:21 UTC** and lasting
313.2 seconds. Its source attachments share public digest
`e084349473a8557929c8ad0d2117fd28df8f838119d41085c15e14f400aa8497`.
All 310 attachments resolve; lossless externalization preserves canonical report
digest `bec7cfa89b77c1f881dfb63ee202b27c6cca4d5773b6810422e624e922bf45d3`.

Final visual inspection then exposed an 8px neighboring-fact alignment offset at
900px, reproduced RED before applying `self-start` to the summary fact. This does
not change historical table cell centering. Long-list screenshot framing also
now awaits disclosure motion and asserts the closing control is in the viewport.
The [final focused recheck](visual-review-refinements/alignment-report.json) passes
**39/39**, no failures, skips or flaky cases, starting **17:24:10 UTC**, duration
148.7 seconds. All source attachments match the final 2,419-file public digest
`af183580b0373eb3d300dbe161e35f415e5552e9b32c51a77bac8b218617f82d`.
Its 138 attachments resolve and round-trip to canonical report digest
`5bd712c2ae05463b7be0f59ea8dc271a312f7103c0f09bd11c92bd5006720839`.
This is separately source-bound from the 74-case report. Named screenshots may
reflect this final recheck; each report retains its own original image bytes in
`attachments/`.

Focused unit tests are **34/34** in six files, including whole-dollar
rounding/unknown-value projection; final app/E2E typecheck and scoped
oxlint/Prettier pass. The owned 3022 test preview exited normally; the user's 3005
server stays running. This is a bounded lab iteration, not a full repository gate,
checkpoint or production adoption.

RED: all five new behavioral checks failed on the pre-change UI. The first
implementation run passed 11/13: bid measurement needed to await canonical
disclosure motion, and the handoff assertion incorrectly expected focus on the
empty current section instead of the existing History destination. Both corrected.
The wider 74-case pass then returned 69/74: four tests exposed a genuine 16px bid
overhang, fixed by retaining only the left inset compensation; one old outcome
measurement assumed the first fact contained a help span, updated to measure all
seven label/value gaps. No product behavior was changed to satisfy those harness
assumptions. Final captures are refreshed in `visual-review-refinements/` only;
earlier audit and checkpoint evidence remains untouched.

Dark/Light reconciliation: both independently confirmed the bid overhang (Dark:
Important; Light: Minor). The scoped fix is `-ml-4`, retaining canonical disclosure
padding and visible open state without right expansion. No other scoped blocker
was found. The reviewers required post-repair containment, below-fold phone
inspection and final type/browser proof; final owner verification owns that check.
Shared surface and product-copy questions remain explicitly deferred. No new
design-system component or shared default was needed.

Owner visual inspection includes [desktop live](visual-review-refinements/composition-1400-live.png),
[middle-width preparation](visual-review-refinements/composition-900-repeat.png),
[phone bid ownership](visual-review-refinements/review-light-320-bid-expanded.png),
[dark phone bids](visual-review-refinements/review-dark-320-bid-expanded.png),
[bottom liquidity closing control](visual-review-refinements/review-light-390-assets-close.png),
[phone focus return](visual-review-refinements/review-light-390-assets-return.png),
dark preparation/outcomes, weight-validation states and expanded liquidity.
The actual 3005 preview was inspected in a separate temporary tab, including a
390px constrained expired/indexing/unavailable simulation and its disabled launch
and history actions. Only fixture controls were exercised; the temporary tab was
closed, and the user's preview process was not restarted. Production sources,
shared components, dependencies and lockfiles have no diff from the fixed point.
Human visual acceptance and the existing engineer-owned production adoption
gates remain open. Nothing committed or pushed.

Runtime: bundled Node 24.19.0/pnpm 11.19.0, not the pinned pnpm 11.5.2/CI environment.
Commands use `pnpm_config_verify_deps_before_run=false`. Initial runner attempts
without that override aborted dependency reconciliation before changing modules;
the generic scope runner likewise aborted at its first command. Its corrected
dry run reports correctness/product, a medium size hint and no red flags. Focused
commands implement the repository's bounded-lab cadence; no full-gate claim.

## Earlier outlined Details and header insets

### Current follow-up: centered desktop Details

Details now centers vertically against the complete title/metadata block above
the existing 512px container breakpoint. Narrow top alignment, 24px content/right
insets, 8px text gap and the canonical button/popover are unchanged. The new
center-offset assertion first failed on the old 5px offset. Fresh
[header report](centered-header/browser-report.json): **8/8**, no failures,
skips or flaky cases; light/dark at 1400/900/390/320px, including keyboard and
expired inspection. All source guards match current digest
`337638fe5ef486ae82caeb900a9ad64e202b6aefae304dd2bb1559fd2691a9ef`.
Owner inspected [desktop](centered-header/header-light-1400.png),
[phone](centered-header/header-light-390.png), and
[dark open panel](centered-header/header-dark-900-open.png).
App/E2E types, scoped lint/format and docs checks pass. Local touch-up/self-review;
no shared default, production change, checkpoint, commit or preview restart.

### Preceding top-aligned treatment

The user requested a ghost or outline control. Details now uses the unchanged
canonical secondary Button, including its 44px height, padding, outline, hover
and trailing-chevron gap. Its visible top/right edges are both 24px from the
card. The title also starts at 24px. At wide widths the action spans both header
text tracks so the title/metadata pair owns its 8px gap; narrow metadata remains
full width. Standard button width naturally makes the title wrap on phones.
This replaces the earlier no-fill InlineAction choice, not the details content,
keyboard behavior, auction composition or historical table.

RED reproduced the previous 33px title inset and 13px metadata gap. Fresh
[header/section report](outline-header/browser-report.json): **16/16**, no
failures, skips or flaky cases, starting **15:28:37 UTC**, duration 84.6 seconds.
All 16 source attachments match the final public source digest
`5de84969618d36979b534912b95d1bb2c3d3738055f2a5de68010d3a74421557`.
All 64 report attachments resolve and lossless externalization round-trips.
App/E2E typecheck, scoped lint/format, diff check and wiki lint pass. No fresh
unit/full-lifecycle/CI claim for this isolated presentation follow-up.

Owner inspected [desktop](outline-header/header-light-1400.png),
[390px](outline-header/header-light-390.png), and
[320px dark](outline-header/header-dark-320.png), including open-panel captures.
Direct measurements on the user's 3005 preview confirmed 24px title/top/right
insets, 8px title/metadata spacing and an actual 44px button. Low profile;
intent/correctness/product self-review. The 3022 test preview stopped normally;
3005 stayed running. Earlier evidence is unchanged and remains scoped to its
recorded source. Nothing committed or promoted to production adoption.

## Earlier compact auction composition

September 13 follow-up to `289b2af86e8245ced89d9058a09182799c65f825`.
The Auction N heading spans plan and operation, with objective status at the far
right. Wide Selling/Buying groups share a row, the description belongs to that
plan, and one canonical vertical separator distinguishes the launch terms. The
compact asset disclosure ends the left plan beside the action instead of adding
a full-width footer below it. Full-width inspection and narrow plan/action/list
order are retained. On narrow live auctions, title/status share a row and the
timer follows beneath them. No new copy, nested surface, shared default or
production behavior is introduced; history is unchanged.

RED measured a **72px** disclosure/action bottom mismatch before implementation.
The new preparation checks require at most 4px; the rendered wide result aligns
the two bottoms. The initial RED assertion also exposed 16px of local horizontal
overflow from the former full-width negative margin, removed by this restructuring.
One initial test invocation selected the project incorrectly and never ran; the
corrected invocation produced the expected layout failure.

Fresh [browser report](composition/browser-report.json): **57/57**, no failures,
skips, retries or flaky cases, starting **14:59:19 UTC** and lasting 241.5 seconds.
This covers all current workspace suites plus retained historical tables.
All 50 current-source attachments share public digest
`c66c7c159493b44585c9a0fcb0d52a950ab510856eba69e166bb2641e3945407`.
The checkpoint attachment externalizer was reused with output redirected to this
new evidence directory; existing captures and earlier checkpoint files are unchanged.
All 243 attachments resolve, and reconstructing embedded bodies preserved the
original canonical report digest. Raw report size reduced from 43MB to 127KB.

Owner visually inspected [desktop](composition/composition-1400-repeat.png),
[900px](composition/composition-900-repeat.png),
[phone](composition/composition-390-repeat.png),
[320px live](composition/composition-320-live.png),
[dark preparation](composition/dark-1400-ready-top.png),
[dark phone live](composition/dark-390-live-top.png),
[hybrid prerequisite](composition/light-390-hybrid-top.png), and
[expanded liquidity](composition/sections-light-1400-expanded.png).
The ordinary user preview on 3005 also showed the revised preparation directly.
Tests preserve expanded-list/bid selection through resizing, keyboard focus,
44px targets, matched inline type, failure recovery and section spacing.

Five focused current-workspace/model/clock/scene/source unit files passed **28/28**.
App/E2E typecheck, scoped lint/format, diff check and wiki lint pass. Node 24.19.0
and bundled pnpm 11.19.0 were used (repository pin 11.5.2); no dependency install,
CI, full repository suite or production-transaction claim. Browser tests used one
worker on owned port 3022; the user's 3005 preview was not restarted.
Low-profile, isolated presentation reflow: scope's size hint includes generated
evidence. Owner self-review covered intent, correctness, product/keyboard behavior
and visual quality; no independent-review claim. No workflow-kit change was needed.
Human visual acceptance and the existing engineering-adoption gates remain open.

## Earlier compact spacing

The compact liquidity assessment and live Ends in pair now opt into an 8px gap,
instead of inheriting the 16px minimum from full-width detail rows. Their label
and value remain 14px/20px. Launch terms, totals and other aligned detail rows
retain their defaults. Expiry is a normal-weight sentence in proposal metadata;
the clock is removed, Details stands beside the title, and narrow metadata lines
share a left edge without a dangling separator. No production behavior changed.

RED reproduced the 16px liquidity gap and expiry outside provenance. The
[spacing/layout report](final/spacing-report.json) passed **28/28** at 14:10:45 UTC,
with public digest `f73df7a57d9030fe92a2c4dcd8410e908e6b09cd0818c52faff2014425f900e8`.
It covers sections, compact pairs, live/expired states, liquidity, header and
hierarchy. The subsequent narrow-header alignment has its own
[final header report](final/spacing-header-report.json), **8/8** with no retries,
at public digest `50d7102bb01de1cf71ce2623738bb63e2ef5e414f5dca23159bd233b02dac3e2`.
It does not invalidate
the unchanged liquidity/operation results or imply a full lifecycle rerun.

Owner inspected final [desktop header](final/header-light-1400.png),
[390px header](final/header-light-390.png), [320px dark](final/header-dark-320.png),
[expanded desktop](final/sections-light-1400-expanded.png) and
[expanded phone](final/sections-light-390-expanded.png). The latter pair belongs
to the 28-case spacing checkpoint; only header metadata changed afterward.
Self-review covered intent, correctness, default preservation and responsive UX.

The focused transaction composition unit suite passed **45/45**, protecting the
reused detail row's existing consumers. App/E2E typecheck, scoped lint and format
pass; repository lint exits zero with existing warnings. The broad scope runner
includes 525 accumulated files and is not this isolated follow-up's gate. Its
first lint launch lacked the runtime dependency-check override and aborted before
running lint; rerunning lint with the established local runtime passed. No package
or lockfile changed, no installation was completed, and no CI/full-suite claim
is made. Low profile: the only reused API change is opt-in, not a shared default.

Keyboard verification caught a harness race after immediate reopen: visibility
preceded focus readiness. The first correction incorrectly expected link autofocus;
source inspection confirmed Radix excludes links and initially focuses the panel.
The test now waits for that actual panel focus, Tabs to the first link, then checks
Escape and return focus. The interrupted test preview was identified and stopped
on 3022 before rerunning; user 3005 remained untouched.

## Earlier section boundaries

Two inset canonical Separators now distinguish general header, working auction
and cumulative results, without new card surfaces or nested outlines. Auction N
and Rebalance so far share the 16px heading role. The subordinate 14px disclosure
keeps label, token count and chevron together at every width; its expanded table
still spans the working area. Estimated trade liquidity is inside the disclosure,
not detached beneath Buying. Specific warnings remain visible before launch.

Fresh [section/action/detail/hierarchy report](final/sections-report.json):
**27/27**, no failures, retries, skips or flaky cases; September 13 **14:00:59 UTC**.
All 27 source attachments share public digest
`747a4d9df7e8ccc70680792dfaa296036324ed735123edcaa0633604d1504bed`
(2,413 files). App/E2E typecheck and scoped lint/format pass. No unit/CI/full-repo
rerun is claimed for this isolated visual follow-up; shared defaults and production
auction logic are unchanged. Owner self-review covers intent, correctness and UX.

RED proof caught absent boundaries, a **1,336px** stretched disclosure and its
section-sized label. GREEN covers 24px boundary spacing, matched content axes,
compact control and visible count, 44px-or-larger hits, keyboard open/close,
full-width expanded rows, live/expired continuity, role/data/transaction recovery,
liquidity retry and history handoff. No wallet sends occurred.

Owner inspected [desktop](final/sections-light-1400.png),
[phone](final/hierarchy-390-repeat.png),
[320px expansion](final/sections-light-320-expanded.png),
[dark desktop](final/sections-dark-1400.png),
[dark live middle width](final/sections-dark-900-live.png) and
[cumulative/history context](final/sections-light-390-progress.png).
These captures supersede prior section geometry, not human design acceptance.
Direct inspection on 3005 also checked the expanded table's final rows and totals
above the separator, cumulative results below it, and history following the card.
The test preview used and released its own 3022 port; user 3005 was not restarted.

## Earlier header follow-up

Subsequent copy-only cleanup removes the redundant connected-launcher label above
Start auction. Restricted-access guidance remains for visitors/non-launchers;
permission checks are unchanged. Scoped lint/format and direct preview inspection
cover this cleanup; the frozen browser digest below precedes it.

The user rejected the vertically stacked expiry and rounded information trigger.
The popover opened in direct reproduction; the malformed appearance came from
zero horizontal padding on a rounded quiet Button. The private header now pairs
clock/expiry with the canonical text-only InlineAction labeled Details. Both use
14px/20px; the actual 44px trigger has no rounded hover fill and its arrow rotates
when open. The panel can scroll if constrained. No shared defaults or auction
behavior changed. Low-profile isolated UI fix; owner self-review covered intent,
correctness, responsive geometry and keyboard access.

[Header/hierarchy report](final/header-report.json): **18/18**, no failures,
retries, skips or flaky cases, September 13 **13:52:42 UTC**. All 18 attachments
share digest `5c06afd27f5aaa683768c5049afd92e9d95a324e5843b273ddf1c8269af8757a`
(2,412 public files). Eight header cases cover light/dark 1400/900/390/320,
same-axis metadata, transparent hover, real touch targets, open/closed chevron,
panel fit, click/Space/Escape/focus return and expired inspection. The ten existing
hierarchy cases also pass. App/E2E typecheck and focused lint/format pass.

The regression failed before the fix on a **32px vertical center mismatch**.
Owner inspected [desktop](final/header-light-1400.png),
[middle width](final/header-light-900.png), [phone](final/header-light-390.png),
[320px open panel](final/header-light-320-open.png),
[dark open panel](final/header-dark-1400-open.png) and
[dark narrow header](final/header-dark-320.png).
This scoped pass supersedes header geometry in the baseline below; it does not
claim a fresh full lifecycle/unit run. The browser suite used its own 3022 preview.

## Earlier hierarchy baseline

The frozen current/history browser run passed **37/37**, with no failures,
retries, flaky cases or skips. It began September 13 at **13:39:52 UTC**.
[The report](final/browser-report.json) originally attached 96 ordinary-viewport
PNGs in `final/`; hierarchy captures were refreshed by subsequent follow-ups.
Thirty current-source attachments shared the public digest below;
the other seven retained composition/history cases ran in the same frozen suite.

Public source digest:
`211cf47c466aaba6d7b1e69213b30f6e6dfaffe63803702157fdcd5732eafec8`
(2,411 public source/config/test files; private environment hashes never emitted).
A post-run source read matched it at that baseline. All **81** production auction
files matched Claude's source fingerprints; the follow-up touches lab files only.

Node 24.19.0 and bundled pnpm 11.19.0 were used; this is not a matching-pnpm/CI
claim (project pin: 11.5.2). No dependencies were installed. Per-command
`pnpm_config_verify_deps_before_run=false` bypassed the bundled runner's attempted
dependency reconciliation. The first attempt aborted before removing dependencies.
Tests created and stopped their own single-worker preview at `127.0.0.1:3022`.
The user's existing 3005 preview was not restarted or navigated; 3043 was untouched.
HEAD remains `404bcbc414cf54eed988a9e6c95b74fa0c6e7251`; unrelated dirty work and
audit packages are preserved. Nothing committed or pushed.

## Baseline checks

- `pnpm typecheck`: app and E2E TypeScript pass after the final source changes.
- `pnpm exec vitest run src/views/internal/design-system/auctions-browse/tests src/views/internal/design-system/tests/component-catalog.test.ts`: **91/91**, nine files.
- Scoped `pnpm exec oxlint` and `pnpm exec prettier --check`: current workspace,
  rich-record integration and current browser specs pass without lint findings.
- Browser command: `pnpm exec playwright test --config=playwright.design-system.config.ts --project=design-system-review --reporter=line,json 'current-rebalance-.*lab-regressions.spec.ts' auctions-history-lab-regressions.spec.ts`.
  The JSON output is the report above. One worker and zero configured retries.
- Ten hierarchy checks cover ownership, card surface, 1400/900/390/320 geometry,
  real 32px logos, readable failed-row identity, resize focus, general reference
  scope, natural outcome spacing and single recovery after expiry during indexing.
- Existing lifecycle coverage remains: receipt/indexer waits, no re-arming,
  rejected/reverted recovery, role/network/phase gates, hybrid draft/CSV/limits,
  bid details, repeat rounds, expiry, missing data, two records and history handoff.
- `scope.mjs --base 404bcbc414cf54eed988a9e6c95b74fa0c6e7251 --dry-run`:
  correctness/product lenses, medium size hint, no red flags. The accumulated
  dirty tree includes hundreds of retained evidence files with unmapped checks.
  The V1 bounded-checkpoint override applies; this is **not** a whole-repository gate.
- Wiki/relative-link/diff checks pass. No full repository suite, CI or production
  E2E claim is made. Existing test-environment deprecation/optional remote-config
  warnings and unrelated Tailwind duration warnings remain.

## Baseline visual judgment and corrections

Owner reviewed preparation, repeated auction, live monitoring, hybrid/editor,
warning/recovery, completion and history context, in light/dark desktop and phone.
Direct browser review additionally checked 900px and 320px in both themes,
the general-information popover at 320px, and native table/row/cell accessibility
structure before/after reflow. Browser tests retain focused disclosure through resize.
Temporary review tab and viewport override were cleaned up; light theme restored.

Start with [repeated auction](final/hierarchy-1400-repeat.png),
[900px layout](final/hierarchy-900-repeat.png),
[phone](final/hierarchy-390-repeat.png),
[live monitoring](final/light-1400-live-top.png),
[320px warning row](final/hierarchy-320-liquidity.png),
[completion](final/hierarchy-complete.png), or
[320px weight editor](final/weights-320-top.png).

RED proof preceded the ownership change (missing shared Auction N section).
Further rendered REDs exposed 20px logos despite utility sizing, a 46px clipped
ticker at 320px, a duplicate outcome count, a 24px apparent label/value gap, and
two recovery regions after expiry during indexing. Public logo sizes, narrow
recovery stacking, natural metric spacing and single ownership fix those cases.
The expired pending operation also retains its Auction N identity.
General inspection no longer carries invented debug volatility.

[Independent review reconciliation](reconciliation.md) records the final
Intent/Risk pair and focused correction reviews. Both axes have no remaining
verified blocker. This is review readiness, not human design acceptance.

## Adoption boundary

**Engineer review required before adoption:** live-auction truth, both real write
paths, reverts/indexer lag, permission/network handling, weight units/persistence,
cap policy, filler/router blocking and v4/v2 coverage. The lab sends no signatures
or transactions and introduces no SDK/financial adapter. New explanations marked
`Lab` are not approved product copy. Curves, bid values and liquidity estimates
remain illustrative; NVDAon pressure is not an actual CMC20 holding. File import
is represented; production drag/drop is not. No workflow-kit change was needed:
the existing component-owner and mounted-geometry rules covered the failures.
