# Register Codex Context

Purpose: repo-local working context for Codex on Register.

This file is a corrected Codex port of the local and global Claude guidance, based on the current codebase rather than idealized rules.

## Product Context

- Register is the frontend for Reserve Protocol.
- Two product families exist in the repo:
  - Index DTFs: primary active product area.
  - Yield DTFs: legacy but still supported.
- Current chain reality in code is Ethereum, Base, and BSC, with some legacy Arbitrum references still present.
- Do not assume docs about supported chains are current without checking code.

## Actual Stack

- React 18
- Vite
- TypeScript
- Jotai
- TanStack Query
- wagmi + viem + RainbowKit
- TailwindCSS
- React Router `7.0.1`

## Important Corrections To Old CLAUDE Guidance

- The local `CLAUDE.md` says React Router v6. The repo currently uses React Router 7 APIs and package version `7.0.1`.
- The local `CLAUDE.md` says networks are Ethereum and Base. The repo still contains BSC support and some legacy Arbitrum paths.
- The architecture docs say kebab-case is mandatory for all files. That is not true in the existing repo. There is mixed casing, especially in older Yield DTF areas. Preserve local conventions within the area you touch.
- The idealized rule "never use useEffect to sync atoms" does not match the repo. Register uses updater components heavily, and they often fetch data then push it into atoms inside `useEffect`.

## How Luis Actually Codes In This Repo

- Pragmatic over pure.
- Reuses repo patterns instead of forcing theoretical cleanliness.
- Accepts some duplication when it keeps changes explicit and easy to audit.
- Uses updater components that return `null` for syncing fetched data into atoms.
- Uses direct `fetch` or `graphql-request` inside query functions rather than wrapping everything in a shared API client.
- Keeps feature logic close to the feature:
  - shared hooks/components when clearly reusable
  - feature-local hooks/components/atoms when the logic is specific
- Favors readable JSX and direct conditionals over indirection.

## Preferred Patterns Here

### State

- Small Jotai atoms.
- Derived atoms for computed state.
- Updater components for synchronizing async data into atoms.
- Reset atoms when leaving or switching feature context.

### Data

- React Query for async API/subgraph fetches.
- wagmi hooks for on-chain reads/writes.
- `graphql-request` for subgraphs.
- Poll only when the product flow needs it.

### Components

- Prefer direct feature composition.
- Early return for missing data/loading cases when appropriate.
- Keep display components dumb where possible.
- It is acceptable for containers and orchestrators to be larger if they are mostly wiring code.

### Naming

- For new files in modern Index DTF areas, prefer existing local conventions, which usually trend toward kebab-case or `index.tsx` feature folders.
- Do not rename files just to make casing consistent unless the user explicitly asks.
- Use descriptive booleans like `is`, `has`, `can`, `should`.

### Comments

- Add comments only for non-obvious reasoning, product constraints, or intentionally weird edge cases.
- Good prefixes in this repo are `// WHY:` and `// NOTE:`.

## Working Rules For Codex In Register

- Check the local feature area before proposing a pattern.
- Match the style of the subsystem you are editing, not the style of a different subsystem.
- For Index DTF work, prefer current Index DTF patterns over older Yield DTF patterns when both solve the same problem.
- Do not perform cleanup migrations unless they are required for the task.
- If you notice stale docs or drift between docs and code, trust the code.

## Review Notes On Existing CLAUDE Files

What is strong:

- The global Claude file captures Luis's real engineering instincts well: explicit code, anti-abstraction bias, direct collaboration, and pragmatic tradeoffs.
- The local Register Claude file is useful for product terminology and broad architecture orientation.

What needed correction:

- Some project facts in the local file are stale.
- Some "mandatory" conventions are not true in the current repo.
- Some idealized architecture guidance conflicts with the actual updater-heavy Jotai patterns used across Register.

## Default Codex Behavior For This Repo

- Be direct.
- Keep solutions simple.
- Prefer surgical edits over broad refactors.
- Surface real bugs, risky assumptions, and stale guidance quickly.
- Optimize for fast local comprehension by Luis one month later.
