# Migration Plan: Technical Debt Payoff

Branch: `feature/remove-themeui`

This document tracks our incremental migration from legacy patterns to modern stack. Each phase builds on the previous, reducing friction for subsequent changes.

---

## Current State (Jan 2025)

### Stack Health

| Area | Status | Details |
|------|--------|---------|
| TypeScript | ✅ Solid | Strict mode, clean typecheck |
| React Query | ✅ Migrated | SWR removed, wrapper with compatible interface |
| Vitest | ✅ Set up | 20 tests, ~1s run time |
| Tailwind | ⚠️ v3.4 | v4 available (breaking changes) |
| theme-ui | ❌ Legacy | 284 files still importing |
| shadcn/ui | ✅ Partial | New components use it, old don't |

### Dependency Cleanup Done

- [x] Removed `swr` (replaced with React Query)
- [x] Removed `@emotion/react` (replaced with Tailwind animations)
- [x] Removed `@types/jest` (using vitest/globals)
- [x] Removed duplicate `setupTests.ts`

### Files by Area

| Location | theme-ui imports | Priority |
|----------|-----------------|----------|
| `components/old/*` | 34 files | Low (replace entirely) |
| `components/*` (non-old) | 59 files | Medium |
| `views/yield-dtf/*` | 150+ files | High (active feature) |
| `views/home/*` | 6 files | Medium |
| `views/explorer/*` | 12 files | Medium |
| `views/discover/*` | 10 files | Low |

---

## Phase 1: Testing Foundation (Current)

**Goal**: Solid test coverage for core logic before UI changes.

### Completed

- [x] Vitest + jsdom configured
- [x] Test utilities with providers (`test-utils.tsx`)
- [x] `useQuery` hook tests (6 tests)
- [x] `useDebounce` hook tests (5 tests)
- [x] `useTimeRemaining` hook tests (9 tests)

### Next: Critical Hook Tests

Priority hooks to test (pure logic, high usage):

```
src/hooks/
├── useTokensAllowance.ts    # Approval logic
├── useHasAllowance.ts       # Approval checks
├── useApproveAndExecute.ts  # Transaction flow
├── useContractWrite.ts      # Write transactions
├── useERC20Balance.ts       # Balance fetching
└── useGasEstimate.ts        # Gas calculations
```

### Test Strategy

1. **Utility hooks** - Pure logic, easy to test
2. **Data hooks** - Mock blockchain calls, test transformations
3. **Transaction hooks** - Test state machine (pending → success/error)

---

## Phase 2: Tailwind v4 Upgrade

**Goal**: Upgrade Tailwind before migrating theme-ui (use latest features).

### Breaking Changes in v4

1. **Config format** - `tailwind.config.ts` → `@tailwind` directives in CSS
2. **Color system** - `bg-red-500` → `bg-red-500` (same, but internals changed)
3. **Plugin API** - `tailwindcss-animate` needs v4-compatible version
4. **PostCSS** - New `@tailwindcss/postcss` plugin

### Migration Steps

1. [ ] Read [Tailwind v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide)
2. [ ] Check `tailwindcss-animate` v4 compatibility
3. [ ] Update `postcss.config.js`
4. [ ] Migrate `tailwind.config.ts` to CSS-based config
5. [ ] Run build, fix any breaking styles
6. [ ] Update shadcn components if needed

### Rollback Plan

Keep branch, test thoroughly before merging. v3 → v4 is a major change.

---

## Phase 3: shadcn/ui Component Refresh

**Goal**: Update shadcn components to latest, ensure Tailwind v4 compatibility.

### Current shadcn Components

```
src/components/ui/
├── accordion.tsx
├── alert.tsx
├── avatar.tsx
├── badge.tsx
├── button.tsx
├── card.tsx
├── checkbox.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── input.tsx
├── label.tsx
├── popover.tsx
├── scroll-area.tsx
├── select.tsx
├── separator.tsx
├── skeleton.tsx
├── slider.tsx
├── switch.tsx
├── table.tsx
├── tabs.tsx
├── textarea.tsx
├── toggle.tsx
├── toggle-group.tsx
└── tooltip.tsx
```

### Steps

1. [ ] Check shadcn CLI version
2. [ ] Run `npx shadcn@latest diff` to see changes
3. [ ] Update components one by one
4. [ ] Test each component in isolation

---

## Phase 4: theme-ui Migration Strategy

**Goal**: Remove 284 theme-ui imports incrementally.

### Approach: Bottom-Up

1. **Start with `components/old/*`** (34 files)
   - These are already marked as legacy
   - Many are small, self-contained
   - Replace with shadcn equivalents or delete

2. **Migrate shared components** (59 files)
   - Higher impact, more careful migration
   - Create Tailwind versions alongside
   - Swap imports gradually

3. **Migrate views** (150+ files)
   - Feature by feature
   - Test each view after migration

### Common Patterns to Replace

| theme-ui | Tailwind/shadcn |
|----------|-----------------|
| `<Box>` | `<div className="...">` |
| `<Text>` | `<span>` or `<p>` |
| `<Flex>` | `<div className="flex">` |
| `sx={{ ... }}` | `className="..."` |
| `variant="..."` | Custom component or utility classes |

### Migration Script Idea

```typescript
// Could create a codemod for simple Box → div conversions
// But manual review is safer for complex sx props
```

---

## Phase 5: Final Cleanup

**Goal**: Remove theme-ui entirely.

### Steps

1. [ ] Delete `src/theme.ts` (661 lines)
2. [ ] Remove `theme-ui` from package.json
3. [ ] Remove ThemeProvider from app
4. [ ] Clean up any remaining `sx` props
5. [ ] Verify all styles work

### Expected Bundle Reduction

- `theme-ui`: ~50KB gzipped
- `@emotion/react`: ~11KB gzipped (already removed)
- Total savings: ~60KB+ gzipped

---

## Testing Checklist (Per Phase)

Before merging any phase:

- [ ] `npm run typecheck` passes
- [ ] `npm run test:run` passes
- [ ] `npm run build` succeeds
- [ ] Manual smoke test on Base network
- [ ] Key flows work:
  - [ ] Connect wallet
  - [ ] View DTF details
  - [ ] Mint/Redeem (if applicable)
  - [ ] Governance voting (if applicable)

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Jan 2025 | Use React Query wrapper with SWR interface | Minimize consumer changes during migration |
| Jan 2025 | Vitest over Jest | Faster, native ESM, Vite integration |
| Jan 2025 | jsdom over happy-dom | Better React Testing Library support |
| Jan 2025 | Replace @emotion with Tailwind animations | Eliminate dependency, Tailwind already in use |
| Jan 2025 | Bottom-up theme-ui migration | Start with isolated components, reduce risk |

---

## Commands Reference

```bash
# Development
npm run start           # Dev server
npm run typecheck       # Type validation
npm run typecheck:watch # Continuous type checking
npm run test            # Watch mode tests
npm run test:run        # Single run tests

# Build & Deploy
npm run build           # Full production build
npm run build:no-seo    # Build without SEO pages
npm run analyze         # Bundle analysis
```

---

## Notes

- **Don't rush**: Each phase should be stable before moving to next
- **Test visually**: UI changes need manual verification
- **Keep commits atomic**: One logical change per commit
- **Document decisions**: Update this file as we learn

---

*Last updated: January 2025*
