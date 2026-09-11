# Table-family independent review handoff

## Snapshot and purpose

This document is part of the user-authorized September 11, 2026 checkpoint on
`design-system-v1`, following `adef9ee76ffe2a579f6811cae2f5cf152cd0cf99`.
The launch prompt supplies the exact new commit. Verify `git rev-parse HEAD`
against it before review. A detached worktree contains that committed snapshot;
the primary checkout may continue changing. Never pull new primary changes into
this review or treat a primary-checkout preview as the frozen source.

The checkpoint includes the accumulated foundation consolidation, lab table
families, tests, documentation and retained evidence. It is not design acceptance,
an integration/release gate, or approval to migrate production. Environment files,
dependencies, generated localizations, test-output folders and private temporary
control transcripts are not committed. Retained records state their own narrower
source digests and limitations; historical passes are not proof of this full tree.
The [checkpoint receipt](design-system-table-family-review-checkpoint.json) records
the fresh bounded checks and the corrected stale catalog assertion.

We are building a simple, adaptable table/cell system that preserves product
meaning and successful interaction design. The goal is coherent reusable cells
and a small number of justified compositions, not a universal Table/Row component
or identical responsiveness everywhere. Apply a critical, practical perspective.
Challenge a recommendation when direct evidence supports something better;
distinguish that proposal from an accepted rule and do not implement it.

Your job is an independent completeness and source-fidelity review. Help the next
implementation pass avoid missing behavior, false consolidation, and visually
plausible but incomplete specimens. This is not another broad governance audit.

## Read and establish authority

1. Read `CLAUDE.md` and its routed instructions, then
   [the V1 plan](design-system-v1.md) and
   [the lab area guide](../../src/views/internal/design-system/CLAUDE.md).
2. Route from the Table/DataTable catalog entries to relevant accepted decisions,
   typed owners and current review. Use the smallest necessary context.
3. Read the current slice boundaries:
   [Portfolio/withdrawals](design-system-table-family-first-slice.md),
   [Exposure/Collateral](design-system-table-family-holdings-slice.md),
   [Discover](design-system-table-family-discover-slice.md), and
   [mobile cards](design-system-discover-mobile-cards.md).
4. Inspect production code and rendered states yourself. Existing reports and
   screenshots are discovery maps, not substitutes for this inspection. Record
   provisional observations before using earlier audit conclusions as evidence.

## Current review boundaries

- Portfolio positions/withdrawals, Holdings Exposure/Collateral and Discover
  browsing are lab candidates, not adopted production views. The user has guided
  many refinements; do not infer blanket acceptance from that history.
- Ordinary primary table content uses 16px; ordinary values use weight 300 and
  identity names 500. Dense-table typography is explicitly deferred until a real
  need is demonstrated. Canonical roles and accepted decisions remain the owners.
- Linked identity text does not gain a separate link treatment when it merely
  repeats whole-row navigation. Independent source/explorer/bridge actions remain
  distinct. Preserve accessible navigation, modified clicks and nested actions.
- Mobile Exposure/Collateral is an important product predecessor, not a mandate
  that every table become the same stacked row. Discover cards intentionally use
  a different composition, with one sort owner and exclusive table/card mounting.
- Mobile card design still needs human review. The current flat-card content
  inset is 24px total, with no added outer padded shell. Chart/ticker regions own
  their own edges. Their 2px beige surround and seams are **contrast-only lab
  framing**, explicitly not a saved container preference or product contract.
- Compact/full-chart card previews use the same recorded 30-day data, not the
  homepage's YTD series. Actual chart/ticker implementations are reused. Do not
  mistake a different data period for inadequate chart rendering.
- Portfolio header spacing remains a visual trial. Rich navigable records have
  not been fully reviewed. Transactions remain paused; no transaction redesign,
  governance expansion, production migration or foundation rewrite is requested.

## Prioritized investigation

### A. Existing families: omissions and mismatches

Check production-to-lab fidelity for the existing Portfolio, withdrawal,
Holdings and Discover families. Prioritize lost information, missing real states,
meaning-changing formatting, wrong navigation/action behavior, unavailable versus
zero, sorting/limits, loading continuity and responsive/keyboard regressions.
Identify where current tests or fixtures could give false confidence. Do not
re-run every historical full-sheet screenshot merely to accumulate passes.

Separate observed bugs from design preferences and explicit out-of-scope product
features. Give a concrete consequence for each gap and identify its owner: cell,
row composition, page context, data adapter, or transaction mechanism.

### B. Earn: evidence for the next bounded family

Prioritize `src/views/earn/views/index-dtf/`,
`src/views/earn/views/yield-dtf/` and their referenced shared Earn cells. Inspect
the vote-lock and staking position tables before proposing what belongs in the
lab: governance-token relationships, multiple governed assets, TVL/amount pairs,
wallet-dependent balances, APR/APY period/meaning and explanation, and row-to-drawer
navigation. Exercise the governed-assets disclosure and drawer opening through
mocked/local data where possible; do not execute transaction actions.

Determine what can reuse the existing family and what is genuinely distinct.
Earn DeFi pools may be sampled as a contrast (paired assets, protocol/chain,
base/reward APY), but avoid turning this review into an all-product audit. Broader
selector/editable/rebalance families need only a short ranked next-scope note.

## Evidence contract

For each consequential finding, provide source file/line references, route,
viewport/theme/state, expected versus observed behavior and the smallest useful
reproduction. Distinguish code inspection, live observation, mocked rendering,
inference and unverified claims. Screenshots alone do not prove hover, scroll,
keyboard or navigation behavior; record the action sequence and result.

Build a compact requirements-to-coverage matrix: production requirement → current
lab specimen/test or missing coverage → evidence reference → recommended owner.
Keep synthetic fixture assumptions explicit. An empty table is not evidence for
populated rows. Missing data must not become zero; incomplete fixtures must not
be reported as confirmed production defects.

Preserve enough evidence for a different implementer to inspect it directly:
focused screenshots, fixture payloads without private data, capture/reproduction
scripts and short source maps. A prose summary alone is insufficient. The next
implementer must re-open these sources and execute relevant cases before building.

## Execution and safety

- Work only in the detached review worktree. Do not edit, commit, push, switch,
  reset or clean the primary checkout or older research worktrees.
- Report and suggestions only. Do not change tracked app code, shared defaults,
  tokens, catalogs, instructions or existing tests to make the review pass.
  New review artifacts and temporary research harnesses are allowed only inside
  the output directory below. Keep them clearly separate from production source.
- Use pnpm and Node 20+. Local dependencies are supplied separately from git.
  No private `.env` is copied. Do not look for credentials or use a real wallet.
  Prefer the existing mock fixtures and browser test configuration.
- Use an owned unused port, initially **3047**; pass `DESIGN_SYSTEM_PORT=3047`
  for design-system browser tests. Never stop or reuse 3005 (user preview) or
  3043 (coordinator verification). If 3047 is occupied, choose a free port; do not
  kill its listener. Stop only the preview processes you start.
- A direct preview can use `VITE_E2E=true VITE_WALLETCONNECT_ID=test-project
  pnpm exec vite --host 127.0.0.1 --port 3047 --strictPort`. Existing Playwright
  fixtures are preferable when data/interaction verification needs mocks.
- Browser access may be Claude in Chrome or installed Playwright. Verify the
  actual source/state being rendered; do not silently fall back to the primary
  preview. Retain no environment contents/hashes, credentials or raw private logs.
- When a state cannot safely be rendered, exhaust reasonable local fixture/source
  alternatives, then state the limitation precisely. Do not invent results or
  block the whole review on an unavailable external service.

## Deliverables and stopping point

Write the main report to
`docs/plans/design-system-table-family-independent-review/report.md` and evidence,
matrix and scripts beside it. Do not scatter new reports across the repository.

Lead with a short, prioritized action list and Earn readiness recommendation.
For findings, distinguish confirmed defects, omissions, proposed design decisions
and blocked/unverified evidence. Include a brief list of claims you checked and
did not confirm. No quota of findings, false consensus or new enforcement system.

End with: exact snapshot SHA; inspected routes/states; tests run and outcomes;
unresolved limits; output paths; changed-file check; owned-server cleanup. Preserve
the snapshot's tracked tree unchanged and leave artifacts uncommitted. Work to
completion through unblocked read-only investigation; ask only when a missing
choice or new authority is truly required. Do not keep running merely to fill time.
