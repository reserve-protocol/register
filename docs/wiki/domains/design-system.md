---
title: Design System
updated: 2026-09-08
type: domain
sources:
  - docs/plans/design-system-v1.md
  - docs/wiki/decisions.md
  - docs/wiki/project.md
  - src/views/internal/design-system/foundation-catalog.ts
  - src/views/internal/design-system/component-catalog.ts
  - src/views/internal/design-system/current-review.ts
---

# Design System

This page routes design-system work to the smallest relevant current context.
It does not restate component contracts, foundation values, chronology, or
implementation details owned elsewhere.

## Start here

1. Read the applicable repository workflow instructions from `CLAUDE.md`.
2. Read `docs/wiki/project.md` for Register safety, UI rules, and explicit
   overrides to reusable kit guidance.
3. Read the current goal, precedence, state, frontier, and risks in
   [the active V1 plan](../../plans/design-system-v1.md).
4. Find the target in the typed foundation or component catalog. Follow only
   its declared foundation IDs, implementation source, accepted decision, and
   relevant evidence paths.
5. Read [Current Review](../../../src/views/internal/design-system/current-review.ts)
   only when preparing or responding to the active human-review target.

## Current authority path

| Need                                                    | Owner                                                                                                                       |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Repository safety and project overrides                 | `CLAUDE.md` and [Project](../project.md)                                                                                    |
| Current operating model, frontier, risks                | [Active V1 plan](../../plans/design-system-v1.md)                                                                           |
| Accepted design meaning and rationale                   | [Decision ledger](../decisions.md)                                                                                          |
| Foundation authority and IDs                            | [`foundation-catalog.ts`](../../../src/views/internal/design-system/foundation-catalog.ts)                                  |
| Component authority, maturity, dependencies, and routes | [`component-catalog.ts`](../../../src/views/internal/design-system/component-catalog.ts) and its primary/support registries |
| Reusable implementation truth                           | The `implementationSource` named by the target catalog entry                                                                |
| Active human-review boundary                            | [`current-review.ts`](../../../src/views/internal/design-system/current-review.ts)                                          |
| Production behavior and constraints                     | The product/evidence paths explicitly routed by the catalog or a bounded audit                                              |
| Adoption state                                          | The target catalog entry; accepted lab output does not imply product use                                                    |

When sources appear to conflict, use the precedence in the active plan. A
generic Skill default never silently overrides an explicit Register decision.
A historical or visual source informs work only in its declared evidence role.

## Route by task

### Refine an existing component

Load its component catalog entry, typed foundation dependencies, named reusable
implementation, accepted decision source when present, and only the product or
visual evidence routed for that target. Do not load the full historical plan or
complete detailed reference by default.

### Prepare a missing component

Start from its catalog status, review contract, relationships, and next action.
Reuse existing audits named by the entry. A rendered specimen or reusable file
does not become current authority without human acceptance.

### Review a realistic composition

Load the participating component entries and only their foundation IDs. Then
load the bounded product/audit evidence that owns mechanics, content, and
behavior. Strong visual precedent is a quality bar, not canonical authority;
legacy coverage is not a design target.

Before implementing or multiplying an existing product flow, complete the
[flow composition transfer brief](../../../templates/design/flow-composition-transfer.md)
in the active project plan, or point each of its sections to an equivalent
source-backed owner. The preflight is complete only when:

- every visible production state, action, content relationship, recovery branch,
  and responsive substitution has a disposition;
- the at-a-glance task and supporting-detail hierarchy are explicit;
- every component use names its exact size, tone, state, and authority boundary;
- every inset, sibling gap, divider, action seam, and scroll boundary has one
  geometry owner;
- important state transitions identify preserved context, legitimate
  replacement, and movement or information loss to test; and
- every consequential value names its truth category and authoritative source.

Render and correct one representative happy-path state plus one structurally
different pressure state before applying the composition to the complete state
matrix. Passing behavior tests or listing token names does not make a
composition review-ready.

For a greenfield flow, use the experience-design brief to establish journeys,
constraints, and human gates first. Then use the hierarchy, exact reuse,
geometry, continuity, truth, and first-slice sections of the same composition
brief; replace production dispositions with an intended state contract and
explicit non-goals.

The automated-mint review is a provisional example of a flow-owned
page-workspace exception: it narrows for amount-entry configuration and widens
only when quotes create independently inspectable orders. Its detailed
production/SDK state map
and classified reuse gaps live in the
[transaction-system audit](../../plans/transaction-system-audit.md#12-automated-mint-lab-reconciliation-2026-09-03).
Its entry sequence preserves the production distinction between advanced-flow
guidance, a disconnected smart-account requirement, and a connected but
incompatible wallet before configuration; do not collapse these into a generic
empty state or infer that the lab's simulated actions are wallet behavior.
Treat the current product and SDK mechanics as the behavioral baseline: improve
their hierarchy and presentation in the lab, but do not reinterpret funding,
execution, result sourcing, or recovery without an explicit product or
engineering decision.
Do not infer a Dialog host, universal stepper, shared order row, or production
adoption from that lab composition.

### Respond to designer feedback

Classify the correction as local, component, composition/pattern, foundation,
or reusable heuristic. Update the smallest justified current owner and its
typed route. Do not turn an intermediate composition into broad authority.
When a transaction composition intentionally pressures a current baseline or
strong retained precedent, add or update its row in the active plan's
Transaction composition pressure register before treating the experiment as a
reusable direction. Ordinary conformance and implementation bugs are corrected
at their owner and do not become exceptions.

### Adopt into production

Treat adoption as a new explicit slice. Re-read the owning product area guide,
preserve mechanics and copy unless the task authorizes change, instrument new
interactions where required, and run verification for the real blast radius.
Lab acceptance alone does not authorize migration or shared-default changes.

Before changing a production surface, make a source-backed inventory of its
current visible states, actions, content, data relationships, and recovery
branches. Give every item one explicit disposition:

- **Reviewed replacement:** the lab reviewed this same job and state, so the
  accepted decision transfers within its stated boundary.
- **Preserved behavior:** the lab did not review it, so retain its functionality
  and meaning while applying only already-compatible foundations or components.
- **Unresolved:** the lab and production disagree, or the migration cannot
  preserve the current behavior without improvising. Stop that item, record it,
  and request design or engineering review.

Absence from the lab is never evidence that production behavior is obsolete,
unimportant, or safe to simplify. A lab specimen also does not authorize a
replacement for adjacent flows merely because they look similar. Migration
proof must compare the resulting production surface against the pre-change
inventory so omitted states cannot disappear silently.

## Foundation routing

Foundation IDs are typed and are the only values component groups may declare:

| ID              | Job                                             | Primary current owners                              |
| --------------- | ----------------------------------------------- | --------------------------------------------------- |
| `color`         | semantic themes, surfaces, text, intent         | `src/app.css`, `tailwind.config.ts`, catalog        |
| `typography`    | role scale, reading and financial values        | catalog, `typography.ts`, accepted decisions        |
| `spacing`       | rhythm, density, inset relationships            | catalog, layout recipes, accepted decisions         |
| `radius`        | semantic corner roles                           | catalog, semantic recipes, accepted decisions       |
| `layout`        | responsive and composition structure            | catalog, layout recipes, product-owned compositions |
| `elevation`     | overlay and floating hierarchy                  | catalog, semantic tokens                            |
| `motion`        | durations, easing, reduced motion               | catalog, `src/app.css`, component owners            |
| `iconography`   | glyph roles and identity geometry               | catalog, icon/identity owners                       |
| `accessibility` | focus, naming, target and semantic requirements | catalog, canonical behavior owners                  |

Use [the detailed reference](design-system-reference.md) only when the typed
catalog, accepted decision, and implementation do not contain enough detail for
the task. A later per-foundation split is intentionally deferred.

## Component and implementation routing

The product-shaped catalogs are authoritative for whether a capability is
undefined, exploratory, current baseline, superseded, rendered, reusable,
review-ready, or adopted. Component relationships state semantic boundaries;
foundation dependencies state only actual foundation IDs.

Context sources use lightweight roles:

- `authority`: current typed or canonical design owner;
- `accepted-decision`: durable human-reviewed meaning and rationale;
- `implementation`: current reusable or specimen implementation;
- `visual-evidence`: strong composition precedent without authority;
- `product-evidence`: current mechanics, behavior, or content constraints;
- `legacy-evidence`: coverage or migration evidence that must not drive the
  visual direction.

Do not rank these with a score. Their role plus the active-plan precedence is
enough.

## Current Review

The transaction entry is retained as a paused checkpoint, not an automatic next
assignment. Its review-ready flag describes availability for later review, not
blanket acceptance. The [checkpoint disposition](../../plans/transaction-consolidated-regression.md#checkpoint-disposition)
separates current flow-local designs from unreviewed entry cards, the standalone
selector, future Portfolio row/table work and engineering-owned adoption.

Current Review contains one nearly complete candidate at the boundary of human
judgment. It is not a backlog, a promotion queue, or an authority source. Its
typed conformance record must name accepted or explicitly provisional
dependencies. The current target is derived from `current-review.ts`; do not
copy its transient status into this router.

## Evidence and studies

- [Detailed design-system reference](design-system-reference.md) — accepted
  detailed guidance plus dated evidence; load on demand.
- [Historical V1 plan](../../plans/design-system-v1-history.md) — completed
  studies, superseded queues, old handoffs, and review chronology.
- [Transaction-system audit](../../plans/transaction-system-audit.md) — bounded
  requirements, lifecycle, source, and correctness evidence.
- [Transaction feedback postmortem](../../plans/transaction-review-feedback-postmortem.md)
  — failure classification and routing lessons, not visual authority.
- [Transaction checkpoint](../../plans/transaction-consolidated-regression.md)
  — regression evidence, retained scope, exclusions and migration limits.
- `/internal/design-system/studies` — unresolved alternatives and active
  pressure tests only; rendered output does not promote itself.

## Adoption boundary

Canonical candidates and reusable recipes remain opt-in until a product slice
explicitly adopts them. Existing production UI supplies behavior and coverage
evidence but does not override the accepted V1 visual direction. Conversely,
the lab must not change product mechanics, wording, transaction truth, or
package-owned behavior merely to make a candidate easier to compose.

Production adoption, shared defaults, global tokens, package styling, and
cross-feature migrations each require their own authority and proportional
verification.
