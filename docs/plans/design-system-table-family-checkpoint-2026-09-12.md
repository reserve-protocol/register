# Table-family review checkpoint — September 12, 2026

## Contract

The user authorized a local checkpoint commit so an independent Earn/DeFi audit
can inspect the current lab rather than the older foundation checkpoint.
Fixed point: `01a900cdf2589d455d04f78806d2ca8ff2b9122c`.
Medium verification/documentation slice; no new application behavior is planned.
The containing checkpoint commit is the immutable handoff snapshot; resolve it
with `git log --diff-filter=A -1 --format=%H -- docs/plans/design-system-table-family-checkpoint-2026-09-12.md`.

Include the accumulated Earn/DeFi candidates, Holdings/Discover/Portfolio
refinements, supporting opt-ins, tests, source fixtures and retained evidence.
Preserve existing file ownership. No production migration, transaction execution,
new Auctions implementation, design acceptance, dependency changes or push.

## Review boundaries

- Earn and DeFi remain human-review-required candidates, including the mobile
  wallet-position line, sparse positions and mobile pool action.
- Discover mobile cards and compact wrapping identity titles remain trials.
- Holdings retains the overview-width preview and current 51/12/20/17 column
  allocation. Discover tags use commas within a classification group and a dot
  between different metadata kinds.
- Existing source/adoption limitations remain in the
  [table reconciliation](design-system-table-family-reconciliation.md),
  [Earn brief](design-system-table-family-earn-preparation.md), and
  [DeFi brief](design-system-table-family-defi-slice.md).
- Engineer review is required before production adoption of shared opt-ins,
  balance-presence rules, sorting/data adapters and real action boundaries.
  This checkpoint grants none of that authority.

## Verification plan

Run affected family, shared identity/typography, catalog and source-hygiene units;
app/E2E typecheck; scoped lint/format; wiki and diff checks; and one isolated
browser run covering the table families, links, continuity and source fixtures.
Use the existing runtime and dependencies with pnpm. Own port 3043 only; do not
reuse or stop the user preview on 3005 or Claude's preview port 3047.
Inspect representative current desktop/phone, light/dark and pressure captures.
Passing checks prove their named seams, not live financial accuracy or human
acceptance. Historical receipts remain bound to their own snapshots.

The two independent checkpoint reviews are read-only: Intent checks scope and
handoff truth; Engineering Risk checks commit contents and shared/test seams.
The coordinator alone owns edits, verification, staging and the commit. Report
dropouts as pending, and reconcile concrete findings before committing.

## Evidence and disposition

Verified as a local review checkpoint, not a production-ready or accepted design.
The [verification receipt](design-system-table-family-evidence/checkpoint-2026-09-12/verification.json)
records commands, runtime, exclusions and review dispositions. The
[browser receipt](design-system-table-family-evidence/checkpoint-2026-09-12/record.json)
lists all 85 cases and 16 retained, visually inspected captures with hashes.

- Affected units/helpers: 211/211 across 26 files. The first sandboxed run passed
  210 and failed the native source-watcher test with `watcher-error`. That file
  passed 7/7 unchanged with native filesystem access; the full selection then
  passed 211/211 with the same access. No test was weakened or skipped.
- App/E2E typecheck passed. Browser review passed 85/85 without retries or skips,
  with one public source digest across every case. No transaction was sent.
- Scoped lint passed. Code/script formatting passed except the existing
  `e2e/fixtures/base.ts` formatting warning, reproduced from the fixed-point file;
  no unrelated whole-file reformat was introduced. The retained DAO capture
  script received formatting only. Wiki lint passed 20 pages; 406 relative links,
  921 historical capture references and 143 recorded hashes checked successfully.
- Intent and Engineering Risk reviews found no checkpoint blocker. The sole
  minor finding was fixed by naming the Earn audit route while retaining the
  Discover Current Review target. These bounded reviews do not substitute for
  the proposed independent Earn/DeFi audit or human design review.

Fresh captures cover DeFi desktop/phone and dark narrow long/loading cases;
Index/Yield sparse wallet and long/loading cases; overview-width Holdings names
and loading; Discover rows/cards; and desktop withdrawals. Remote-logo fallbacks
do not prove artwork fidelity. The 320px lab navigation chrome overlaps, outside
this family scope; dense metadata and long amounts remain visible wrapping
pressure cases, not newly approved designs.

Local verification used test Node 20.20.0 and pnpm 11.19.0 from the existing
installation; the pnpm launcher uses Node 24.19.0. This differs from the declared
Node >=24 / pnpm 11.5.2 toolchain, so no matching-engine or CI claim is made.
Existing React/Jotai deprecations, optional remote-configuration fallbacks and
Tailwind duration warnings remain. No dependencies were installed or changed.
The affected-checkpoint cadence replaces unrelated full repository/smoke gates
here; strict source fixtures and shared-helper units were included. Full gate,
production integration, CI and live financial correctness were not verified.

The owned browser run completed and released 3043. Ports 3005/3047 were untouched.
Both read-only checkpoint reviews completed; no worker owns pending edits.
All in-scope accumulated code/docs/evidence enter the commit. Ignored dependencies,
private environment files and generated local test reports are not commit input;
Claude's research packages stay unchanged in their separate worktree.

## Next work and authority

The independent audit should use this exact commit in its own worktree and
compare the newer Index governance, Yield staking and DeFi Yield lab families
against source behavior. Distinguish defects, intentional design differences,
production defects and unresolved adoption decisions. Do not redesign or alter
production; user authorization of the audit itself is separate from this commit.
Use `/internal/design-system/components/table#earn-family-review` and its family
selector for that audit. The sole Current Review target intentionally remains
Discover; its shortcut is not the Earn audit entry point.

The coordinator's next proposed slice is Auctions browse-record preparation:
source-faithful fixtures and explicit loading/empty/unavailable states before
desktop/phone visual review. The existing selected pane remains context only;
Governance composition stays unchanged. That implementation is not part of this
checkpoint. No running transaction, data migration or external write is expected.
Recovery is a separate checkout/worktree at the checkpoint commit; no restoration
test or live integration proof is claimed. No hidden conversation is required:
the linked briefs, accepted decisions and exact commit define the handoff.
