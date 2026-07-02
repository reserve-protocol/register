# Stack Defaults

Use this when starting a project or adding tooling. These are defaults, not law — deviations get a decision entry in `docs/wiki/decisions.md` with the why.

## Frontend

- React + Vite + TypeScript. When SSR/routing framework is a real requirement, TanStack Start or Next.js — TanStack Start is sometimes the better fit; decide by user preference and the existing stack.
- Zustand or Jotai for client state, by user preference and project scope (for Jotai atom patterns see `skills/code-standards.md`).
- TailwindCSS + local shadcn-style components (checked-in source, not a runtime dependency).
- React Query for server state. react-hook-form + zod for forms.
- lucide icons.
- Web3 when relevant: wagmi + viem; `Address` type from viem; BigInt for all on-chain amounts.

## Tooling

- pnpm with a single `pnpm-lock.yaml`. No second package-manager lockfile, ever.
- `oxfmt` for formatting, `oxlint` for linting (the formatter package is `oxfmt`, not `0xfmt`).
- vitest for unit tests; tests typechecked via their own tsconfig.
- `@/*` path alias for app source.
- No monorepo/turbo machinery until more than one app actually needs it.

## Desktop (when a native shell is needed)

- Electron: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, CSP, deny new windows, block external navigation.
- Renderer is untrusted: no raw ipcRenderer passthrough, no Node/filesystem/secret APIs exposed; validate every IPC payload at the main-process boundary; render model/provider output inertly.
- Preload builds to CommonJS `.cjs`; Vite `base: "./"` for `file://` bundles.
- Secrets in a `0600` local file or OS keychain via a narrow interface — never in the app database.

## Data

- Local-first: SQLite for relational app data; migrations from the first schema version.
- Drizzle (or equivalent) for schema/queries; raw SQL only for migrations, PRAGMAs, and documented escape hatches.
- Persist completed records, not streaming deltas; reconcile interrupted work on startup as partial.

## Subgraphs (when indexing chains)

- The Graph, AssemblyScript, Mustache templates for multi-network.
- `getOrCreate` for idempotency; handlers (`_handleTransfer`) separate from mappings (`handleTransfer`); `try_` pattern for contract calls that can fail; time-series snapshots for analytics.
