# Transactions Workbench evidence

## Scope

- Isolated Workbench module: `src/views/internal/design-system/documentation-transaction-workbench.tsx`
- Family model: `src/views/internal/design-system/documentation-transactions/model.ts`
- Pure shared navigation descriptors: `src/views/internal/design-system/documentation-transactions/navigation.ts`
- Focused test: `src/views/internal/design-system/tests/documentation-transaction-workbench.test.tsx`
- Exact-owner seam: `StakeProductContext` received only an `export` keyword in `transaction-composition-stake.tsx`; its implementation, defaults, and behavior are unchanged.

## Contract preserved

- The page is visibly `Workbench · Exploring · Paused`; it does not present transaction fixtures as accepted or canonical product guidance.
- Five scrollable sections render in the required order: Zapper, Automated issuance, Stake, Vote lock, Manual issuance.
- Every family declares its own Operation, Step, State, exact owner, state order, and namespaced query state.
- Operation, Step, and State use the same canonical compact Select control grammar as the Tables documentation.
- Operation, Step, State, Previous, Next, reset, audit, and direct-state links target the owning family hash.
- Previous/Next traverses only the selected operation and uses 44px minimum controls.
- `view=all` is opt-in and shows an ordered audit index while keeping one large current specimen mounted per family.
- Existing family owners render the selected state. No wallet, RPC, SDK, or product mutation hooks were added.
- Manual issuance resets its reducer per selected fixture state while retaining its existing remembered amount/unlimited contract.

## Verification

Run on 2026-09-17:

```text
pnpm exec vitest run src/views/internal/design-system/tests/documentation-pattern-tables.test.tsx src/views/internal/design-system/tests/documentation-transaction-workbench.test.tsx
PASS — 2 files, 11 tests

pnpm exec vitest run src/views/internal/design-system/tests/documentation-transaction-workbench.test.tsx src/views/internal/design-system/tests/documentation-workbench.test.tsx src/views/internal/design-system/tests/documentation-presentation.test.ts
PASS — 3 files, 21 tests

pnpm exec tsc --noEmit --pretty false
PASS

pnpm exec oxlint src/views/internal/design-system/documentation-pattern-tables.tsx src/views/internal/design-system/documentation-transaction-workbench.tsx src/views/internal/design-system/documentation-transactions/model.ts src/views/internal/design-system/tests/documentation-pattern-tables.test.tsx src/views/internal/design-system/tests/documentation-transaction-workbench.test.tsx src/views/internal/design-system/transaction-composition-stake.tsx
PASS — no findings

pnpm exec prettier --write [owned files]
PASS — formatted

node docs/plans/design-system-documentation-complete-pass/evidence/transactions/visual-check.mjs
PASS — 1400px light/dark, 390px light/dark, and 320px control containment
PASS — five ordered families and five current specimens; no default audit indexes
PASS — no page or control overflow; no browser console or page errors
```

The transaction explorer is mounted immediately after the Workbench page header. Sidebar/mobile navigation now exposes the Workbench root and all five family anchors; the pattern and paused-activity routes converge on `#transaction-workbench`.

## Integrated visual matrix

Captured after integration on 2026-09-17:

- 1400px light and dark
- 390px light and dark
- 320px control-bar containment
- one isolated capture for every family at desktop and phone widths
- five exact owners present in their declared order
- default view keeps all audit indexes unmounted
- no browser console errors or page errors

The focused tests additionally cover direct namespaced family selection,
Previous/Next boundaries with family-hash retention, and opt-in `view=all`
without additional large owner mounts. Captures are stored in `captures/` and
the durable replay script is `visual-check.mjs`.

Some repository-wide Vitest imports still initialize the product Reown
configuration and log its offline fallback; that pre-existing test-process
behavior is outside the standalone entry. The final standalone browser matrix
proved the documentation build makes no wallet/provider calls, external
requests, or WebSocket connections across its desktop and mobile routes. The
Transaction Workbench visual matrix also completed without a visible failure,
console error, or page error.
