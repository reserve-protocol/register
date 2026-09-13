# State-led Auction list

Current candidate: [contract](../../design-system-auctions-composition-refinement.md#state-led-list-revision--september-12).
Route: `/internal/design-system/components/table#auctions-browse-review`.
Human visual acceptance remains pending; no production adoption is implied.

The title/status header wraps naturally. The round number is separate, with
access or the approved `Ends in` timer beneath. Historical results use the same
14px/20px inline label/value pattern as Governance evidence and transaction
details; weight and color carry hierarchy. Price prerequisites retain the full
warning, not a closed-looking pill. History-only mode omits the empty active group.

## Verification

- Focused units: 53/53 (record, display model, catalog).
- Browser: 24/24, one worker, zero retries, skips or flaky cases. Two retained
  rich-record smoke cases plus 22 source-guarded regression cases.
- App and E2E typecheck, scoped oxlint and Prettier pass.
- `record.json` binds the single browser source digest, relevant source-file
  hashes and 30 ordinary-viewport captures. Files are named by theme, viewport
  and state; the two `ongoing-320` captures exercise the narrow pressure case.
- Final screenshots inspected: light 1400 restricted-repeat and history-only;
  light 390 restricted-repeat and permissionless; light 320 ongoing; dark 1400
  price-unavailable; dark 390 price-unavailable and long-history-unavailable.

RED evidence preceded implementation: the status was absent from the title
header; rendered values were 16px instead of the specified 14px; history-only
mode retained an empty active section. Iteration also caught a 320px timing
overflow and a loading value inheriting larger typography (32px row growth).
The old below-title/16px-gap assertion was replaced by same-line alignment or
8px wrapped separation. The final full run passes all continuity checks.

Reproduction uses the existing strict offline boundaries and an owned 3047
preview with a separate cache. Node 24.19.0; installed pnpm 11.19.0 with dependency
bootstrap disabled. Preview environment matches `playwright.design-system.config.ts`.

```sh
DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3047 pnpm exec playwright test --config=playwright.design-system.config.ts --project=design-system-review --project=design-system-desktop --project=design-system-mobile auctions-browse-lab-regressions.spec.ts auctions-composition-lab-regressions.spec.ts auctions-launcher-lab-regressions.spec.ts auctions-repeat-lab-regressions.spec.ts auctions-record-links-lab-regressions.spec.ts table-row-links-lab-regressions.spec.ts lab.spec.ts --grep 'auction|table row links|source-grounded rich record' --max-failures=1
pnpm exec vitest run src/views/internal/design-system/auctions-browse/tests src/views/internal/design-system/tests/component-catalog.test.ts --maxWorkers=1
pnpm typecheck
```

Low-profile Intent/correctness/product self-review. The scope tool's medium hint
is size-only across the accumulated dirty tree and historical evidence, not a
wider radius for this bounded iteration. No shared defaults, tokens, protocol
behavior, transactions, production source, dependency installs or commits changed.
Full repository gates and CI were not run. Existing live adapter/permission/
completion engineering-review boundaries remain in the transfer brief.
The owned 3047 preview is stopped; the user's 3005 preview was left running.
User-tab inventory timed out; these captures verify the isolated current-source
surface, not the state of the user's existing mounted browser tab.
