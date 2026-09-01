# Resolving Merge Conflicts Skill

Use this for an in-progress merge or rebase conflict. The rule under everything: **always resolve, never `--abort`, never invent behavior.** A conflict is two real intents meeting; your job is to keep both, not to write a third.

1. **See the state.** What's mid-flight — merge or rebase, which commits, which files. Read the conflict markers before touching them.
2. **Recover both intents.** For each side of a hunk, understand *why* the change was made — the commit message, the PR, the ticket, and this repo's own `docs/wiki/decisions.md` / `log.md`. A hunk you resolve without knowing what each side wanted is a guess.
3. **Resolve each hunk.** Preserve both intents where they fit. Where they genuinely can't coexist, keep the one matching the merge's stated goal and record the trade-off (`docs/wiki/log.md`). Do not add behavior neither side had.
4. **Verify.** Run `node scripts/llm-workflow/scope.mjs --base <merge-base>` for the scoped checks the touched files map to, then the full gate before finishing. Fix whatever the merge broke — a green resolve that changed behavior is a failure, not a pass.
5. **Finish.** Stage and commit (or continue the rebase to the end). Never leave a half-resolved tree.

Influence: adapted from Matt Pocock's `resolving-merge-conflicts` (MIT), with the project's scoped verification and wiki-as-intent-source in place of fixed checks.
