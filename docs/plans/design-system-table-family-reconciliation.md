# Table-family independent review reconciliation

## Bounded contract — 2026-09-11

- Fixed point: `01a900cdf2589d455d04f78806d2ca8ff2b9122c`. Existing uncommitted
  Earn work is retained input, not part of these two fixes.
- Medium, lab-only correctness pass. No production consumers, shared component
  defaults, tokens, wallet actions, commits or design acceptance change.
- Reproduce Holdings' ascending-first header bug and Discover's `30D` versus
  `(1M)` card label mismatch at their mounted seams before implementation.
- Holdings headers must start a newly selected field descending, toggle the
  current field, and restore descending Weight on a tab reset. Other families
  retain ascending-first headers. The mobile menu has separate field/direction
  controls: preserve its explicit direction and the shared table state on resize.
- Preserve Discover's visible `(1M)`; use the same period for its accessible
  value and tooltip. Desktop `Last 30 Days` remains unchanged.
- Evidence: focused RED/GREEN unit tests, browser order assertions on the full
  18-row CMC20 fixture, source behavior checks, phone/desktop light/dark checks,
  affected-family regressions, types/lint, documentation lint.
- Record adoption contracts and unresolved coverage without implementing
  production fixes or inventing error copy. Human review remains next for Earn
  composition and the mobile Discover card trials.

## Independent input

Claude's report-only package is retained in the separate
`register-claude-table-review-2026-09-11` worktree under
`docs/plans/design-system-table-family-independent-review/`. It inspected the
fixed point, before the current Earn candidate. This reconciliation records
dispositions; that package's passing counts are not verification of our newer
tree. Its source captures use offline fixtures, not live financial data.

## Dispositions

The two implementation fixes and continuity checks are verified. Findings are reconciled against
the named source owners below; unresolved product choices are not lab authority.

| Finding                                                                                     | Disposition / owning follow-up                                                                                                                                                         |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1, F1: Holdings first direction and weak assertion                                         | Confirmed/fixed; actual direction and leader/laggard order pinned at the mounted table and source seams.                                                                               |
| A2, D8: Discover card period                                                                | Confirmed/fixed; accessible period and tooltip now match retained visible `(1M)`.                                                                                                      |
| B1–B4: sorting, missingness and keyboard differences                                        | Confirmed; adoption contracts below, not permission to migrate.                                                                                                                        |
| B5–B10, C7: copy, retained source, zero/missing, period, breakpoint and page differences    | Retain scoped lab choices; product copy/localization, pagination, chart range and page context remain adoption-owned.                                                                  |
| B11, C4, F2: count-dependent automatic name comparator                                      | Confirmed in installed TanStack; require explicit comparator and >10-row mixed-case/numeric-name fixture before Discover adoption. Not fixed by the two defects above.                 |
| C1/E4: impersonated withdrawals                                                             | Confirmed source path and independent rendered evidence; engineer review required. No transaction was attempted.                                                                       |
| C2/F3: token and chain variety                                                              | New Earn fixtures include SQUILL and long vault names; withdrawal token/chain coverage remains incomplete.                                                                             |
| C3/F4: near-zero display/sign                                                               | Confirmed missing boundary fixture; adapter must supply display-consistent sign/precision. Shared financial typography is not changed here.                                            |
| C5/F5: Portfolio page loading                                                               | Confirmed; section skeletons do not prove the production page gate.                                                                                                                    |
| C6/E3: Discover loading placeholder                                                         | Confirmed production-only mismatch; adoption must replace/integrate the correct loaded anatomy.                                                                                        |
| C8: Earn request error                                                                      | Source inference, not live-verified; explicit failure/recovery and approved copy still needed. Missing values are not request failure.                                                 |
| D1: Earn highest-first on every new field                                                   | Not source parity: production Earn uses ascending-first headers, despite initial rate-descending order. Retain current behavior pending a deliberate design choice.                    |
| D2–D7: inactive dimming, minus sign, mobile unit, section icons, withdrawal hover/readiness | Human judgment items, not confirmed lab defects; preserve current scoped treatments.                                                                                                   |
| D9/E5–E7: Earn drawer access and narrow information                                         | Current candidate proposes native keyboard entry/return focus and retains TVL/wallet facts on phone. Automated proof is separate from human acceptance; real drawers remain unchanged. |
| E1/E2/E8                                                                                    | Same adoption requirements as B1–B3, not separate lab fixes.                                                                                                                           |
| F6, G: historical receipts and uncertain source Escape                                      | Keep receipt snapshot boundaries and source hover-card uncertainty explicit; current candidate's governed disclosure has separate keyboard evidence.                                   |

## Production-adoption contracts

| Owner                                  | Required behavior and acceptance evidence                                                                                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portfolio data adapter / preview limit | Sort eligible complete rows before limiting; expansion appends without reordering the visible prefix. Include an API-tail position larger than a previewed one.                                         |
| Balance comparator                     | Preserve Amount/bigint through derivation; use a comparable numeric key with consistent units, never API display strings. Exercise decimal fractions and 5/11+ rows.                                    |
| Missing metrics                        | Preserve unknown separately from zero, including ascending/descending order; missing values stay last. Discover's normalization currently destroys that distinction for sorting.                        |
| Row/action adapter                     | Native link for navigation, native button for drawer entry; nested controls remain independent. Prove keyboard activation, Escape and return focus in the real destination.                             |
| Portfolio page/viewer context          | Distinguish connected account from viewed account before enabling withdrawal; review endId/lock identity and transaction ownership. Engineer review required before adoption.                           |
| Loading/error integration              | Test page blank → skeleton → partial/full and request failure → recovery. Lab section loading is composition evidence only, not proof of page integration.                                              |
| Precision/formatting                   | Test tiny positive/negative amounts around the displayed-zero threshold; do not infer color/sign from a hidden unrounded value without an explicit product contract.                                    |
| Product copy and availability          | Preserve source strings unless specifically approved; localize accepted withdrawal strings. Carry chart period, deprecated filtering, pagination and wallet availability at the product-owned boundary. |

Source owners: Portfolio `dtf-positions.tsx`, `pending-withdrawals.tsx` and
`expand-toggle.tsx`; shared `src/components/ui/data-table.tsx`; Discover
`src/hooks/useIndexDTFList.ts`; Holdings `basket-overview/index.tsx`; Earn
`vote-lock-positions.tsx` and `staking-positions.tsx`. The family briefs retain
their full transfer inventories; this note adds the independent-review deltas.

## Verification and next review

Fresh two-file RED run: 2 failures / 9 passes. Holdings expected descending but
received ascending; Discover expected `1M performance` but received `30D
performance`. After the fixes the four affected family suites passed 29/29;
the wider nine-file family/catalog/shared-owner set passed 72/72.

The [combined browser receipt](design-system-table-family-evidence/reconciliation-2026-09-11/regression/record.json)
records 46/46 passes without retries: Discover cards 8, Discover rows 3, Earn 15,
Holdings 7, Holdings source 3, Portfolio hardening 2 and Portfolio rows 8.
The parent inspected retained light/dark descending Holdings and phone Discover
default/missing-state captures. Remote marks use offline fallbacks; captures do
not prove brand imagery or live financial values.

Independent Intent and Engineering Risk reviews found no Critical/Important
issue. Both identified one missing explicit mobile-ascending field/resize test;
that test was added without further application changes. The [final continuity
receipt](design-system-table-family-evidence/reconciliation-2026-09-11/continuity/record.json)
records 2/2 passes, no retries, at 390 → 767/768 → 390px in both themes,
including actual order, direction metadata and focus. Its two screenshots were
inspected. Tests added after the first run change the public test/source digest;
the first run is not presented as the final test snapshot.

The first continuity attempt timed out reopening the menu before its previous
dismissal completed. The test now waits for the closed popup to unmount, then
for the reopened popup to be visible; no sleeps or application changes. That
diagnostic run was interrupted, and a subsequent launch briefly encountered its
still-closing owned server. Neither run is counted as a pass. The final isolated
run above completed normally and released port 3043; user preview 3005 was untouched.

Fresh `pnpm typecheck`, scoped oxlint and changed-code Prettier passed; final E2E
types also passed after the test-only correction. Documentation lint, relative
links, retained image hashes and diff whitespace were checked. The full repository
gate and CI were not run: this is the V1 bounded lab cadence, not an integration
boundary. A default scope invocation aborted at pnpm's dependency-purge guard;
no purge/install was allowed. Successful direct commands used the existing
Node 20 runtime and `pnpm_config_verify_deps_before_run=false`. Warnings included
existing Tailwind duration ambiguity, deprecated React/Jotai APIs and blocked
optional remote configuration; no failed tests or unhandled-error result was
suppressed. Scope dry-run found no red flags or unmapped code. Area guides were
read and remain current; no workflow-kit change was justified.

Reproduction: use `pnpm exec vitest run` on the family/catalog/shared-owner files
listed in the preceding Earn receipt; the added tests raise 70 to 72. Browser
command is `DESIGN_SYSTEM_PORT=3043 pnpm exec playwright test
--config=playwright.design-system.config.ts --project=design-system-review`
followed by each receipt's distinct `cases[].file` entries under `e2e/design-system/`.
Read the area guide before starting a server; never reuse or stop the user's preview.

Next: human visual review of Earn desktop/phone with and without wallet facts,
then mobile Discover compact/full charts. Request-error copy/recovery, near-zero
fixtures, non-RSR withdrawal fixtures and automatic name comparator coverage
remain explicit open work, not silently marked complete. No production change,
new shared default, transaction execution, commit or push occurred.
