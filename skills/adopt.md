# Adopt Skill

Use this when installing the kit into a repo that already has agent context — CLAUDE.md, AGENTS.md, .cursorrules, .github/copilot-instructions.md, agent-facing docs/, or feature-level agent files. The installer detects these and points here; it never merges prose itself.

## Prime Directive

Adoption must only improve the workflow. The existing context encodes local knowledge the kit cannot know — **on any conflict, the repo's existing rule wins by default**, and the conflict is recorded for the human to settle. Nothing is deleted until it has a new home; originals are archived, not removed.

Adoption also **personalizes**. The kit ships agnostic; a good adoption ends with project-owned surfaces that describe *this* codebase — its real commands, its actual conventions, its load-bearing surfaces — so every later agent loads truth instead of guessing. The written agent-context docs are only part of that; the richest knowledge is unwritten, in the code. Mine it (see **Scan the Codebase**). The base skills stay agnostic and untouched; personalization lives entirely in the project-owned files (`docs/wiki/`, `llm-workflow.config.json`).

## Adopting Mid-Flight

Adoption rarely lands on a clean tree — in-progress branches and uncommitted work are normal, not blockers. Treat pre-existing uncommitted work as the first stage's input: record its ledger row retroactively once the router lands, and use `workflow-start.mjs --allow-dirty` for the transition. Do not demand a clean tree before adopting.

## Scan the Codebase

This is adoption's self-improve: the same move `self-improve.md` makes at closeout — distill what is *proven* into project memory — run once against the whole repo instead of one change. It seeds `docs/wiki/` and `llm-workflow.config.json`, never the kit skills. Every seed is **evidence-backed**: cite the file, command, or pattern it came from. Write what the codebase *is*, never what it *should be* — a convention you cannot point at is speculation, and speculation stays out until a real change surfaces it.

Read a representative sample (entry points, the busiest and most-depended-on modules by git churn and import fan-in, one feature end-to-end, the test setup) and seed:

- **Real commands** → `llm-workflow.config.json`. Build/test/lint/typecheck come from `package.json` scripts, Makefile, CI config, lockfiles — the gate and verify globs are what the repo already runs, not what you would ask for.
- **Conventions in force** → `docs/wiki/project.md` stack specifics (or a domain page). How does this code actually do the recurring things — state, data fetching, error handling, module layout, naming? Capture the pattern the codebase already follows so agents *match* it instead of introducing a second way. This is the personalization the Prime Directive demands: the repo's patterns win.
- **Domain language** → the wiki glossary / `docs/wiki/domains/`. The recurring nouns in directory, type, and module names are the project's vocabulary; capture them so agents speak the codebase's language, not generic English.
- **Load-bearing surfaces** → `docs/wiki/project.md` safety / risky surfaces. Where does money math, auth, trust-boundary, migration, or protocol code live? These are the wide-radius surfaces the review lenses must fire on — name them from the code.
- **Test seam** → verify rules + a one-line note. How are tests structured and run, and what is the stable seam a fix should target? Seed the verify globs from the actual layout.

The written agent-context docs (next step) layer on top of this scanned baseline. Where a doc and the scan disagree, the doc is the stated intent and the scan is the current reality — reconcile and flag the drift for the human rather than silently trusting either.

## Procedure

1. **Inventory.** List every agent-context file. Read all of them fully before moving anything. Tool-generated duplicates count too — other agent CLIs sometimes migrate the same commands/skills into their own directories; dedupe to one source of truth and flag the copies for deletion rather than classifying them twice.
2. **Scan the codebase** (above) and seed the project-owned surfaces from evidence.
3. **Classify every rule or fact** into exactly one bucket:
   - *Project knowledge* (product, stack specifics, domain facts, safety rules, UI voice, risky surfaces) → `docs/wiki/project.md`; large per-domain material → `docs/wiki/domains/` pages with `sources` globs.
   - *Commands and verification* (build/test/lint invocations, CI expectations) → `llm-workflow.config.json` gate and verify rules.
   - *Coding/workflow rules* → compare with the kit skills. Already covered: drop, noting coverage. Stricter or more specific than the kit: keep it — record it under an **Overrides** section in `docs/wiki/project.md` (kit-owned `skills/` files are never edited per-repo). Contradicts the kit: the repo rule wins; record it as an override with one line naming the tension.
   - *Stale or wrong* (references to deleted files, dead tooling): drop, with one line in `docs/wiki/log.md` saying what was dropped and why.
4. **Migrate routers last.** Existing CLAUDE.md/AGENTS.md become the kit's router (template + a pointer to `docs/wiki/project.md`); the original files move to `docs/archive/`. If AGENTS.md is a symlink to CLAUDE.md, keep the single-source arrangement, just point it at the kit router content.
5. **Feature-level agent docs** (a CLAUDE.md inside a feature folder) stay where they are but must state that the root router remains authoritative; they add local context only and must not weaken root rules.
6. **Verify.** `node scripts/llm-workflow/wiki-lint.mjs` green; `scope.mjs --base HEAD --dry-run` maps sensible commands; every inventoried rule is findable in its new home or named in the drop log.

## Completion Criteria

- Zero information loss: every rule from the inventory has a new home, an override entry, or an explicit drop line.
- **Personalized:** `docs/wiki/project.md` and the config describe *this* codebase — a cold agent could state its stack, real commands, the conventions it should match, its domain vocabulary, and its load-bearing surfaces from the wiki alone, each traceable to the code it was mined from. No seeded fact is speculation.
- One router: exactly one live agent entry point holding the router content — AGENTS.md with CLAUDE.md as shim, or (when AGENTS.md is a symlink to CLAUDE.md) CLAUDE.md itself. Whichever file owns the content, there is only one.
- The human is shown the Overrides section, the drop log, and the scan-vs-docs drift flags in the handoff — they are the merge's audit trail.
