# Tables documentation module evidence

Status: focused implementation verified; integrated render matrix pending shared
Patterns-page wiring.

## Returned slice

- Export: `DocumentationPatternTables`
- Module: `src/views/internal/design-system/documentation-pattern-tables.tsx`
- Focused test: `src/views/internal/design-system/tests/documentation-pattern-tables.test.tsx`
- Ordered anchors: current rebalances, historical rebalances, Portfolio,
  Holdings, Discover, Earn/DeFi/owned positions, Governance.
- The accepted ready current table is the default. Current and historical
  rebalance owners are mounted independently. The deferred auction workspace is
  not imported or rendered.
- Controls use section-scoped semantic query keys and preserve the legacy
  `current=` scenario alias when no namespaced current-state key is present.

## Fresh verification

- RED: focused Vitest failed because the documentation module did not exist.
- GREEN: focused Vitest passed 4/4 assertions for order/anchors, default and
  current/history separation, namespaced and retained query state, exact owner
  reuse, and deferred-workspace exclusion.
- Scoped Oxlint passed for the Tables module/test and the adjacent observer
  repair files.
- Full TypeScript was attempted but temporarily blocked by the independently
  owned, not-yet-returned `documentation-pattern-navigation.tsx` import in
  `documentation-pattern-navigation.test.tsx`; no Tables diagnostic was emitted.

## Pending integration evidence

The shared Patterns overview is outside this slice's ownership. After the
convergence owner wires the export, capture and inspect 1400px and 390px in both
themes plus the 320px dense-control case on an isolated port. Provider-free
standalone runtime evidence must be included in that integrated pass.
