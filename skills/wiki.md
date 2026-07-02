# Wiki Skill

Use this when reading project knowledge, closing a stage (ingest), or checking doc health (lint). The wiki is the project's durable memory: a small set of interlinked markdown pages that agents maintain so future agents load less and assume less.

Influence: Andrej Karpathy's "LLM Wiki" pattern (gist `442a6bf555914893e9891c11519de94f`) — three layers (sources / wiki / schema), three operations (ingest / query / lint). Honest adaptation: our raw-sources layer is the codebase and session history themselves, and ingest runs at stage closeout from code changes, not from immutable documents.

## Layout (fixed convention: `docs/wiki/`)

- `index.md` — catalog: one line per page with a hook. The entry point for every query.
- `log.md` — append-only chronological record (`## YYYY-MM-DD` sections). The ONLY append-only file.
- `project.md` — product context, stack, safety rules, UI register, active risks.
- `progress.md` — stage ledger table + backlog section. One row per stage: status, verifier line, lens lines, next action.
- `decisions.md` — durable decisions with reasoning; split into pages when it outgrows the split rule.
- `domains/<name>.md` — one page per feature/domain folder of the codebase.

## Page Format

YAML frontmatter, then a short body with `[[wiki-links]]` (target = another page's filename without `.md`).

```markdown
---
title: Storage
updated: 2026-07-01
type: domain        # domain | decision | context | ledger | log
sources:            # domain pages only: globs this page describes
  - src/main/storage/**
---

Body. Link related pages like [[ipc-preload]]. Say what the code cannot:
boundaries, invariants, gotchas, why.
```

## Operations

**Ingest** (at stage closeout, part of the workflow closeout):
- Update the domain pages the diff made wrong or stale; the drift lint is the backstop, not every touch. Rewrite, never append — pages are current-state syntheses, not journals. `log.md` is the only file that appends.
- Brownfield repos: create a domain page the first time a stage touches that domain. Never backfill the whole repo in one sitting.
- Record new decisions in `decisions.md` with the why.
- Append the dated summary to `log.md` (lessons, corrections, friction).
- Update `index.md` if pages were added or removed.

**Query** (when exploring):
- Read `index.md` first, follow links. Do not re-derive what a page already answers; if a page is wrong, fix the page.

**Lint** (`node scripts/llm-workflow/wiki-lint.mjs`, green required at closeout):
- Broken `[[links]]`, pages missing from index, index entries without pages.
- Missing/invalid frontmatter.
- Absolute local machine paths in any page (durable docs must survive other machines).
- Ledger drift: too many commits since `progress.md` last changed.
- Domain drift: a domain page whose `sources` have newer git commits than the page's `updated` date.

## Compression Discipline

The wiki's value is synthesis, not accumulation.

- A page over ~100 lines gets split into linked pages, or pruned.
- One page per feature folder; when the feature dies, delete its page and its index line.
- Every kept sentence must change a future agent's behavior. History belongs in `log.md` or git, not in pages.
- Contradictions between pages are bugs: fix at the owner page and link, do not restate.
- `log.md` is append-only but not immortal: periodically prune sections older than ~3 months down to entries still worth reading; git keeps the rest.
- Domain `sources` globs must not use `{a,b}` braces (git pathspecs ignore them; drift would never fire) — list the globs separately.
