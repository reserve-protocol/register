# Current-rebalance table verification

Candidate: [task contract](../design-system-current-rebalance-table.md).
Review URL: `/internal/design-system/components/table#auctions-current-table-review`.
The old workspace remains at `#auctions-browse-review`. Lab only; no production migration.

## Independent closing review and reconciliation

The [independent report](../design-system-auctions-tables-closeout-review/report.md)
is complete. The [F1–F5 reconciliation](closeout/README.md) owns the authorized
capture-caption, persistent help, touch dismissal, unknown-round and scoped-expiry
follow-up, its exact verification, and the still-separate engineering gates.
Earlier receipts below keep their historical scope rather than certifying this revision.

## Compact status and arrow follow-up

The [latest compact-row receipt](status-arrow/README.md) places auction context
above status, with the arrow centred on its pill at container widths 352px and
above. Below that width the arrow stays beside auction context so status and
help keep the full width. The localized expiry label/value row follows both.
Desktop and history are unchanged. The [earlier footer receipt](mobile-footer/README.md)
records the preceding layout, not the current arrow placement.

## Mobile/constrained cleanup

The [combined cleanup receipt](mobile-cleanup/README.md) covers both near-term
tables after the phone layout fixes: current status/auction stacking, full-width
historical identity/provenance, and removal of the current-table bottom strip.
Its compact current-row footer is superseded by the follow-up above; history
and all other cleanup claims retain that receipt's scope.

## Compact weight-setup restriction

Restricted weight setup retains the existing Confirm target weights pill and
one supporting Only launcher can start line. Its helper contains the exact source
restriction, including the absence of community launch; selected detail retains
the full instruction. Ordinary whole-cell vertical centering is unchanged.
The existing local HelpTooltip tap/focus/navigation guard is shared by both
launcher explanations. All copy and es/ko/zh translations are reused.

RED reproduced the missing weight-restriction helper. The first combined pass
was 12/13; an older availability assertion still required the long inline sentence.
After updating that expectation and allowing only the named help control, the
final [weight-access report](weight-access/browser-report.json) passes 13/13,
without retries or mock-wallet sends. It covers one-line English geometry at
1400/320px, keyboard/tap/portal interactions, detail/Back, existing state/data
precedence, and translated phone help. App/E2E types, scoped lint/format and
diff/wiki checks pass. Owner inspected light desktop and dark phone captures;
the mounted preview status block shrank from 76px to 56px with middle alignment
retained. Low-profile correctness/product self-review; the 2,618-file scope hint
belongs to accumulated work, not this local presentation change. No shared
default, permission, transaction or production change; no lab analytics event.

## Explicit launch-access labels and help

Ready rows now read Only launcher can start / Anyone can start. Launcher-only
ready rows reuse the existing HelpTooltip beside the pill, with the approved
restricted-period explanation and the same private focus key as their example.
The explanation is not another text row. Help clicks, including portal content,
are isolated from row navigation; auction timing, unknown states and permissions
are unchanged. The two labels and explanation were isolated-extracted and
translated in es/ko/zh; unrelated catalog changes were preserved.

RED failed on the missing help control. The first combined run passed 8/11:
both help checks opened successfully but their scrolling screenshot helper
dismissed the tooltip, and an older assertion disallowed every button. The
tests now capture open help without moving the viewport and permit only the
named help button, not execution controls. The next run passed 10/11 and exposed
a real touch defect: Radix's trigger auto-close overrides HelpTooltip's tap
toggle. Local trigger capture handlers suppress that default while leaving
keyboard focus, Escape, outside dismissal and text interaction intact. Shared
HelpTooltip implementation/defaults are unchanged; its general tap behavior
needs separate owner-level review before broader adoption.

Final [launcher-help report](launcher-help/browser-report.json): 11/11 checks,
no retries or mock-wallet sends. Real phone taps persist and toggle closed;
keyboard focus, Escape, responsive focus and portal-content click isolation pass.
The existing all-state, permission/data precedence, navigation and es/ko/zh phone
checks also pass. App/E2E types and scoped lint/format/diff/wiki are green.
Owner inspected open desktop/light and phone/dark help, plus Spanish phone
geometry. Low-profile correctness/product self-review; the broad 2,590-file
scope signal belongs to the accumulated workspace, not this local UI change.

## Separately labeled state examples

The default All preview now has 18 separate one-row tables. Each original
scenario/role/data label appears immediately above its own table as lab chrome;
product identity cells remain unchanged. History is rendered once below the set.
Individual previews retain one table, including the two-record scenario.

RED expected 18 tables and found 1. [Labeled-example report](labeled-examples/browser-report.json):
8/8 focused browser checks, no retries or mock-wallet sends. Checks bind all
18 label/table pairs, one row per example, history once, distinct destinations,
Back/proposer focus, individual previews, compact hit regions, state warnings
and es/ko/zh phone layouts. App/E2E types and scoped lint/format/diff/wiki pass.
Owner inspected desktop start/end and dark-phone normal/unavailable views.
Low-profile correctness/product self-review; no production or shared changes.
Earlier captures below are historical presentations. The broad scope's 2,560-file
size signal belongs to the accumulated dirty tree, not this bounded lab follow-up.
Port 3005 was no longer listening at closeout; its normal local Vite preview was
restarted on that same port and returned HTTP 200. The browser suite used its
isolated 3022 server throughout. No dependency installation or commit.

## Compact circles and launch-access labels

The preceding refinement established the compact 32px secondary circle inside a 44px
reserved hit region. Its expanded link surface is checked at all four edges and
by navigating from outside the visible circle. Ready · Launcher only / Ready ·
Anyone describe access independently of wallet connectivity/network; the redundant
ready restriction sentence stays in detail. Weight/data exceptions and the active
indicator remain unchanged. The two new messages were extracted in isolation and
added with es/ko/zh translations, preserving other catalog changes.

Fresh proof: [compact/access report](compact-access/browser-report.json), 11/11
focused browser checks with no retries or mock-wallet sends; app/E2E types,
scoped lint/format/diff/wiki green. RED retained Ready to start instead of the
approved qualified label. Owner inspected the 18-row desktop, dark phone, and
Spanish phone captures. Low-profile correctness/product self-review; no production
gate, shared default or transaction behavior changed.

## Earlier status and navigation refinement

The preceding candidate used a 44px secondary circular arrow link, with the existing
Details accessible name. Most browse statuses are one pill; launch restrictions
and data/indexing explanations remain visible. Bid counts move to the auction
timing group. Action, wallet and network prompts stay in selected detail context.
Earlier text-link and repeated-action captures below remain historical evidence.

Fresh verification after the interrupted session: [final report](status-navigation/browser-report.json),
17/17 browser checks, no retries or mock-wallet sends; app/E2E typecheck and scoped
lint/format/diff/wiki checks pass. The RED check saw the redundant Start auction 1
under Ready to start. The first full run was 16/17: a newly extended test forgot
to reopen lab controls after returning from detail. Correcting that test sequence
required no application change; the complete rerun passed. Owner inspected the
full desktop list, live light/dark phone and desktop, missing-data phone and the
constrained-column focus capture. Profile low; correctness/product self-review.

## All-state follow-up

The preceding visual touch-up removes the scenario annotations from identity cells,
retaining the 18 examples and navigation. [Label-removal report](without-scenario-labels/browser-report.json):
2/2 focused desktop/mobile checks, no retries or mock-wallet sends; app/E2E types,
scoped lint/format and diff checks pass. Owner inspected desktop/light and
320px/dark captures. Earlier labeled captures below remain historical evidence.

The default list now shows all 18 scenario/role/data examples without switching.
[Follow-up report](all-states/browser-report.json): 5/5 browser checks, no retries
or mock-wallet sends; app/E2E types and scoped style/docs checks pass. RED found
one row instead of 18. Tests cover distinct row destinations, exact Back focus,
proposer focus across responsive projections, individual-preview switching,
dark-phone overflow, and retained standalone navigation/controls. Owner inspected
the long desktop list at top/middle/end and the phone unavailable state. Original
reference ownership and production-adoption limits below remain unchanged.

## Initial table implementation evidence

- RED: the first mounted test failed because `current-rebalances-table` did not exist.
- Initial browser run: 11/11 passed, retained in [initial report](browser-report-initial.json). These initial attachments are historical, not the corrected reference view.
- Final browser run: **14/14 passed**, no retries, source frozen per test, zero mock-wallet transaction sends. [Final report](browser-report.json) contains source manifests and attachment pointers. Top-level PNGs with matching names are the final captures.
- `pnpm typecheck` passed for app and E2E.
- Focused Vitest: history, retained workspace and component catalog, **44/44 passed**.
- Scoped oxlint, Prettier check, `git diff --check` and wiki lint passed.
- `scope.mjs --base 289b2af86 --dry-run` inspected the accumulated dirty tree; correctness/product lenses. Its 2,353-file historical/evidence scope was not treated as this bounded lab slice. V1 bounded verification cadence applies, not an unrelated full repository gate.

Reproduce with `pnpm design-system:review current-rebalance-table-lab-regressions.spec.ts`, using `CURRENT_REBALANCE_CAPTURE_DIR=docs/plans/design-system-current-rebalance-table-evidence`. The runner owns isolated port 3022. User preview 3005 (PID 3149, this checkout) was left running. Node 24.19; no dependency installation or lockfile change.

## What is covered

Ready/repeat, live/bids and hybrid layouts at 1400, 900, 390 and 320px in both themes. Separate assertions cover member/visitor/network restrictions, permissionless launch, no community window, prices unavailable while live, zero bids, missing auction data, pending prices, indexing, completed/open window, empty/loading/multiple rows and unmatched IDs.

Navigation proof includes keyboard activation and browser Back, explicit Back, correct selected-row identity, independent proposer activation with external navigation prevented, controls/switches, focus transfer across the 1024px container breakpoint, a 390px constrained column, 44px Details targets and no table/header row borders. Unknown auction data suppresses both round and end-time claims. Current rows navigate; historical rows remain static.

## Review and inspection

Dark: one Important reference identity/state mismatch, confirmed/fixed. Selected context now sits outside a dated Reference figure with its own identity/status; repeat uses the actual Auction 2 capture. Focused source recheck passed. July, repeat and no-bids assertions now bind reference ownership and image loading. Light: no scoped composition blocker; owner added whole-section-heading captures after reviewer noted initial clipping by sticky lab chrome.

Owner inspected ready/repeat desktop and 900px, restricted-member desktop, live dark desktop, hybrid light phone/dark 320px, and corrected desktop/phone references. Canonical tokens/type/pills and table primitives remain unchanged. The experience-design guidance influenced the separation of lifecycle, viewer eligibility and independent clocks; no transaction-stepper pattern was transplanted into a browse row.

## Limits and handoff

The deeper page contains **read-only, dated production audit screenshots**, not a functioning retained production flow. Reference data can differ from the selected simulated row and is labeled independently. Desktop-only references scale down on phones; this is not a claim of mobile production-detail parity. Generic lab reference labels are reused; optional new explanatory copy is still awaiting approval.

Engineer review required before production adoption: authoritative current/live membership, role/network semantics, version coverage, route continuity, indexing/double-send and receipt handling. No real-wallet, RPC, financial calculation or transaction safety claim is made here. No source change was made to production auctions or shared DataTable/Link/LifecycleStatus defaults. Human visual review remains open.
