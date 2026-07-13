# Register — Agent Router

Loader, not playbook. Reusable workflow rules live in `skills/` (kit-owned, updated via llm-workflow); project knowledge lives in `docs/wiki/` (project-owned). **`AGENTS.md` is a symlink to this file** — edit `CLAUDE.md` only; both Claude Code and AGENTS.md-aware tools read the same content.

## Non-negotiables (always in force)

- Package manager is **pnpm**, not npm. Chains: Ethereum, Base, BSC — **Arbitrum is deprecated for Index DTFs, never add it**.
- Index DTF data goes through `@reserve-protocol/react-sdk` — read `docs/wiki/sdk.md` before writing any Index DTF hook/updater.
- Money is `Amount`/`bigint`, never `Number` for on-chain math. Live state comes from RPC, not the subgraph.
- Shared components keep their defaults; design tokens only (no hardcoded hex/hsl); feature isolation (`docs/wiki/project.md` § Safety Rules).
- **Never commit or push unless told. Never push to main/master. No Co-Authored-By. PR descriptions: clean human summary, no AI attribution.**

## Load Order

- For staged or code work, read `skills/workflow.md` first.
- When `workflow.md` classifies work as high/multi-session, read `skills/planning.md` and write the durable plan.
- Before implementing a bug fix or non-trivial behavior change with a test seam, read `skills/testing.md` (RED→GREEN→REFACTOR; test the real seam, not a mock).
- When debugging a failure, read `skills/debugging.md`; for architecture decisions, `skills/architecture-review.md`; when reconciling review findings, `skills/re-conciliate.md`.
- Before writing or reviewing app code, read `skills/code-standards.md`, then scan `docs/wiki/improvements.md` for your area (anti-patterns are binding; fix listed debt opportunistically when touching it).
- Before closing a stage, read `skills/review-panel.md` and `skills/wiki.md`.
- Before user-facing UI work, read `skills/ui-ux.md`.
- When changing the visual token system, read `skills/design.md` and `docs/wiki/domains/design-system.md`.
- Before adding tooling or starting a project surface, read `skills/stack.md`.
- Domain guides live next to the code: `e2e/CLAUDE.md` (mock cookbook, diff→test decisions) and `src/views/index-dtf/<area>/CLAUDE.md` (which specs cover the area, how to mock its states, edge cases). Read the area guide before changing a view or writing its tests.
- For project context (product, stack specifics, safety rules, UI register, kit overrides), read `docs/wiki/project.md`.
- When exploring project knowledge, start at `docs/wiki/index.md` and follow links.
- At the end of a major workload, read `skills/self-improve.md`.
- When editing skills or routing, read `skills/writing-great-skills.md`.

## Default Loop

- Calibrate first: `skills/workflow.md` § Calibrate: Radius × Size (touch-up / low / medium / high) — radius buys review, size buys ceremony; `scope.mjs` prints the signals; when debating, take the heavier profile. Touch-up and low ship on scoped verify + self-review; medium is one heavily-reviewed stage; high is a plan of stages.
- `node scripts/llm-workflow/workflow-start.mjs --stage "<stage>"` for medium/high; implement the smallest complete slice.
- Inner loop: `node scripts/llm-workflow/scope.mjs --base <base-ref>` (verify commands + required review lenses + red flags + tier hint for the touched files).
- Stage closeout (medium/high): `node scripts/llm-workflow/scope.mjs --gate` (skip if the final scoped run printed `gate-equivalent: yes`), visual check for UI stages, one progress row, wiki ingest, `node scripts/llm-workflow/wiki-lint.mjs` green.

## Review Budget

Risk-routed lenses only, claims verified before adoption — `skills/review-panel.md` owns the rules. Register runs pairs as Dark/Light background subagents at medium/high profiles only (`docs/wiki/project.md` § Overrides).

## Stop Conditions

- Ask before destructive actions, credentials, new auth assumptions, or architecture changes that widen scope.
- Engineer-review surfaces (on-chain math, governance/issuance behavior, shared defaults, SDK contracts — full list in `docs/wiki/project.md`) ship with an explicit **Engineer review required** handoff note.
- Stop after three failed attempts on the same symptom and question the architecture.
- Do not claim completion without fresh verification from this turn.
