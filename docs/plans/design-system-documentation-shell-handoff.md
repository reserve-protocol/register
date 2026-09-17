# S2a-1 bounded design-system implementation handoff

Authorized 2026-09-16. This packet owns only the first documentation-shell
slice. It is **Engineer review required** because it changes route-aware global
layout and navigation behavior.

## Outcome and authority

- User-visible result and explicit approval: implement the recommended S2a-1
  plan after the user's 2026-09-16 approval: a neutral design-system shell with
  no product header or chat, dense persistent desktop navigation, a narrow-screen
  navigation panel, search, simplified sourced status, stable aliases, and a
  specimen-free Components overview.
- Approved human decisions, with exact sources: U1–U4, U10, and U13 in
  [the durable plan](design-system-documentation-experience.md#decisions-and-remaining-gates),
  plus its [authorization note](design-system-documentation-experience.md#s2a-1-authorization--2026-09-16).
  Use Start, Foundations, Components, Patterns, Workbench, and Internal Records;
  retain clearly labeled temporary Legacy lab aliases; derive one design status
  plus Code and Production facts; keep Paused/Deferred presentation-only; use
  pattern aliases rather than a new typed kind; retain App-root providers for
  this slice; and use the minimal typed presentation index.
- Coordinator interpretations, labeled as interpretations: the smallest safe
  shell bypass is route-aware behavior in the existing `Layout`, while retaining
  `#app-container` as the scroll owner. The Components overview should expose
  catalog identity, grouping, concise description, human status, Code and
  Production facts, and direct routes without importing or rendering specimen
  trees.
- Unresolved blocking choices; stop condition and owner: none before local
  implementation. Afterward, if the repeated provider/runtime baseline remains
  materially unchanged, the coordinator stops before S2a-2 and returns the
  provider-split versus standalone-entry choice to the user. U11/U12 remain
  later hosted-preview choices.
- Preserve/change boundary and explicit non-goals: do not migrate or alter
  Typography, Button, Charts, Select, Toast, Progress, any state-sheet or family
  internals, accepted decisions, catalog authority, production adoption, shared
  component defaults, providers, or preview policy. Do not fix Table defaults,
  stale Studies copy, or cleanup candidates in this slice.

## Ownership and scoped identity

- Exact owned paths; excluded surfaces and shared defaults:
  - Own `src/components/layout/index.tsx` only for the design-system route-aware
    header/chat bypass while preserving `#app-container`.
  - Own `src/views/internal/design-system/index.tsx`, `lab-shell.tsx`,
    `lab-navigation.tsx`, `components-pages.tsx`,
    `canonical-components-overview.tsx`, and new shell/search/presentation-index
    modules beside them.
  - Own one concise authority pointer in
    `src/views/internal/design-system/CLAUDE.md` naming the human presentation
    index while preserving catalogs and `CURRENT_REVIEW` as authority.
  - Own focused additions in `src/views/internal/design-system/tests/`,
    `e2e/design-system/lab.spec.ts`, and `e2e/helpers/tests/` only where needed
    for the acceptance table below.
  - Own the S2a-1 receipt/evidence beneath
    `docs/plans/design-system-documentation-shell/` and the one stage row in
    `docs/wiki/progress.md` at return.
  - Exclude all state-sheet/family files, `component-catalog-primary.ts`,
    `component-catalog-support.ts`, foundation catalogs, Chart/Table/Auctions/
    Transaction internals, shared component implementations/defaults, provider
    setup, app routing outside the minimum Layout seam, and unrelated dirty work.
- Starting commit/ref plus authorized dirty input for owned paths and relevant
  evidence only: base `02434707c0614d2262b10560eebb05cde4319931`;
  documentation changes named in the stage summary are authorized inputs. Source
  implementation paths above are clean at dispatch. Do not use repository-wide
  status as a task manifest.
- Returned snapshot/digest for changed owned paths and retained evidence only:
  return exact changed paths, starting and ending blob IDs for owned pre-existing
  files, new-file hashes, test commands/results, and evidence paths.
- Execution location and isolation boundary; owned preview port if applicable:
  shared checkout `/Users/lill-kire/Code/register`; tests and render work must use
  an available strict isolated port, recommended `3051`.
- Actual task ID when ready and durable result path: implementation owner task
  `/root/s2a1_shell`; receipt target
  `docs/plans/design-system-documentation-shell/README.md`.
- Previews, servers and concurrent work that must not be touched: the user's
  preview on port `3042`, all other servers, the nine existing stashes, safety
  refs, unrelated dirty paths, and detached Toast/Progress materials.

## Read and preserve

- Start at `CLAUDE.md`, then `docs/wiki/domains/design-system.md`; also follow
  `skills/workflow.md`, `skills/stage.md`, `skills/ui-ux.md`, `skills/taste.md`,
  `skills/testing.md`, `skills/code-standards.md`, `docs/wiki/project.md`,
  `docs/wiki/improvements.md`, `docs/plans/design-system-v1.md`, this plan, and
  `src/views/internal/design-system/CLAUDE.md`.
- Target catalog entry and its canonical implementation/accepted decision:
  this is a presentation shell, not a new catalog authority. Component identities
  and authority come from `component-catalog.ts` and `catalog-types.ts`; current
  review comes only from `current-review.ts`.
- Product/data sources, each labeled what it proves and does not prove:
  - `component-catalog.ts` and its typed entries prove identity, grouping,
    authority, implementation, adoption, and review fields; they do not provide
    human activity or copied normative documentation.
  - `current-review.ts` proves whether human judgment is waiting; review
    readiness fields do not.
  - the minimal presentation index may point to source key, route, question,
    owner, and activity only; it does not own normative prose or engineering
    history.
  - the S1 migration ledger and provider baseline prove compatibility and the
    before-shell runtime facts; they do not authorize content migration or an
    acceptable provider budget.
- Existing strong qualities, copy, state/data meaning and behavior to preserve:
  accepted specimen content and its typography/tokens, existing deep links and
  hashes, direct detail routes, theme support, focus visibility, `#app-container`
  scroll-reset behavior, explicit empty Current Review, and all agent-facing
  authority/routing.

## Visual precedent

- Primary rendered precedent: the current design-system lab's content typography,
  accepted specimens, semantic tokens, flat divided inventories, and result-first
  sections at `/internal/design-system/*`.
- Why this precedent applies to the task: it is the current accepted visual
  context whose content will sit inside the new chrome and whose token/typography
  relationships must remain stable.
- Qualities and relationships to preserve: neutral background, restrained type
  hierarchy, compact labels, visible focus, flat structural dividers, light/dark
  parity, direct result-first scanning, and unmistakable separation between
  documentation chrome and content.
- Qualities, states or context that must not be copied: normal product header,
  wallet/product navigation, floating chat, the horizontal lab tabs, card-heavy
  gateway layouts, all-state-sheet mounting on Components, nine-axis status
  chrome, candidate-era callouts, or product-host chrome around specimens.
- Decisions with no applicable precedent that remain open: the repository has no
  complete rendered precedent for the new sidebar, grouped search, or narrow
  navigation panel. Compose these from the approved IA with restrained existing
  tokens; treat deviations found in human review as subjective refinement, not
  authority changes.

## Acceptance and proof

- Highest stable behavior seam and independent oracle: route-level DOM and
  keyboard behavior in Playwright, plus pure projections/import-boundary tests
  over catalog and presentation-index data.
- RED proof for each changed behavior, or exact limitation if RED is unavailable:
  add failing focused assertions before implementation for product chrome
  absence, desktop/narrow navigation, search filtering and keyboard selection,
  sourced status projection, component-overview import/render boundary, aliases,
  direct reload, empty Current Review, and route-change scroll reset. Preserve
  RED output in the receipt. Pixel/aesthetic preference has no independent RED
  oracle; preserve first render for evaluation.
- Representative state, affected breakpoint and interaction: light and dark;
  320, 390, 768, and 1400 px; Components overview, one component detail, Start,
  Workbench, Internal Records, a temporary Legacy alias, search keyboard flow,
  direct reload, and route-to-route scroll reset.
- Final post-edit affected-surface run: focused unit/source guards, application
  and E2E TypeScript, scoped lint/format, focused Playwright behavior at the four
  widths, current route compatibility suite, visual captures inspected in light
  and dark, exact provider/runtime baseline rerun, `scope.mjs --gate` or its
  documented equivalent, wiki lint, and diff check.
- Durable evidence pointer and retention owner: receipt and first/final renders
  beneath `docs/plans/design-system-documentation-shell/`; coordinator retains
  the evidence until S2a-1 human acceptance and later migration parity.

| Criterion                                    | Test seam                                            | Rendered state                                 | Command or artifact            | Proof owner                 |
| -------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------- | ------------------------------ | --------------------------- |
| Product chrome is absent only on docs routes | Layout route test + Playwright DOM                   | Start and Components, 390/1400, light/dark     | Focused test output + captures | implementation owner        |
| Sidebar/search are usable                    | Keyboard and route assertions                        | 320/390 panel; 768/1400 persistent sidebar     | Focused Playwright + captures  | implementation owner        |
| Overview is specimen-free                    | Import/source guard and DOM absence                  | Components at 390/1400                         | Unit guard + capture           | implementation owner        |
| Status is sourced and concise                | Pure projection table                                | Accepted, Exploring, Not started; empty review | Unit output + capture          | implementation owner        |
| Routes and aliases survive reload            | Navigation/direct-load matrix                        | canonical and Legacy alias targets             | Focused Playwright             | implementation owner        |
| Scroll contract is preserved                 | `#app-container` scroll assertion                    | navigate after manual scroll                   | Focused Playwright             | implementation owner        |
| Existing content is unchanged                | Current route compatibility subset                   | component detail and foundation detail         | Existing focused tests         | implementation owner        |
| Provider boundary has no new writes/prompts  | Repeat S1 denied-network and injected-provider trace | cold Start/Components routes                   | provider rerun artifacts       | coordinator + risk reviewer |

- Acceptance requires preserved behavior and the intended visual result; passing
  tests alone is not human approval or production readiness.

## Pilot evaluation

This is an integration pilot for the bounded handoff, not the independent
clean-composition pilot. Keep the implementation owner's model and reasoning
effort fixed for all repairs. Preserve the first rendered output before any
coordinator or human refinement.

- Fixed model and reasoning effort: inherited parent settings for
  `/root/s2a1_shell`; do not change them during the pilot.
- First-render artifact and source identity: receipt must name captures and the
  exact owned-path digest before the first visual review.
- Repair log and final-render artifact: append each substantive repair with its
  category and retain separate final captures.
- Correct authority retrieved: score yes/no against the sources in this packet.
- Correct precedent chosen and applied: score yes/no against the visual-precedent
  section.
- Approved human decisions preserved: score yes/no against U1–U4/U10/U13 and the
  non-goals.
- Substantive repair count: record exactly; formatting-only changes do not count.
- Failure causes per repair: classify as missing instruction, bad composition,
  implementation error, or subjective refinement.
- Focused verification caught problems before human review: score yes/no and
  cite the failing test or note that only visual review caught it.

## Return to the coordinator

Report changed paths and scoped identity, exact final verification and inspected
states, durable evidence, unresolved risks, provider/runtime delta, and the
Engineer review requirement. Include replay commands/configuration and retain
custom assertions. Separate the worker's self-review from the later independent
Intent and Engineering Risk reviews. Do not commit, push, migrate production,
alter providers, start S2a-2, or expand scope.
