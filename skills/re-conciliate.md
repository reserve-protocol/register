# Re-conciliate Skill

Use this when asked to refresh an adopted repo's agent-workflow installation with the latest kit ("refresh workflow on <repo>"). Not for first-time installs — that is `install.mjs` plus `skills/adopt.md`.

## Why It Exists

`install.mjs --update` replaces the kit-owned surface wholesale (`skills/`, `scripts/llm-workflow/`) but never touches the project-owned surface: `AGENTS.md`/`CLAUDE.md`, `llm-workflow.config.json`, `docs/wiki/`, `.gitattributes`. The refresh gap is project-owned files drifting behind current kit conventions — a router that doesn't route new skills, a config missing new keys, overrides the kit has since absorbed. On any conflict, the project's rule wins; the kit only proposes.

## Procedure

1. **Inspect first.** `git status`; read the project router, `llm-workflow.config.json`, and the Overrides section of `docs/wiki/project.md`. In-flight work is input, not a blocker — shared-tree rules apply; touch nothing another worker owns.
2. **Run the installer:** `node <kit>/install.mjs <repo> --update`. Kit files are now current; managed defaults (e.g. `.gitattributes` union rules) are added idempotently.
3. **Reconcile the router.** Diff the project's live router against the kit's current `templates/AGENTS.md`. Port new routes and authority lines; keep every project-specific line and the project's wording where they conflict.
   Completion criterion: every installed skill is routed; no project rule was dropped.
4. **Reconcile the config.** Add new schema keys with defaults. Never weaken existing gate/verify/lens rules without the human; note gaps (e.g. an unmapped source area the kit now flags) as findings, not silent edits.
5. **Re-check overrides.** An override the kit now covers is removed, with one `docs/wiki/log.md` line naming what absorbed it. An override that still conflicts stays — it wins by design.
6. **Verify.** `wiki-lint` green; `scope.mjs --base HEAD --dry-run` maps sensibly; one dated `log.md` entry: kit version/commit refreshed from, what was ported, what was preserved, what was dropped and why.

## Completion Criteria

- Kit-owned files match the kit; project-owned files route and configure everything the new kit expects.
- Zero information loss: every previous project rule survives, was absorbed (logged), or was explicitly dropped (logged).
- Fresh verification evidence from this refresh, not a prior run.

If the kit is unchanged since the last refresh, say so and change nothing — a no-op refresh is a valid result.
