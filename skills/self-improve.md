# Self-Improve Skill

Use this at the end of a major workload, long session, completed feature, large review loop, or context-heavy implementation, even when the work was not a formal stage.

## Default Stance

Prefer no change. Improvement work is justified only when there is concrete evidence that future work would otherwise become less correct, slower, more expensive, or more confusing.

Do not create process work to feel productive. Push back on vague improvement ideas, including your own.

## Audit

Check only the surfaces touched or stressed by the workload:

- Recent commits and diff scope.
- Failed or flaky commands.
- User corrections and repeated friction (in `docs/wiki/log.md`, look for `kit-friction` tags). When running in the kit repo itself there is no log — ask the human which project logs to sweep.
- Wiki pages that future agents will read.
- Skills or scripts that were skipped, confusing, too broad, or too expensive.
- Tool permissions that caused repeated human intervention.

When the workload is explicitly evaluating this workflow, collect a compact sample instead of anecdotes: profile and changed-file count; command wall time; reviewer count; confirmed/rejected/deferred findings by severity; reruns/flakes; user corrections; context handoffs; escaped defects. Do not require this telemetry on ordinary product tasks.

If the fix touches skills or routing, read `skills/writing-great-skills.md` first and prefer pruning or sharpening over adding another rule. A gate heavy enough that agents route around it enforces nothing — when a gate was bypassed, shrink the required process rather than adding enforcement.

Skill prose is executable behavior. For a routing or discipline change, define at least one pressure scenario that previously misrouted or violated the rule, plus one counter-scenario where the skill must stay out. Run the repository's static tests; when a real-agent evaluation harness is available, compare fresh-context behavior with and without the change. Do not claim a skill is behaviorally proven from lint/static tests alone.

## Decision Rule

Implement an improvement only when all are true:

- The issue happened or is directly evidenced.
- The fix is small and scoped.
- The fix improves future agent behavior or product safety.
- The fix does not delay the next useful product step more than the issue warrants.

Otherwise record nothing, or add one concise backlog item if the issue is real but not worth fixing now.

## Kit vs Project

Friction caused by the kit itself (skills, `scripts/llm-workflow/`, templates) is fixed in the kit repo and pulled into projects with `install.mjs --update` — not patched locally, where the fix dies with the repo.

## Closeout

If changes are made: run scoped verification for the touched files, `node scripts/llm-workflow/wiki-lint.mjs` when wiki pages changed, and update the wiki only with distilled rules or decisions. The kit repo self-hosts: `node scripts/scope.mjs --base <ref>` works there too (gate: `pnpm test`; no wiki, so skip wiki-lint).

If no changes are made, say so briefly and name the reason.
