# Design-system documentation and lab

This area renders the internal design-system library. For current usage and
authority, start at `docs/wiki/domains/design-system.md`, then find the target in
`foundation-catalog.ts` or `component-catalog*.ts`.

## Source boundaries

- `documentation-presentation.ts` owns human navigation and presentation order.
- Foundation and component catalogs own status, relationships, implementation
  pointers, and adoption state.
- The `implementationSource` named by a catalog entry owns reusable behavior.
- `docs/wiki/decisions.md` owns accepted rationale.
- `current-review.ts` contains only an active internal review target; it is not a
  backlog or a consumer API.
- Specimens, state sheets, fixtures, and documentation hosts are presentation or
  verification surfaces. Never copy them into product as implementations.

Rendered output, design acceptance, reusable implementation, verification, and
production adoption are independent. Keep their labels truthful.

## Consuming the system

Use the canonical implementation directly and preserve its defaults. Product
compositions own width, placement, copy, data, mechanics, and domain-specific
states. Do not change shared defaults, tokens, product behavior, or transaction
truth merely to make a specimen easier to compose.

Use semantic roles from
`src/components/design-system-v1/semantic-roles.ts`, typography roles from its
sibling `typography.ts`, and layout relationships from
`src/components/ui/v1-layout-recipes.ts`. Equal pixel values do not make two
roles interchangeable.

Navigation, Tables, and Charts have bounded pattern owners named by the catalog;
none defines a universal page, row, or chart API. Transactions remain an
exploratory paused reference and do not authorize a universal flow controller or
production migration.

## Documentation presentation

Show supported variants and important states in the overview. Detail pages are
for deeper guidance, examples, and do/don't material—not for hiding the basic
system.

Lab controls and canvases must be visibly separate from the component or pattern
being judged. Canvas color is presentation context, not an implementation rule.
Use realistic bounded widths; do not stretch every specimen to fill newly
available documentation space.

Do not fabricate product content to make a navigation or layout host look real.
Use neutral structural regions when the surrounding product composition is not
accepted.

## Verification

Use `e2e/TEST_MAP.md` to find behavioral coverage. Generated screenshots,
measurements, and browser reports belong under ignored `test-results/` or CI
artifacts and must never be committed as documentation.

`pnpm design-system:review` owns an isolated local server. Do not reuse or stop a
developer's preview process. Pair focused tests with `pnpm typecheck` and
`pnpm design-system:docs:build` for a consumer-facing handoff.
