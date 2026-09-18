# Position / withdrawal hardening checkpoint — 2026-09-09

Implementation verified for the bounded lab candidate. **Not production
adoption or blanket visual acceptance.** The 16px desktop header-bottom spacing
remains a trial by user direction. No new human review is needed just to begin
the next bounded preparation; shared API adoption still requires engineer review.

## Current result

- Sort all eligible records before showing the first five. Show all appends
  the remainder without moving existing rows; production is unchanged.
- One table-owned sorting state serves desktop headers and the narrow menu.
  Sorting stays usable while loading. Below 640px, an otherwise hidden selected
  metric appears as a labeled supporting fact; other supporting metrics remain
  hidden until the intermediate layout.
- Keyboard focus follows the active sort, identity, source action and withdrawal
  feedback across desktop/stacked projections. An open menu closes to the active
  desktop sort when widened. Focus deliberately moved or blurred away stays away.
- Preserve the reviewed hierarchy: 16px/300 financial peers, 16px/500 names,
  14px/300 supporting text; 12px mark/copy gap for 32px identities; compact,
  content-width Withdraw; one lifecycle/action region, not duplicate Ready/actions.
- Desktop rows use 16px vertical padding, collapsed divided records use 24px,
  matching their horizontal inset. Desktop headers remain divider-free;
  collapsed records have a sorting control rather than misleading column labels.

The optional DataTable toolbar and post-sort row limit keep existing defaults.
No production callers, pricing, SDK, wallet or transaction preparation changed.

## Fresh proof

[Record and image hashes](checkpoint-2026-09-09/record.json) retain 10 first-run
passing browser cases and 17 attached screenshots under one public-source digest:
six table cases at 320/375/1400px in both themes, two hardening journeys and two
Retina-emulation badge checks. Desktop cases also cross 639/640/1023/1024px and
the explicit constrained preview. Nothing is serialized from private environment
configuration, including its fingerprints. Older records and hashes are untouched.

Commands run from the repository root:

```sh
DESIGN_SYSTEM_PORT=3042 pnpm exec playwright test e2e/design-system/table-family-lab-regressions.spec.ts e2e/design-system/table-family-hardening-lab-regressions.spec.ts --config=playwright.design-system.config.ts --project=design-system-review
pnpm exec vitest run src/views/internal/design-system/tests/table-family.test.tsx src/components/ui/tests/data-table.test.tsx src/components/design-system-v1/tests/source-hygiene.test.ts
pnpm exec tsc --noEmit
pnpm exec tsc -p e2e/tsconfig.json --noEmit
```

Mounted tests: 22/22 passed. App/E2E types and scoped oxlint/Prettier passed.
The final sequential `node scripts/llm-workflow/scope.mjs --base adef9ee76 --gate`
also passed: `pnpm typecheck + pnpm lint + pnpm test:run`, 1190/1190 tests.
The sandboxed run could not observe a native file watcher; the unrestricted run
verified that seam. A concurrent full-suite/browser run timed out on an unchanged
transaction test; the unchanged sequential rerun passed with no timeout changes.
Wiki lint and 183 relative documentation links/anchors passed; all 33 historical
and current retained image hashes match their records.

Independent scoped review found a stale remembered-focus path: explicitly blur
a desktop sort, resize, and focus was incorrectly pulled into the mobile menu.
The added browser assertion failed before the fix and passed after it. The hook
now clears deliberate blur while retaining focus hidden by a projection change.
The expansion test also failed before full-list sorting was applied. A loading
menu test was corrected to wait for close/return focus before reopening by
keyboard; its prior immediate second click raced menu dismissal.

## Selected visual checks

Inspected these fresh captures for the actual relationships, not just overflow:

- Desktop positions *(capture generated locally; not tracked)*
- Constrained withdrawals *(capture generated locally; not tracked)*
- Constrained Yield *(capture generated locally; not tracked)*
- Phone withdrawals, dark *(capture generated locally; not tracked)*
- Loading, phone *(capture generated locally; not tracked)*
- Long content, 320px *(capture generated locally; not tracked)*
- Otherwise hidden sort metric, dark phone *(capture generated locally; not tracked)*

Some remote marks resolve to canonical fallbacks. Brand-image correctness is
not approved by these captures. The narrow lab navigation chrome still crowds
at 320px; it is outside the table-row candidate. No physical touch device or
screen-reader session was performed. Measurements and fixtures do not prove
live finances, actual wallet gating, on-chain execution or receipt reconciliation.

## Next boundary

The next boundary at this checkpoint was
[Exposure / Collateral](../design-system-table-family-holdings-slice.md). That
candidate and its direct sorting, tab-reset, bridge-detail focus and
>10-row/exchange checks are now implemented; its own brief owns the later proof.
[Discover browsing cells](../design-system-table-family-discover-slice.md) is the
subsequent bounded expansion. The old rich-record study stays unreviewed;
neither it nor production adoption is covered by this checkpoint.
