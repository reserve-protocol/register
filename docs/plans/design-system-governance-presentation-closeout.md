# Governance presentation closeout

Status: done — included in the user's September 14 approval of current table work
for now. Production adoption remains separate. Fixed point `289b2af86` plus inherited dirty lab work.

## Contract

The user authorized the recommendations from the September 14 discussion:
one leading lifecycle/action pill, quieter Passed outcome, prominent unboxed
voting/challenge deadlines, a Waiting period pill and explicit execution-availability
countdown with the approved timelock explanation. Retain active timeline mechanics
but group the strip with its status and provide accessible stage context. Finished
proposals omit the strip, matching production. Add expired, loading, empty and
queued-ready review examples. No spinner, urgency thresholds or live timers.

This is a medium, lab-local presentation stage: helpers add an independent touch/
keyboard interaction beside native row navigation, and localized state language
must remain truthful. Shared defaults, production screens, SDK/RPC/subgraph,
deadlines, vote math, proposal identity and execution eligibility are non-goals.
The new ready example is explicitly supplied fixture state, not a derivation or
permission claim. Existing reference-only governance navigation stays reference-only.

Usage: identify Voting active and its closing deadline immediately; distinguish
the required waiting period from Ready to execute; inspect help without navigating;
scan final outcomes without a progress strip. Reject three equally prominent pills,
hover-only essential facts, nested button-inside-link markup and automatic execution
at timer zero. One local composition candidate; no new shared status API.

Proof: initial RED fails on the absent Waiting period label; the expanded regression
checks pin pill hierarchy, foreground deadlines, closed strips and missing examples.
Browser checks cover 320/390/constrained/desktop, both themes, independent
helper touch/keyboard/dismissal, unchanged native navigation and numeric evidence,
loading geometry and localized pressure. Inspect active/queued real renders before
retaining unboxed timing. Focused type/style/unit/browser checks, then readonly
Light/Intent and Dark/Risk review; parent owns reconciliation and verification.
No competing writes or previews. Unavailable review remains pending.

Analytics: lab controls and informational helpers do not represent product usage;
no product event or production instrumentation is added. Engineer review is required
for eventual source/state/action adapters, not postponed authority to change them now.

## Implementation and review disposition

The lab now has eight current/actionable and five historical/closed examples.
One pill carries lifecycle or next-action state; Passed is secondary text.
Voting/challenge closing times use a static clock, foreground label and medium,
tabular value outside the pill. Availability/waiting metadata stays secondary.
Waiting period has the approved timelock explanation, explicitly denying automatic
execution. Shared timeline mechanics and the supplied vote/challenge evidence are
unchanged; only active rows mount the strip. Help explains timing versus support
and the standard/optimistic phases. Closed rows omit the strip.

The title remains a native reference link, stretched across the record; help is
an independent sibling control, not a button nested in a link. Touch help persists
and toggles closed. A first outside touch dismisses without navigation, while a
subsequent touch follows the row. The local preview selector exposes Default,
Loading and Empty without deriving production states. New presentation messages
are populated in en/es/ko/zh; original untranslated fixture text is not represented
as a full localization audit.

Light/Intent and Dark/Risk readonly reviews found no implementation blocker.
Both requested stronger loading-geometry proof; confirmed/fixed with container
width and content-inset assertions plus actual render inspection. Dark requested
next-touch navigation and helper-toggle proof; confirmed/fixed in the browser test.
No material app changes followed review, only existing-message localization and
lab-note housekeeping. No new shared component, token, default or product event.

The first loading test sampled before mounting; it now waits for all 13 records.
The keyboard test also revealed the existing Radix scroll-dismiss behavior: a
focus-induced parent scroll closes help. Event tracing confirmed focus followed
by parent scroll, not accidental navigation. Visible-row keyboard proof now
settles the row first. Shared help remains unchanged; this does not establish
persistence through viewport auto-scroll. Temporary debug instrumentation was
removed. No workflow-kit change is justified by these local test issues.

## Verification

- Final governance suite: **16/16**, no skips/retries. Status hierarchy, persistent
  touch/toggle/dismiss/next-tap, visible-row keyboard, loading width/inset/recovery,
  empty, translated pressure and all 13 examples across both themes.
- Surrounding layout/control/native-link/content-hover suite: **16/16** on the
  final app source. The combined run also exposed two test problems described
  above; its complete run is not represented as green. Both are green in the final
  governance suite.
- Retained rich-record integration: **2/2**, desktop and emulated mobile. An old
  `first svg` assertion selected the status icon after regrouping; it now selects
  the actual timeline, retaining the 4px assertion.
- Focused units: **38/38** (33 catalog, 4 source hygiene, 1 help tooltip).
  Application/E2E types, scoped oxlint/format, wiki lint and diff whitespace pass.
- Parent inspected current light/dark active/waiting/ready/expired renders, 320px
  deadline hierarchy, Spanish pressure and narrow loading continuity. The open
  3005 preview shows all 13 examples and its waiting-period helper was inspected.
  The owned 3047 server stopped; 3005 was not restarted.

Reproduction commands (the isolated runner uses `DESIGN_SYSTEM_PORT=3047` and the
configured Node/pnpm runtime):

```sh
pnpm design-system:review governance-status-lab-regressions.spec.ts overnight-lab-regressions.spec.ts --grep 'governance|Governance'
pnpm design-system:review governance-record-layout-lab-regressions.spec.ts table-row-links-lab-regressions.spec.ts content-hover-lab-regressions.spec.ts
pnpm exec playwright test --config=playwright.design-system.config.ts --project=design-system-desktop --project=design-system-mobile e2e/design-system/lab.spec.ts --grep 'renders the source-grounded rich record review'
pnpm exec vitest run src/views/internal/design-system/tests/component-catalog.test.ts src/components/design-system-v1/tests/source-hygiene.test.ts src/views/internal/design-system/tests/help-tooltip-review.test.tsx
pnpm typecheck
node scripts/llm-workflow/scope.mjs --base 289b2af86 --dry-run --json
node scripts/llm-workflow/wiki-lint.mjs
```

Source-guarded focused runs reported no drift. The scope map covers 3,518 inherited
changed paths, names correctness/product/complexity and reports no red flags. This
is the V1 bounded-lab cadence, not a full repository gate. An unintended non-dry
scope invocation attempted repository lint but failed in pnpm dependency checking;
package/lock files were unchanged, and scoped oxlint subsequently passed. No full
CI, physical-device, screen-reader, native-language or transaction-flow sign-off.
Earlier layout receipts remain historical, not current 13-example proof.

## Handoff and remaining gates

The current record presentation is included in the user's table approval for now:
active deadline prominence, Waiting period versus Ready to execute, and reduced
closed-row height. The constrained switch and Default/Loading/Empty selector remain
available. This is not approval of proposal details, voting or execution flows.

**Engineer review required before production adoption:** the existing row links
are overview references, not individual proposal destinations. Preserve actual
proposal/governor identity; source-derived lifecycle, tally and deadlines; standard
versus optimistic/contested evidence; and vote/queue/execute permissions. Real
deadline crossings, data failure/recovery, loading/empty/expired sourcing and Show
all/Show less remain unimplemented integration work. The queued-ready example is
supplied separately and must never become a timer-based authorization rule. No
production, financial, SDK/RPC/subgraph or transaction changes were made here.

The [central engineering register](design-system-v1.md#deferred-engineering-review-register),
lab area guide, coverage map and overnight/follow-up handoffs point to this current
disposition. No checkpoint, commit, install or user-preview restart is part of it.
