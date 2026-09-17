# Standalone documentation-entry bounded handoff

Authorized 2026-09-17. This packet owns only the provider-free documentation
entry and its verification. It is **Engineer review required** because it adds a
build/routing boundary. It does not migrate or redesign documentation content.

## Outcome and authority

- User-visible result and explicit approval: the user asked to digest Claude's
  audit and begin the recommended next work. The next slice is the standalone
  documentation entry approved by U16 in the
  [durable plan](design-system-documentation-experience.md#superseding-presentation-direction--2026-09-17).
- Approved human decisions, with exact sources: preserve the S2a-1 shell and
  current `/internal/design-system/*` paths; separate it from product startup;
  keep the in-app route as a compatibility surface; do not start Color or any
  other content migration in this slice.
- Coordinator interpretations, labeled as interpretations: use one additional
  Vite/React entry in this repository, not a new framework, package, or authority
  store. Mount only the documentation router, localization, theme/Jotai defaults,
  tooltip support, and existing shell. A compatibility specimen that cannot run
  without product providers remains isolated or reports a blocker; it may not
  restore the product provider tree globally.
- Unresolved blocking choices; stop condition and owner: no local architecture
  choice blocks the slice. Stop if preserving a documented deep link requires
  wallet/chain/updater startup or copied authority. Hosted URL, Access, Records
  exposure, and redirects remain U11/U12 human decisions.
- Preserve/change boundary and explicit non-goals: do not change catalogs,
  decisions, Current Review, component/foundation/pattern content, shared
  component defaults, product providers, product routes, analytics policy,
  security headers, Cloudflare configuration, Toast/Progress, or production
  adoption. Do not publish, commit, push, delete, or begin Color.

## Ownership and scoped identity

- Exact owned paths; excluded surfaces and shared defaults:
  - Own new documentation HTML/React entry files and the smallest dedicated
    Vite configuration/build scripts required to serve and build them.
  - Own focused standalone-entry source/runtime tests and a bounded Playwright
    server configuration or equivalent harness.
  - Own only minimal compatibility edits to existing documentation routing or
    shell files if the standalone root proves they are necessary.
  - Own the receipt/evidence under
    `docs/plans/design-system-standalone-entry/` and the active plan/progress
    claims made stale by this slice.
  - Exclude app provider files, `src/app.tsx`, product `Layout`, all catalogs,
    all state sheets/family internals, locales except strictly required new
    entry-owned text, `_headers`, `public/_redirects`, and unrelated dirty work.
- Starting commit/ref plus authorized dirty input for owned paths and relevant
  evidence only: base `02434707c0614d2262b10560eebb05cde4319931`; the verified
  S2a-1 shell files and the 2026-09-17 plan revision are authorized dirty input.
  Inspect live diffs before touching an existing dirty file.
- Returned snapshot/digest for changed owned paths and retained evidence only:
  return every changed path, starting/ending blob IDs for pre-existing owned
  files, hashes for new files and retained evidence, plus exact verifier output.
- Execution location and isolation boundary; owned preview port if applicable:
  shared checkout `/Users/lill-kire/Code/register`; use an available isolated
  loopback port in the 3055–3065 range. Never touch port 3042.
- Actual task ID when ready and durable result path: implementation task
  `/root/standalone_docs_entry`; receipt target
  `docs/plans/design-system-standalone-entry/README.md`.
- Previews, servers and concurrent work that must not be touched: user preview
  3042, other servers, stashes, safety refs, detached Toast/Progress materials,
  and unrelated dirty paths.

## Read and preserve

- Read root and lab routers plus workflow/stage/testing/code/UI/stack guidance,
  `docs/wiki/project.md`, `docs/wiki/improvements.md`, the V1 plan, durable docs
  plan, S1 provider baseline, S2a-1 receipt, and this packet before editing.
- Target catalog entry and canonical implementation/accepted decision: none;
  this is a runtime presentation boundary. `component-catalog*`,
  `foundation-catalog.ts`, `CURRENT_REVIEW`, and accepted decisions remain the
  unchanged authorities consumed through the existing shell.
- Product/data sources, each labeled what it proves and does not prove:
  - `src/index.tsx`, `src/app.tsx`, `src/state/chain/**`, and the S1/S2a-1
    provider receipts prove what the current route initializes; they are
    evidence and excluded edit surfaces.
  - `src/views/internal/design-system/index.tsx` and S2a-1 shell modules prove
    the documentation UI/router to reuse; they do not authorize content changes.
  - `vite.config.ts`, `index.html`, and existing chart-preview inputs prove
    repository build patterns; do not copy product telemetry/meta into docs.
- Existing strong qualities, copy, state/data meaning and behavior to preserve:
  current shell hierarchy, search, localization, theme, empty Current Review,
  aliases, direct routes/hashes/query state, focus behavior, narrow navigation,
  and all agent-facing authority paths.

## Visual precedent

- Primary rendered precedent: the current verified S2a-1 documentation shell at
  `/internal/design-system/*`.
- Why this precedent applies to the task: the slice changes only the runtime
  entry beneath it; the first standalone render should be visually identical.
- Qualities and relationships to preserve: neutral shell, compact sidebar,
  grouped search, flat dividers, semantic tokens, light/dark behavior, mobile
  Drawer, scroll owner, and exact content hierarchy.
- Qualities, states or context that must not be copied: product Header/chat,
  wallet state, product routing chrome, provider errors, analytics/referral
  startup, or a new visual treatment.
- Decisions with no applicable precedent that remain open: build artifact name,
  local dev command, and internal entry module names are implementation choices;
  hosted hostname and public URL remain human-gated.

## Acceptance and proof

- Highest stable behavior seam and independent oracle: a production standalone
  artifact served on loopback, exercised through direct deep-link Playwright
  loads, plus request/provider instrumentation and emitted-artifact inspection.
- RED proof for each changed behavior, or exact limitation if RED is unavailable:
  first add a focused direct-load/runtime assertion against the standalone
  command and show it fails because the entry does not exist. Runtime
  no-wallet/no-external-startup assertions must fail against the current App-root
  route before passing against the standalone entry. Preserve decisive output.
- Representative state, affected breakpoint and interaction: Start,
  Foundations, Components, Button detail, Workbench, Records, and one Legacy
  alias at 390 and 1400px; search, theme, Drawer, route scroll reset, direct
  reload, and denied-network startup.
- Final post-edit affected-surface run: entry unit/source guard, standalone
  production build, emitted-artifact inspection, application and E2E TypeScript,
  scoped lint/format, focused standalone Playwright matrix, existing S2a-1 shell
  and one product-route compatibility case, exact denied-network/provider trace,
  `scope.mjs` affected checks, wiki lint, and diff check.
- Durable evidence pointer and retention owner:
  `docs/plans/design-system-standalone-entry/README.md` plus first/final captures
  and request/artifact summaries; coordinator owns retention.

| Criterion                         | Test seam                                       | Rendered state                              | Command or artifact            | Proof owner          |
| --------------------------------- | ----------------------------------------------- | ------------------------------------------- | ------------------------------ | -------------------- |
| Docs boot without product runtime | instrumented standalone production load         | Start and Components, fresh contexts        | request/provider trace         | implementation owner |
| No wallet/product startup code    | emitted-artifact and import-boundary inspection | n/a                                         | build manifest/chunk scan      | implementation owner |
| Shell behavior is preserved       | focused Playwright reuse                        | 390/1400, light/dark                        | browser report + captures      | implementation owner |
| Deep links and aliases reload     | direct-load matrix                              | Button, Workbench, Records, Legacy alias    | focused Playwright             | implementation owner |
| Product route remains unchanged   | existing app server compatibility case          | product home plus current in-app docs route | focused browser test           | implementation owner |
| Authority sources are unchanged   | catalog/context tests and scoped diff           | n/a                                         | test output + no-diff evidence | coordinator          |

Acceptance requires both a clean runtime boundary and preserved rendered
behavior. A smaller transfer count alone does not prove provider isolation.

## Pilot evaluation

This is an architecture-integration pilot. Keep the implementation owner's model
and reasoning effort fixed. Preserve the first standalone render and every
substantive repair separately.

- Fixed model and reasoning effort: inherited parent settings for
  `/root/standalone_docs_entry`; do not change them during repairs.
- First-render artifact and source identity: retain the first successful
  standalone Start/Components captures with the owned-path digest.
- Repair log and final-render artifact: classify each repair and retain final
  captures plus runtime trace.
- Correct authority retrieved: score against the unchanged catalogs/router and
  this handoff.
- Correct precedent chosen and applied: score against S2a-1 visual identity.
- Approved human decisions preserved: score against U14–U17 and all non-goals.
- Substantive repair count: record exactly.
- Failure causes per repair: missing instruction, bad composition,
  implementation error, or subjective refinement.
- Focused verification caught problems before human review: score and cite.

## Return to the coordinator

Return changed paths and scoped identity, RED/GREEN proof, exact final checks,
inspected routes/states, artifact and provider/runtime deltas, durable receipt,
repair log, remaining risks, and the Engineer review requirement. Do not commit,
push, publish, migrate content, alter product providers, or expand scope.
