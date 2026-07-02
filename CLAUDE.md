# Register — Agent Router

Loader, not playbook. Reusable workflow rules live in `skills/` (kit-owned, updated via ai-loop); project knowledge lives in `docs/wiki/` (project-owned). **`AGENTS.md` is a symlink to this file** — edit `CLAUDE.md` only; both Claude Code and AGENTS.md-aware tools read the same content.

## Non-negotiables (always in force)

- Package manager is **pnpm**, not npm. Chains: Ethereum, Base, BSC — **Arbitrum is deprecated for Index DTFs, never add it**.
- Index DTF data goes through `@reserve-protocol/react-sdk` — read `docs/wiki/sdk.md` before writing any Index DTF hook/updater.
- Money is `Amount`/`bigint`, never `Number` for on-chain math. Live state comes from RPC, not the subgraph.
- Shared components keep their defaults; design tokens only (no hardcoded hex/hsl); feature isolation (`docs/wiki/project.md` § Safety Rules).
- **Never commit or push unless told. Never push to main/master. No Co-Authored-By. PR descriptions: clean human summary, no AI attribution.**

## Load Order

- For staged or code work, read `skills/workflow.md` first.
- Before writing or reviewing app code, read `skills/code-standards.md`.
- Before closing a stage, read `skills/review-panel.md` and `skills/wiki.md`.
- Before user-facing UI work, read `skills/ui-ux.md`.
- When changing the visual token system, read `skills/design.md` and `docs/wiki/domains/design-system.md`.
- Before adding tooling or starting a project surface, read `skills/stack.md`.
- For project context (product, stack specifics, safety rules, UI register, kit overrides), read `docs/wiki/project.md`.
- When exploring project knowledge, start at `docs/wiki/index.md` and follow links.
- At the end of a major workload, read `skills/self-improve.md`.
- When editing skills or routing, read `skills/writing-great-skills.md`.

## Default Loop

- Quick fix vs stage: `skills/workflow.md` § Quick Fix or Stage decides; when debating, it's a stage.
- `node scripts/ai-loop/workflow-start.mjs --stage "<stage>"` for stages; implement the smallest complete slice.
- Inner loop: `node scripts/ai-loop/scope.mjs --base <base-ref>` (verify commands + required review lenses + red flags for the touched files).
- Closeout: `node scripts/ai-loop/scope.mjs --gate`, visual check for UI stages, one progress row, wiki ingest, `node scripts/ai-loop/wiki-lint.mjs` green.

## Review Budget

Risk-routed lenses only, claims verified before adoption — `skills/review-panel.md` owns the rules. Register runs pairs as Dark/Light background subagents (`docs/wiki/project.md` § Overrides).

## Stop Conditions

- Ask before destructive actions, credentials, new auth assumptions, or architecture changes that widen scope.
- Engineer-review surfaces (on-chain math, governance/issuance behavior, shared defaults, SDK contracts — full list in `docs/wiki/project.md`) ship with an explicit **Engineer review required** handoff note.
- Stop after three failed attempts on the same symptom and question the architecture.
- Do not claim completion without fresh verification from this turn.
