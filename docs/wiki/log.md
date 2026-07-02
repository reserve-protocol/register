---
title: Log
updated: 2026-07-02
type: log
---

# Log

Append-only chronological record: lessons, corrections, friction. Newest section last. Tag kit-caused friction with `kit-friction`.

## 2026-07-02

- Wiki initialized by ai-loop install.
- Adopted via `skills/adopt.md` on branch `cleanup/ai-release-general-ui-cleanup-stabilization`. Inventory: root `CLAUDE.md` (+`AGENTS.md` symlink), `src/views/index-dtf/issuance/async-mint/CLAUDE.md`, `.claude/commands/*` + `.claude/skills/*`, `IMPROVEMENTS_PLAN.md`, `docs/*`.
- Dropped: `IMPROVEMENTS_PLAN.md` (stale root-level plan for the merged `feature/split-discover-home-highlight-dtfs`; component split already done; remaining items moved to [[progress]] backlog). Untracked `.agents/skills/` (Codex-generated duplicates of `.claude/commands/review.md` and `.claude/skills/*`) flagged for the human — not deleted, not committed.
- Covered by kit, dropped from project docs: generic coding rules (dumb-beats-clever, rule of three, early returns, comments-explain-why, atom patterns, laziness ladder, review discipline, verification gate) — now `skills/code-standards.md`, `skills/workflow.md`, `skills/review-panel.md`. Register-specific deltas recorded in [[project]] § Overrides.
- ui-stabilization-sweep lessons: (1) the Codex-authored DataTablePagination extraction both changed shared defaults silently AND introduced a real mobile layout bug — the rules-check caught the first, only a screenshot with 12-page data caught the second; visual verification on realistic data is non-optional for shared-component refactors. (2) The designer PR removed all DTF navigation on 640–1024px viewports (old bottom nav was `<lg`, replacement bar was `<sm`); fixed by extending the floating bar to `lg:hidden` — pending design confirmation. (3) Two CSS-hidden copies of the about card meant two autoplaying videos on every overview visit; JS-gate breakpoint-exclusive heavy content instead of CSS-hiding it. (4) User rule reinforced: `cn()` for ALL className concatenation, never template literals.
- NOT fixed, flagged for engineer review: modal ZapperWrapper now mounts on every DTF route so `/issuance` runs two Zapper instances (container + inline — zap behavior, out of cleanup scope); `Layout`/`AppHeader` hardcode index-dtf overview route checks (shared-container change baked into the design); `navigation-menu.tsx` shared defaults changed by the PR (trigger padding, viewport border); desktop basket table lost its 10-row cap (100+ rows render for big DTFs — confirm intent).
