# Design-system upstream integration receipt

Opened 2026-09-16 for S0 of the
[documentation-experience plan](../design-system-documentation-experience.md).
This receipt records recovery and integration evidence; it does not authorize
documentation-shell implementation, component migration, publication, or a
push.

## Starting point

- Project branch: `design-system-v1`.
- Fixed point: `49f9f22ae94d579b4c530de845e8637d299a9c7d`.
- Verified remote default at preflight: `origin/master`.
- Locally fetched target at preflight:
  `715fa19067299a10535043d9b95a15edf9676251`.
- Merge base: `2312d5434842a71118554056a95f12948b95ae74`.
- Divergence before the checkpoint: 22 project commits ahead and 17 upstream
  commits behind.
- Nine pre-existing stashes are unrelated recovery state and remain untouched.

## Main-checkout checkpoint boundary

The frozen pre-staging inventory contains 49 tracked modifications and 624
untracked paths after adding this receipt: 673 expanded paths. Every visible
path was inspected as part of one of these bounded groups:

1. Design-system authority, workflow guidance, plans, receipts, and cited
   evidence under `docs/plans/`, the affected `docs/wiki/` pages,
   `e2e/TEST_MAP.md`, `skills/topology.md`, the lab area guide/guidance, and the
   implementation-handoff template.
2. Design-system Chart source, fixtures, component/catalog updates, and their
   unit and browser tests.
3. Opt-in shared/product Chart seams in Button, segmented controls, Home, and
   Overview, including their tests, locale catalogs, and the mobile-preview
   build entry.
4. Curated visual and browser-report evidence cited by the active plans and
   wiki log. The untracked checkpoint input is approximately 108 MB; large
   Playwright JSON reports remain evidence rather than disposable root-level
   test output because the durable receipts cite them.

No unrelated visible path was identified. Staging must use these scoped owners,
not a repository-wide add, and the returned staged set must match this frozen
inventory. The exact path-list hash is recorded below after the receipt itself
is present.

- Frozen expanded-path count: `673`.
- Frozen porcelain path-list SHA-256:
  `18c8f62fc200f230f5020a800332f3445045a45ee03ba5fd03f5d50b10fa276f`.

Ignored dependencies, local builds, ordinary Playwright output, temporary
files, generated locale artifacts, editor state, and the ignored environment
file are excluded. No force-add is permitted.

## Detached-worktree preservation boundary

Detached Claude outputs are not imported into the project checkpoint. Separate
local preservation refs own only their task paths:

- Toast, Progress, and Slider draft package;
- cited Chart-readiness audit;
- cited Table-review evidence;
- cited broader Table research;
- uncited Earn-review evidence retained conservatively;
- uncited Chart-audit preflight retained conservatively.

These refs are recovery anchors, not design authority and not merge inputs. The
active small-components preview and its worktree remain in place. Historical
Codex worktrees whose meaningful outputs are integrated or superseded are not
rewritten or removed. The already committed foundations-audit branch remains
untouched despite its broken external worktree pointer.

## Checkpoint verification

Before staging, fresh checks passed:

- `git diff --check`;
- `pnpm typecheck`, including application and E2E TypeScript;
- `node scripts/llm-workflow/wiki-lint.mjs` (`20 pages green`).

The scoped workflow classified the change as high and routed correctness,
product, and complexity review. The current chart and workflow packages retain
their own affected browser/unit receipts; S0 will run the repository integration
gate after merging the freshly pinned upstream commit in an isolated worktree.

## Pending S0 results

- Main checkpoint commit and safety ref: pending.
- Detached preservation refs: pending.
- Fresh upstream target and conflict forecast: pending.
- Isolated integration branch/worktree: pending.
- Merge reconciliation and verification: pending.
- Promotion to `design-system-v1`: requires separate human approval after the
  verified merge receipt; no push is authorized.
