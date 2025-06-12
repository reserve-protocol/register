# Project Structure & Conventions

**Document Version:** 1.0
**Status:** Active

---

## 1. Directory Structure

This document provides a high-level overview of the `src/` directory to ensure new files are created in the correct location.

- **`/assets`**: Global static assets like images and fonts.
- **`/components`**:
  - **`/ui`**: Base, unstyled components from `shadcn/ui` (e.g., Button, Card).
  - **`/shared`**: Globally reusable composite components (e.g., `PageHeader`).
- **`/hooks`**: All custom React hooks. Hooks that interact with the blockchain are a priority here.
- **`/locales`**: Internationalization (i18n) files managed by LinguiJS.
- **`/state`**: All Jotai state definitions (atoms). Files are organized by feature domain (e.g., `bridge.ts`).
- **`/types`**: Global TypeScript type definitions and interfaces.
- **`/utils`**: Pure helper functions that are not tied to React state or components (e.g., formatting, constants).
- **`/views`**: Top-level page components that correspond to routes. This is where most feature-specific logic and component composition occurs.

## 2. Naming Conventions

To maintain consistency across the codebase, the following naming convention is **mandatory**:

- **`kebab-case` for all files and directories.**

**✔ Do:**

- `src/hooks/use-token-balance.ts`
- `src/views/index-dtf/dtf-details/`
- `my-new-component.tsx`

**❌ Don't:**

- `useTokenBalance.ts` (camelCase)
- `DtfDetails/` (PascalCase)
- `my_new_component.tsx` (snake_case)
