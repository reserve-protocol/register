# Overview mobile-axis pilot — reconciled receipt

September 14, 2026. **Complete: bounded no-change investigation.**
The [authorized brief](../design-system-mobile-axis-pilot.md) owns scope. No chart
or test patch needs integration; chart visual review remains open.

## Source and disposition

The isolated task and coordinator checkout both use fixed point
`49f9f22ae94d579b4c530de845e8637d299a9c7d`, plus the inherited documentation cleanup.
At reconciliation, neither checkout changes the lab chart directory, production
Overview chart directory, media-query hook or focused regression from that commit.
The six captures below were copied unchanged from the pilot's result directory.
They no longer depend on retaining that worktree.

The coordinator inspected the source: [useIsMobile](../../../src/hooks/use-media-query.ts)
uses viewport width below 640px. [PriceChartBody](../../../src/views/index-dtf/overview/components/charts/price-chart-body.tsx)
hides both tick sets and removes axis space on mobile. The
[lab wrapper](../../../src/views/internal/design-system/charts/source-overview.tsx)
uses that renderer without an axis override. Narrow containers in a desktop
viewport retain desktop axes. Changing this to container-based behavior would
be a new policy, not a correction authorized by this pilot.

## Evidence and limits

Pilot-reported measurements, consistent with the archived captures:

| State, both themes  | Viewport | Chart container | x/y tick counts |
| ------------------- | -------: | --------------: | --------------: |
| Phone               |    390px |           358px |           0 / 0 |
| Desktop             |   1400px |           824px |           6 / 5 |
| Constrained desktop |   1400px |           390px |           6 / 5 |

The worker reported three existing focused regression passes and two temporary
exact-count characterization passes. The temporary test was removed, so its
exact assertions cannot be replayed from the submitted package. These counts
are **worker-reported, not independently rerun test results**. Existing checks
remain in [chart-review-lab-regressions.spec.ts](../../../e2e/design-system/chart-review-lab-regressions.spec.ts):
“source chart review preserves real geometry and axis context” and “chart first
review light/dark”. Follow the owning e2e/lab guides to replay on an isolated
preview; do not assume those tests assert every temporary tick count.

Coordinator checks: source comparison, screenshot hashes, direct inspection of
the phone-light, desktop-light and constrained-dark captures, and documentation
checks. This proves enough for a no-change investigation, not full visual
acceptance, all breakpoints, or a new implementation-quality benchmark. Desktop
capture framing includes sticky lab navigation over the title area: use it for
axis evidence, not full-header quality approval.

The worker reported a separate preview on 3057 and one browser-permission rerun;
no implementation repair. Approximate elapsed time was 12 minutes, worker-reported.
Task-level token usage and cost are unknown. Account-wide allowance readings were
excluded because they cannot measure this task. No comparative model/cost claim,
financial change, production adoption or new engineer-review surface results.
The coordinator did not touch the user's 3005 preview during reconciliation.

## Task tracking limitation

The app returned only the pending creation ID recorded in the brief. The task
did not appear in the coordinator's supported listing, despite the user seeing
it finish. The actual worktree and its result were inspected instead. This is
an unresolved task-discovery limitation, not an unfinished pilot. No usable task
ID or automatic notification claim is inferred. Future dispatches use the
[standing fallback](../../wiki/domains/design-system.md#dispatch-and-return-checks);
fixing the app's tracking is not a prerequisite to resume chart review.

## Archived captures

SHA-256 binds these files to the original pilot output, not to a new browser run.

| Capture                                                       | SHA-256                                                            |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| [Phone, light](evidence/overview-phone-light.png)             | `ee33b608d8da75a548b02fe19a6e68fba7b50d4351718dd5760c17341a736e66` |
| [Phone, dark](evidence/overview-phone-dark.png)               | `4f2286a07758de587b9d18ba683e5414bb21bdd06fa2b7334abd2bc9b6310b53` |
| [Desktop, light](evidence/overview-desktop-light.png)         | `0900a9c9e274d3a23b3eb84c4c541f63eb2fd907fbbd95409a5aaf60e478f019` |
| [Desktop, dark](evidence/overview-desktop-dark.png)           | `876ca496f6e2906bdbb38e0f695c7d3045237d024b5840a88ad1607e8eae6560` |
| [Constrained, light](evidence/overview-constrained-light.png) | `056e07770823c15361d282b3178121b0ce17c227422eb60df41caac6b6232a1e` |
| [Constrained, dark](evidence/overview-constrained-dark.png)   | `2172eec72c82fcac28b6d9bfb2a0f856155cfc5e1abc77859ef37a728f652b98` |

From repository root, the document verifier checks archive hashes and preserved
guidance. The following separate check confirms the unchanged source boundary:

```sh
node docs/plans/design-system-workflow-read-paths/verify.mjs
git diff --exit-code 49f9f22ae -- src/views/internal/design-system/charts src/views/index-dtf/overview/components/charts src/hooks/use-media-query.ts e2e/design-system/chart-review-lab-regressions.spec.ts
```
