# Navigation documentation module evidence

Date: 2026-09-17

## Scope

- New isolated module: `src/views/internal/design-system/documentation-pattern-navigation.tsx`
- Focused contract: `src/views/internal/design-system/tests/documentation-pattern-navigation.test.tsx`
- Integration export: default `NavigationPatternDocumentation`
- Optional section metadata export: `NAVIGATION_DOCUMENTATION_SECTIONS`

The module presents the complete Global system first, the complete Product system second, and destination/anatomy details last. Desktop and constrained presentations use separate shared canvases so their real state models remain clear rather than being flattened into one universal flow.

## Authority and precedent

- Global and Product Navigation remain separate accepted, unadopted baselines.
- The module renders `GlobalNavigation`, `GlobalNavigationMenu`, `MobileGlobalHeader`, `MobileUtilityPanel`, `ProductNavigation`, and the accepted identity/item owners with the source-grounded fixture inventory.
- The Global host is cropped to navigation only. The Product rail uses a labelled neutral blank two-column host. No chart, financial page body, Index details panel, Trade CTA, or other fabricated application content is present.
- The canonical component-owned dividers remain unchanged.

## RED and GREEN

- RED: the focused suite failed because the isolated module did not exist.
- GREEN: 5/5 focused tests passed, covering ordering and anchors, real owner reuse, neutral hosts, absence of fabricated body content, explicit deep states, semantic query fallback, and local-only specimen theme interaction.
- Application and E2E TypeScript passed after implementation.
- Focused lint and `git diff --check` passed.

## State access

- Global desktop: resting/More-open and Connect/Account.
- Global constrained: resting/destinations/utilities and Connect/Account.
- Product desktop: collapsed/expanded/switcher and explicit DTF identity.
- Product constrained: resting/pages/switcher and explicit DTF identity.
- All query keys are namespaced to their specimen. Reset and direct state links use the shared canvas contract.

## Pending integrated render matrix

The coordinator owns shared Patterns integration. The required 1400/390 light/dark and targeted 320 captures must be produced after the module is wired into the real standalone route; no temporary substitute route is claimed as final evidence.

## Caveats

- The accepted navigation fixture/logo import graph initializes existing app-level Reown configuration during the focused Vitest run. The remote configuration request failed offline and used its existing fallback; tests remained green. The integrated standalone provider/network request probe must determine whether the documentation entry needs a provider-safe fixture projection before closeout.
- Theme state inside the constrained utility specimen is intentionally local. The focused test starts with the documentation root in dark mode, selects Light inside the specimen, and proves the documentation root remains dark.
- Production navigation owners, defaults, route taxonomy, analytics, account behavior, and adoption remain unchanged.
