# Design-system upstream integration receipt

Opened 2026-09-16 for S0 of the
[documentation-experience plan](../design-system-documentation-experience.md).
This receipt records recovery and integration evidence; it does not authorize
documentation-shell implementation, component migration, publication, or a
push.

## Starting point

- Project branch: `design-system-v1`.
- Fixed point and checkpoint:
  `783030433e61c73c554eb348126ff53657cd079c`.
- Safety ref: `codex/safety-design-system-v1-pre-upstream-20260916`, also at the
  checkpoint SHA.
- Verified remote default: `origin/master`.
- Refreshed pinned target:
  `e0f32138971fc87e85456e4e6d2e6ef3739c827a`.
- Merge base: `2312d5434842a71118554056a95f12948b95ae74`.
- Divergence at merge start: 23 checkpoint commits ahead and 19 upstream
  commits behind.
- Isolated integration branch: `codex/design-system-v1-upstream-20260916`.
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

## S0 integration result

The refreshed upstream advanced from the earlier preflight SHA
`715fa19067299a10535043d9b95a15edf9676251` through dependency commit
`102d0e36db665c29120b21bcf43944df186bcd90` and its merge commit. That delta
only changes the exact React Zapper pin and lockfile from 2.10.6 to 2.11.0; it
added no conflict path, but it required a new quote-provider verification lane.

The exact `--no-ff --no-commit` merge produced the two forecast text conflicts:

1. `src/components/dtf-chat/index.tsx` retains the checkpoint's suppression of
   non-embedded product chat on `/internal/design-system` and upstream's
   draggable launcher, general Index Overview predicate, and breakpoint-specific
   launcher behavior. The drag hook is disabled on the internal design-system
   route, so the hidden product surface installs no drag behavior.
2. `src/views/index-dtf/overview/CLAUDE.md` retains upstream's unified
   content-column/xl-rail guide and formatted test matrix together with the
   checkpoint's lab-only `PriceChartBody.onInspect` row and the `onInspect` and
   `launchMarkerVariant="annotation"` adoption boundaries.

Two automatic union merges needed semantic cleanup: `docs/wiki/log.md` now has
one frontmatter date and places the retained upstream September 11 launcher
entry chronologically; `docs/wiki/progress.md` has one frontmatter date and one
table header while retaining both sides' ledger rows. Additive overlaps were
also inspected: the lazy design-system route coexists with the unified Overview
route; design-system scripts coexist with the 2.11.0 pin; test-map and locale
additions retain both sides; the lock resolves to 2.11.0; and upstream's obsolete
Overview selector and stock-only wrappers remain removed.

The installed 2.11.0 README and type contract identify `1inch` as an enabled
Reserve-API aggregator with endpoint slug `1inch`. The first transaction-flow
run failed strict teardown on the new unmocked `/1inch/swap` request. The central
Zapper helper now gives all three aggregators the same deterministic
provider-level error, preserving the single-candidate test model without
allowing an untracked request. Current Zapper guidance and the current lab
evidence label now describe 2.11.0; historical 2.10.5 records remain history.

### Verification

- `pnpm install --frozen-lockfile`: passed; installed
  `@reserve-protocol/react-zapper@2.11.0` and the lockfile passed supply-chain
  policy checks.
- RED: `pnpm exec playwright test --project=full
e2e/tests/flows/zap-buy-sell.spec.ts` failed on the new unmocked
  `/1inch/swap` request.
- GREEN: the same command passed 2/2 after the central helper update.
- `node scripts/llm-workflow/scope.mjs --base
783030433e61c73c554eb348126ff53657cd079c` passed lint with inherited
  warnings only, application TypeScript, all 162 unit files / 1,394 tests, and
  E2E TypeScript. Its aggregate E2E-helper lane stopped at 83/84 because the
  native source-watcher case did not observe a filesystem event within five
  seconds; the exact case passed 7/7 in 74 ms when rerun alone, so no product or
  harness code was changed.
- Focused pathname, exposure-row, and large-mint-prompt units passed 32/32.
- `pnpm e2e:smoke` passed 59 tests with one existing skipped case. This covers
  the draggable chat launcher, including mobile, and Index Overview lifecycle,
  state, and source-data rendering across Base, BSC, and mainnet.
- The isolated design-system browser review reached 138 passing cases before it
  was deliberately stopped after all affected Chart families had run. The
  Chart lane passed the real Overview renderer, the current next-families deep
  link, 320/390/desktop widths, light/dark states, touch and keyboard
  inspection, empty/zero/missing-history states, and text-control overflow.
  One unrelated auction-history tooltip dismissal failed once during that broad
  run and passed 1/1 in isolation. The focused internal-route chat-suppression
  assertion passed 2/2 on desktop and mobile. Generated browser evidence was
  removed or restored after the run and is not part of this merge.
- Intent/preservation review and Engineering Risk review both returned PASS
  with no merge blocker. The retained review boundary is global routing/chat,
  the unified Overview one-widget behavior, and the React Zapper 2.11 provider
  contract; live `1inch` execution remains explicitly unproved by S0.
- Final post-edit `node scripts/llm-workflow/scope.mjs --gate` passed
  application/E2E TypeScript, lint with inherited warnings only, and all 162
  unit files / 1,394 tests in 73.5 seconds. Final Prettier, staged whitespace,
  conflict-marker, and documentation checks passed before the merge commit.

### Preservation refs

Detached materials remain outside this integration and are retained at:

- `codex/preserve-small-components-20260916`;
- `codex/preserve-chart-readiness-audit-20260916`;
- `codex/preserve-table-review-evidence-20260916`;
- `codex/preserve-table-research-evidence-20260916`;
- `codex/preserve-earn-review-evidence-20260916`;
- `codex/preserve-charts-audit-preflight-20260916`.

Verification is complete. The local merge commit is this receipt's owning
commit on `codex/design-system-v1-upstream-20260916`; its exact immutable SHA is
reported in the final handoff because a commit cannot contain its own object ID.
Promotion to `design-system-v1` requires separate human approval; no push or
publication is authorized.

Engineer review remains required because this integration changes global routing
and chat behavior and advances an issuance/Zapper dependency contract. S0 does
not prove live 1inch execution or authorize production deployment.
