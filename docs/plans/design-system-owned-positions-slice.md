# Owned Portfolio positions: vote-lock and stake

Status: human-review-required; implementation verified 2026-09-12. Fixed point
`404bcbc414cf54eed988a9e6c95b74fa0c6e7251`; preserve the inspected dirty Auctions
and Portfolio-audit inputs. Medium, one bounded lab stage. No commit authorized.

## Scope and usage

Add the two missing current-position compositions identified by the
[coverage review](design-system-portfolio-coverage-review.md), not all seven
unrepresented Portfolio sections. Current Review stays on Auctions while the
user reviews it. No Auctions/Governance changes, user-tab navigation, preview
restart, production adoption, shared defaults, wallet reads or transaction writes.

Journeys:

1. Scan current holdings in a vault: identify vault, chain, underlying and governed
   DTFs; compare owned balance, USD value and APY; use Modify without ambiguity.
2. At phone/constrained width, retain owned balance/value and the actionable
   identity without inheriting Earn's global TVL or its sparse-wallet footer.
3. Inspect partial/unavailable data, a non-RSR underlying, many/duplicate governed
   names, long amounts, and a zero active position with a pending withdrawal.
   Nothing fabricates an active-lock countdown or a confirmed transaction.

Agent affordance: fixture type/state/width controls only. Modify for vote-locks
opens a non-executing context boundary; staking remains native navigation to the
existing staking route. Source-capture tests use isolated offline mocks and must
assert zero transaction sends. Lab-only fixture controls need no Mixpanel event.

## Source-transfer contract

The audit owns source paths and exclusions. Reopen the actual implementations
and obtain fresh strict source rendering before composing. The existing E2E
boundary system covers launch/drive/cleanup; no new verification skill or mock
platform is needed. A separate Vite cache protects the user's 3005 preview.

| Job | Disposition | Proof |
| --- | --- | --- |
| Current stake / legacy vault | Preserve identity, units, fields and destinations; standardize existing cell owners | Source rendering and native-link checks |
| Appreciating vault | Preserve underlying amount + exchange-rate supporting line; show independent missing/loading fixtures without pretending they are production adapters | Hold/release/empty-result decode failure/zero source read, screenshot and literal assertions |
| Governed DTFs | Preserve all independent links, including first/only DTF; many/empty/duplicate symbols; inline `+N` opens the full linked list without expanding the row | Hover, click/tap, keyboard, dismissal/focus, exact hrefs |
| Modify | Stake new-tab navigation vs vote-lock local boundary; source vault/chain/first-DTF context remains explicit | No nested activation; Escape and focus return |
| Sorting | Stake keeps APY/Balance/Value controls; vote-lock keeps initial Value order without inventing new sort controls | Numeric keys, missing-last, sort-before-five-row-limit, expansion |
| Responsive | One table state, CSS projections with keyed focus transfer; no mobile hidden critical facts | 320/390/1400 and both sides of actual container threshold |
| Loading/absence | Whole-section placeholder vs independently loading values vs omitted empty section | State recovery and preserved type/sort |

## One candidate and rejected alternative

Use local owned-position fixtures and columns over existing DataTable and neutral
cells. Reject reusing EarnTable wholesale: it foregrounds opportunity rate/TVL,
its small Governs lists omit independent links, and its drawer default is wrong
for Portfolio stakes. Do not create a universal Row or shared data adapter.

The new row's memorable quality is a clear owned-value pair with a restrained
management action, not another opportunity card. Desktop groups descriptive
columns left and numerical columns right. Narrow rows put identity and Modify
on top, Balance and Value together below, then related facts. APY remains a rate,
not performance-colored. Exchange-rate detail belongs to Balance.

## Reuse and geometry

| Relationship | Owner and starting recipe | Boundary |
| --- | --- | --- |
| Identity | EntityIdentity, ChainBadgedLogo xl, compact wrapping name leading, 12px mark gap | Existing opt-ins/defaults unchanged |
| Numbers / metadata | MetricValue body 16/300, supporting 14/300, names 16/500 | No invented earned metric or dense type |
| Actions / disclosure | V1 Button compact, native Link, InlineAction | Retain existing table compact-action exception; no logo button invention |
| Table state / focus | DataTable, FamilyTable, useProjectionFocus where appropriate | One sorting/expansion owner, no RPC in cells |
| Outer inset | Header and row tracks each own their own 24px edge inset | No double-padded outer card |
| Row rhythm | Desktop 16px vertical; constrained 24px, inner groups 16px, label/value 4px | Single neutral seam inset left, flush right; section bottom 24px |
| Width | Full + 390px review control; content-driven desktop threshold initially 1024px | Inspect actual column widths and long names before multiplying fixtures |

State changes preserve family, sort and table expansion unless content removal
makes that meaningless. Loading disables Modify and preserves applicable
exchange-rate height. Loading/removing a row closes its governed-list popover;
changing responsive projection closes it and returns keyboard focus to the
visible keyed trigger, never a hidden duplicate.

## Evidence and gates

Visible pressure cases (not held out): non-RSR position; appreciating vault;
tiny nonzero holdings with zero-rounded USD; many governed DTFs; long names and
amounts; zero active amount with pending claim. Rubric: source fidelity, clear
owned-value hierarchy, no overflow, independent actions, honest missing values,
continuity and existing component ownership. Self-check plus one project-required
Dark/Light review pair at the end; no speculative candidate fan-out.

RED first at the mounted lab integration seam for missing owned rows; then units
for branch/value states and interaction, browser light/dark 320/390/1400 and
threshold/focus/links, scoped lint, app/E2E types, catalog routing, wiki/links/diff.
Use the V1 bounded/checkpoint cadence, not an unrelated full repository gate.
Retain source/candidate evidence separately. Source overlays prove rendering,
not real wallet balances or producer denomination guarantees.

Engineer review remains required before adopting API fallback vs live valuation,
filter/sort truth, stake amount units, shared-vault drawer context and account
authority. Product rate wording is retained; no speculative copy correction.
Human visual acceptance is separate from all internal tests/review.

The source stake row's whole-row new-tab navigation is deliberately not copied:
the explicit Modify link is the single management affordance, leaving governed
DTFs independently reachable. Source Learn more links remain. Stake desktop
sorting starts a newly selected field ascending; the constrained field selector
preserves the current direction. Initial Value order is descending in both.

Review topology: one implementation owner; the project-required Dark/Light pair
receives read-only scoped files, this contract, and the first browser/unit evidence.
No review worker may edit files or start browsers. The coordinator reconciles once
and owns final verification; an unavailable reviewer is reported as pending.

## Closeout

Both current-position families are available at
`/internal/design-system/components/table#owned-positions-review`, after the
existing rich-record review. Position type, preview conditions and a 390px
constrained control expose default, whole/partial loading, zero/unavailable,
long content and empty states. The appreciating vault includes its exchange rate;
many and duplicate governed identities retain separate native destinations.

Fresh bounded verification: 74/74 units in four files; 18/18 browser cases with
one worker, zero skipped/failing/flaky; app and E2E types; scoped lint/format.
The [evidence receipt](design-system-owned-positions-evidence/index.md) retains
35 captures and exact commands, source digest and review reconciliation.
Dark/Light findings are resolved: actual table containment, disclosure/focus
recovery after removal, and chain/first-DTF boundary context. The source-error
proof uses the existing exact mock seam, not a spec-local interceptor.

Human review is the next step: owned-value hierarchy, Governs density and the
constrained action placement. This is not production adoption or a new accepted
global pattern. Engineer review required before connecting real valuation/units,
API eligibility/live sort keys, account permissions, shared-vault first-DTF
context or transaction execution. Rewards, RSR, voting power and activity remain
separate Portfolio slices. Auctions, Governance and Current Review are unchanged.

## September 13 — inline governed-DTF count

The user authorized `POWER, ROBOTS +3` with a full-list popover instead of
`+3 more` on a separate line and inline expansion. The count stays attached to
the last visible DTF if constrained text wraps. All DTFs remain independent
native links, including duplicate symbols; the panel adds their existing names.
No balance units, exchange rates, explanatory help, Earn or production behavior
changed. The existing Popover/InlineAction/Link owners remain unchanged.

Mouse hover opens after 150ms and closes after 200ms away, matching the adjacent
Earn disclosure timing. Click/tap or keyboard activation pins the panel and
focuses its first link. Escape returns focus; outside interaction dismisses;
loading/removal closes the panel; changing projection closes it and transfers
keyboard focus. Table-level row expansion and sorting remain independent.

Low-radius local refinement; self-reviewed for intent, correctness, product and
complexity. The repository scope tool's medium hint covers 332 accumulated files,
not this bounded change; no shared default, live contract or new dependency is
involved. No Mixpanel event for a fixture-only lab interaction.

Fresh verification: 11/11 owned-position unit tests and 15/15 owned browser
cases, zero skipped/flaky; app/E2E typecheck, scoped lint/format, wiki-lint and
diff checks passed. RED was the missing named full-list trigger (two
expected failures); browser pressure then caught an orphaned count and missing
first-link keyboard focus, both corrected before the final full rerun.
The browser suite used one worker against the existing 3005 preview without
restarting it or touching Claude's 3047 server. The sandbox initially blocked
Chromium startup; the approved unsandboxed run passed. The final JSON receipt is
in the local temporary artifact `register-owned-governs-final-report.json`.
Rendered desktop light and phone dark popovers were inspected at ordinary
viewport height; all four desktop/phone light/dark captures are in that receipt.
Unit imports still emit existing wallet-library initialization logs; no real
wallet action or transaction was attempted. No full repository gate or CI claim.
