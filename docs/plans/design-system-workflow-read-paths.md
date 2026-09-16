# Design-system instruction paths and bounded handoff

Status: done — documentation preparation, pilot reconciliation and standing
handoff closeout on September 14. Fixed point:
`49f9f22ae94d579b4c530de845e8637d299a9c7d`.

## Contract

The user authorized the next documentation/workflow preparation step after the
local checkpoint. Medium radius because routing affects future implementers;
one documentation-only slice, not a workflow redesign or live-agent experiment.
The checkpoint matches the clean starting tree. One coordinator owns edits;
the existing project-required Dark/Light pair will review the final diff read-only.
No workers implement app code or compete on designs. Unavailable review leaves
the slice review-pending; the coordinator retains verification/repair capacity.

Current problem: the required V1 plan includes the entire cross-domain engineering
register, and every lab change loads detailed notes for unrelated families.
Desired result: common requirements remain at existing entry points; family
detail is required on the matching branch; sensitive-change reporting remains
mandatory. A short optional handoff links existing owners instead of duplicating
them or relying on this conversation.

Non-goals: change design meaning, approval/review gates, financial semantics,
models, app/test behavior, root router or kit skills; start a task, commit, push,
restart previews, or claim a fresh-agent reliability improvement.

Acceptance: exact preservation checks for moved guidance and register rows;
resolved relative links/anchors; task-path pressure/counter-case inspection;
word counts labeled as document volume rather than token use; scoped docs checks,
Dark/Light review, wiki lint and housekeeping. No browser test is needed for a
documentation-only change. Live-agent behavior and cost savings remain unproven.

## Read-path audit

Two representative tasks:

1. A local chart-lab spacing fix. Route: repository workflow and project rules,
   V1 plan, lab guide, target catalog/implementation and relevant chart guidance;
   code/UI rules and affected test seam still apply. It does not need deferred
   auction editor, governance layout or every engineering register row.
2. A new source-backed composition. The same common route additionally requires
   the participating catalog owners, actual product/state evidence and the
   existing flow-composition transfer brief. Fresh-task context cannot substitute
   for inventorying what the real product does or for inspecting the result.

The earlier [consolidation reconciliation](design-system-consolidation-reconciliation.md)
found retrieval/API benefits, not better first-pass composition. This pass does
not rerun or reinterpret that experiment. The 33 kit skills are already modular;
no blanket split or new universal orchestration layer is justified here.

## Changes and verification

1. The [common lab guide](../../src/views/internal/design-system/CLAUDE.md)
   retains its seven-pass review, geometry, canonical-owner and verification
   rules unchanged. Four explicitly routed guides hold chart, current/history
   auction, deferred-workspace and table/governance detail. Shared-host edits
   load each affected family. Deferred-workspace notes still require explicit
   authorization; relocating them does not schedule that work.
2. The [main plan](design-system-v1.md#deferred-engineering-review-register)
   keeps reporting triggers, deferral limits and approval policy. The
   [separate register](design-system-engineering-handoff.md) preserves all 29
   entries and their evidence. Its old anchor remains a working route for
   existing references; final engineering handoff must review the complete list.
3. The optional [handoff template](../../templates/design/implementation-handoff.md)
   records intent, approved differences, reference roles, isolation and proof.
   It links the existing flow brief rather than replacing it. Neither root
   routing nor kit skills nor permanent task/model defaults changed.
4. Removed the copied transient chart/table review-status paragraph from the
   lab guide; the guide routes to the existing plan/decision and Current Review
   owners instead. Corrected one stale Discover receipt anchor in the touched
   ledger to the same preserved 21/21 evidence, without changing its claims.

Measured whitespace-delimited words at the fixed point versus this slice:

| Selected document                              |         Before | After |
| ---------------------------------------------- | -------------: | ----: |
| Main V1 plan                                   |          4,042 | 2,777 |
| Common lab guide                               |          3,293 |   735 |
| Chart-specific guide, now read only for charts | Included above |   251 |
| Selected chart-path total                      |          7,335 | 3,763 |

The other guides are 1,071 words (auction tables/browse), 956 (deferred auction
workspace) and 564 (table/governance records). The selected chart path is about
49% smaller. This excludes unchanged root instructions, skills, project rules,
catalogs, implementations and test/product sources. It is not measured token
usage, total context, speed, cost, or first-pass reliability improvement.

Static pressure/counter-case inspection:

| Request                                        | Required route                                                                                              | What stays out or stops                                               |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Local chart spacing fix                        | Common plan/lab rules, charts guide, target owners, scoped UI/code/test rules                               | Unrelated auction and governance detail                               |
| New source-backed governance composition       | Common rules, table/record guide, catalog owners, real product states and completed flow-transfer preflight | No blanket adoption or invented financial/state meaning               |
| Hover change shared by multiple lab families   | Common rules, accepted hover contract, each affected family guide                                           | Not permission to change shared production defaults                   |
| Hover change requiring a new return definition | Common sensitive-behavior boundary and relevant engineering entry                                           | Stop financial implementation for explicit scope/engineering decision |
| Deferred auction weight editor                 | Workspace guide only after explicit authorization                                                           | Moving its notes cannot reopen the deferred flow                      |

Replay the bounded preservation/route/link checks from the repository root:

```sh
node docs/plans/design-system-workflow-read-paths/verify.mjs
node scripts/llm-workflow/wiki-lint.mjs
git diff --check
```

The verifier compares six complete moved blocks, unchanged common lab rules,
all 29 register entries and retained plan policy against the fixed point. It
checks links/anchors and excludes runtime changes. This is a one-slice document
verification artifact, not new general tooling or a behavioral agent benchmark.
Formatting uses the installed formatter without dependency reconciliation.

The mechanical scope map matches Markdown under the lab's source directory to
app typechecks, unit/browser suites. Under the existing documentation-only and
bounded V1 cadence, this slice substitutes the direct document-preservation,
link, formatting, diff and wiki checks; it does not change the map or run an
unrelated repository gate. No browser/UI evidence is refreshed or newly claimed.

Independent Dark/Light review: both passed with no blocker or actionable minor
finding. Dark independently compared the register rows and checked omitted
transient-status text against its retained owner. Light followed both reader
journeys and checked shared-host, sensitive-change and flow-preflight counter-cases.
Both reran the preservation verifier. No fresh-agent implementation, model trial
or behavioral confidence claim is made by these reviewer checks.

Closeout record: medium, 14 files; two read-only reviewers, zero findings.
Final document checks cover 247 relative links/anchors, six guidance blocks and
29 register rows. The first link pass found the pre-existing renamed Discover
receipt anchor described above; it was corrected and the check rerun. No browser
runs, dependency changes, user correction round or runtime edits occurred.
Provider token usage and end-to-end repair cost were not measured. Formatting,
wiki and whitespace checks pass; existing log history is preserved byte-for-byte.
No further kit change is justified by this slice.

## Deliberately unchanged by the original cleanup

The root still requires the active plan; accepted decisions, typed catalogs,
project overrides and engineering safeguards keep their existing precedence.
The larger reference/decision/history split remains deferred. Source-based
charts and all UI stay untouched. The earlier comparison's mixed verdict stands.
Changing task defaults or assigning cheaper models is a separate decision, not
an organizational edit silently introduced through this handoff template.

## Pilot authorization — September 14

The user approved a separate fresh Sol-medium task using an isolated copy of
the current work. The [mobile-axis pilot brief](design-system-mobile-axis-pilot.md)
owns its bounded scope. This is a delivery pilot, not a blinded model comparison
or a permanent capability/default assignment. The proposal below records the
original boundary; its task/model approval prerequisite is now satisfied.

### Original proposal

Use the next genuine, approved local chart presentation correction, potentially
the established mobile Overview no-axis-label policy if a source/render preflight
confirms a gap. Do not manufacture a defect or use the unresolved hover-return
calculation as a supposedly cosmetic pilot.

After user approval, give one fresh implementation task an exact starting state,
the normal documentation entry point, bounded intent, visual reference roles,
non-goals and focused acceptance evidence. Keep its repair iterations in that
task; the coordinator owns integration. An isolated working copy and separate
preview avoid concurrent writes and interference with 3005.

Sol at medium effort remains the previously discussed candidate, not an assigned
or validated capability profile. Task/model approval and runtime availability
must be resolved before launch. Preserve the first output and record corrections,
reruns, elapsed time and available usage; do not infer token savings from word
counts. The user reviews visual quality. A delivery pilot with a detailed brief
does not prove independent design-system consumption; that is a separate future
test with an ordinary request and normal entry point. No comparison or benchmark
is launched by this document.

## Operating-rule closeout — September 14

The user authorized finishing the remaining workflow preparation before returning
to charts. This is one medium documentation stage against the same fixed point,
with the inspected earlier documentation work retained as input. Current gaps:
the pilot still reads pending, its evidence lives only in a worktree, and fresh
task handoffs depend on conversation memory. Desired result: a reconciled no-change
pilot, portable evidence and one short standing rule at the existing DS router.

One coordinator edits; the project-required Dark/Light pair reviews the new
policy and reconciliation read-only. This is a documentation-only exception to
the new implementation handoff default, not another chart implementation task.
No app changes, checkpoint, model reassignment, installations, preview changes or
Codex internals debugging. Unavailable review stays pending.

Usage sketch and visible pressure cases (not a blinded behavior evaluation):

- An approved coherent chart correction: the coordinator proposes a fresh task,
  records boundaries and asks for launch approval; the user need not prompt for
  delegation. One implementer owns subsequent repairs; coordinator checks the
  returned diff and evidence before integration and user visual review.
- A one-line local correction: state the local exception, perform scoped proof,
  and avoid a new task. A repair to delegated work returns to that owner instead.
- A created task cannot be resolved by the app: distinguish its pending creation
  ID from a usable task ID, bound discovery attempts, inspect the agreed result
  artifact if available, and state what remains unknown. Do not launch a duplicate
  or claim automatic completion tracking.

Single candidate: project-owned policy at the existing router plus return fields
in the existing handoff template. Rejected: mandatory new task for every tiny
edit, a global model default, or a new orchestration service. These add overhead
or authority the user did not request. Acceptance rubric: discoverable rule;
explicit authority/ownership; truthful evidence and usage; bounded failure path;
no runtime or accepted-design drift. Static review can check all five but cannot
prove future agent compliance. The pilot is evidence of a bounded investigation,
not implementation quality, independent DS consumption or cost savings.

Proof: preservation/link checks extended only for six hash-identified pilot PNGs,
source/no-diff comparison, inspection of archived captures, formatter/wiki/diff,
and the required pair. The original cleanup metrics and review above remain a
dated record; they are not recalculated claims about this later policy addition.
Closeout: both read-only reviewers passed with zero findings. Dark compared the
verifier to its pre-closeout copy and independently checked source boundaries and
all original/archive hashes; Light traced substantial work, local exceptions,
repairs and missing-task recovery. Both reran the preservation/link, wiki and
whitespace checks. No review asserted live-agent compliance.

Final scoped document/format/wiki/diff checks pass. Scope reports medium, 22 files
including the inherited documentation slice and six archived images, correctness
lens only, no red flags or stale area guide. Its broad app commands are replaced
by the bounded docs proof for the reason recorded above; no browser suite was
rerun in this closeout. The main and pilot chart/hook/regression sources are
unchanged. No user correction, runtime edit, dependency change, commit or preview
mutation occurred in this stage. Attributable token/cost measurements are unknown.
The existing project router/template now cover the observed handoff and reporting
friction; no further kit change or model experiment is required before charts.

The [reconciled pilot receipt](design-system-mobile-axis-pilot/README.md) closes
the no-change investigation. The [standing rule](../wiki/domains/design-system.md#implementation-handoffs)
owns future handoffs. Chart design remains human-review-required, with production
adoption and sensitive semantics still separately gated.

## Required-handoff refinement — September 16

Status: done — documentation-only stage against `49f9f22ae`. The user approved
the smallest response to the workflow/context-reliance audit: require the
existing bounded packet for coherent non-trivial design-system delegation,
tighten its authority, precedent, scoped-identity and proof fields, and add one
topology pointer. Tiny local fixes and documentation-only changes remain explicit
exceptions. This stage does not rewrite reusable workflow skills,
add enforcement tooling, change a component, fix the separate comment-scanner
mismatch, commit or push.

The task-owned identity is intentionally narrow: starting and returned state
cover owned paths and relevant evidence only, including authorized dirty input.
Ordinary work in this heavily dirty checkout does not create a repository-wide
manifest. Each acceptance criterion maps to its test seam, rendered state,
command or artifact, and proof owner. The last edit is followed by an
affected-surface run with a durable evidence pointer.

### Pilot definitions before dispatch

**Integration pilot:** Toast followed by Progress may test whether a fresh owner
can integrate Claude's existing detailed drafts through the stricter handoff.
They cannot establish independent first-pass composition, because their prepared
brief already supplies substantial source selection and design direction. Keep
one selected model and reasoning effort fixed across the pilot and record them
before dispatch. Preserve each first render and subsequent repair separately.
Start only when the returned bundle has a scoped identity, digest/diff, report,
replay instructions and retained evidence. Integrate only the worker-owned
candidate, state-sheet and focused-test paths as exploratory with adoption
remaining `none`; do not redesign policy, shared defaults or production, and do
not include Slider. Slider is also covered by the prepared brief, so it is not a
clean-composition substitute.

**Clean-composition pilot:** no suitable untouched ordinary component is
currently queued. Current Review is empty and the approved chart closeout did
not select a successor; the other unprepared entries are the already-briefed
Toast and Progress plus conditional, possibly-not-needed Slider. Do not
manufacture an assignment or retroactively treat any of them as proof. When the
user selects a source-grounded ordinary component without a detailed prior
draft, freeze the same model and reasoning effort before dispatch, use the normal
authority path plus required handoff, and preserve the first rendered output
before any repair.

Evaluate either pilot with this rubric:

| Question                                               | Recorded outcome                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Did the task retrieve the correct authority?           | yes/no, with exact sources                                                           |
| Did it choose and apply the correct precedent?         | yes/no, with the rendered precedent and mismatches                                   |
| Did it preserve approved human decisions?              | yes/no, with the inspected decision seams                                            |
| How many substantive repairs were required?            | count; exclude spelling and mechanical formatting                                    |
| What caused each substantive failure?                  | missing instruction, bad composition, implementation error, or subjective refinement |
| Did focused verification catch it before human review? | yes/no, with the command or retained artifact                                        |

A substantive repair changes authority, scope, precedent application,
composition, behavior or an approved decision. Record mixed causes rather than
forcing a single label. A green focused check is evidence only for the problem
it could detect; human visual judgment remains separate.

Closeout: scoped Prettier, wiki lint for 20 pages and whitespace checks pass
after the final edit. Independent Intent and Engineering Risk review passed with
no Critical or Important finding; its only Minor was the placeholder progress
row, corrected before this final run. The full-tree scope remains dominated by
the inherited dirty checkout, so no unrelated app or browser gate was rerun.
This section is the durable receipt; no pilot or component implementation began.
