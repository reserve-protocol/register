# Adopt Skill

Use this when installing the kit into a repo that already has agent context — CLAUDE.md, AGENTS.md, .cursorrules, .github/copilot-instructions.md, agent-facing docs/, or feature-level agent files. The installer detects these and points here; it never merges prose itself.

## Prime Directive

Adoption must only improve the workflow. The existing context encodes local knowledge the kit cannot know — **on any conflict, the repo's existing rule wins by default**, and the conflict is recorded for the human to settle. Nothing is deleted until it has a new home; originals are archived, not removed.

## Adopting Mid-Flight

Adoption rarely lands on a clean tree — in-progress branches and uncommitted work are normal, not blockers. Treat pre-existing uncommitted work as the first stage's input: record its ledger row retroactively once the router lands, and use `workflow-start.mjs --allow-dirty` for the transition. Do not demand a clean tree before adopting.

## Procedure

1. **Inventory.** List every agent-context file. Read all of them fully before moving anything. Tool-generated duplicates count too — other agent CLIs sometimes migrate the same commands/skills into their own directories; dedupe to one source of truth and flag the copies for deletion rather than classifying them twice.
2. **Classify every rule or fact** into exactly one bucket:
   - *Project knowledge* (product, stack specifics, domain facts, safety rules, UI register, risky surfaces) → `docs/wiki/project.md`; large per-domain material → `docs/wiki/domains/` pages with `sources` globs.
   - *Commands and verification* (build/test/lint invocations, CI expectations) → `llm-workflow.config.json` gate and verify rules.
   - *Coding/workflow rules* → compare with the kit skills. Already covered: drop, noting coverage. Stricter or more specific than the kit: keep it — record it under an **Overrides** section in `docs/wiki/project.md` (kit-owned `skills/` files are never edited per-repo). Contradicts the kit: the repo rule wins; record it as an override with one line naming the tension.
   - *Stale or wrong* (references to deleted files, dead tooling): drop, with one line in `docs/wiki/log.md` saying what was dropped and why.
3. **Migrate routers last.** Existing CLAUDE.md/AGENTS.md become the kit's router (template + a pointer to `docs/wiki/project.md`); the original files move to `docs/archive/`. If AGENTS.md is a symlink to CLAUDE.md, keep the single-source arrangement, just point it at the kit router content.
4. **Feature-level agent docs** (a CLAUDE.md inside a feature folder) stay where they are but must state that the root router remains authoritative; they add local context only and must not weaken root rules.
5. **Verify.** `node scripts/llm-workflow/wiki-lint.mjs` green; `scope.mjs --base HEAD --dry-run` maps sensible commands; every inventoried rule is findable in its new home or named in the drop log.

## Completion Criteria

- Zero information loss: every rule from the inventory has a new home, an override entry, or an explicit drop line.
- One router: exactly one live agent entry point holding the router content — AGENTS.md with CLAUDE.md as shim, or (when AGENTS.md is a symlink to CLAUDE.md) CLAUDE.md itself. Whichever file owns the content, there is only one.
- The human is shown the Overrides section and the drop log in the handoff — they are the merge's audit trail.
