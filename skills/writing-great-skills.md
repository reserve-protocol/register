# Writing Great Skills Skill

Use this when creating, editing, pruning, or reviewing skills, skill routing, or workflow instructions.

Influence: distilled from `https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-great-skills/SKILL.md` and its glossary. Upstream license: MIT, copyright Matt Pocock.

Behavior-testing and failure-shaping influence: `https://github.com/obra/superpowers/tree/main/skills/writing-skills` (MIT, copyright Jesse Vincent, 2025).

## Root Virtue

Optimize for predictability: the agent should follow the same process every run, even when the output differs.

## Edit Loop

1. Name the branch: what user request, repo event, or other skill should trigger this skill?
   Completion criterion: a future agent can tell when to read it and when to skip it.
2. Put information on the right rung:
   - Skill body: steps every run needs.
   - Same-file reference: short rules every branch needs.
   - Linked file or wiki page: branch-only reference.
   Completion criterion: no branch carries reference it does not need.
3. Sharpen completion criteria before adding steps.
   Completion criterion: every step says what observable state means done.
4. Prune for single source of truth.
   Completion criterion: each behavior is owned by one file or one section.
5. Delete sediment and no-ops.
   Completion criterion: every kept sentence changes future agent behavior.
6. Verify routing and gates.
   Completion criterion: `AGENTS.md` and the skills agree on when each skill is loaded.
7. Test the behavior, not just the markdown.
   Completion criterion: one pressure scenario demonstrates the target behavior and one counter-scenario demonstrates the skill stays out; static tests cover structural invariants. If no live-agent harness ran, label behavioral confidence unproven.

## Match Form to Failure

- Agent skips a known rule under pressure → explicit gate, stop condition, and the observed rationalization.
- Agent produces the wrong output shape → positive ordered output contract, not a longer prohibition list.
- Agent omits a field → put a required slot in the artifact/template.
- Behavior depends on context → key the rule to an observable predicate, not “unless appropriate.”

Frequently loaded routing text should be under ~200 words where possible; other skills should usually stay under ~500. Exceed only when the extra context prevents an observed failure. One strong example beats repeated variants.

## Red Flags

- The description or trigger text explains the whole process instead of when to use the skill.
- A new skill exists only because adding felt safer than editing an existing one.
- Multiple skills restate the same rule.
- A compatibility pointer grows behavior instead of pointing to the owner.
- A vague step says "review", "ensure", or "improve" without a checkable completion criterion.
- A skill change creates more context load than the failure it prevents.
- A mandatory workflow has no counter-scenario proving when it stays out.
- Static tests are reported as proof that an agent will follow the prose under pressure.

## Decision Rule

Change a skill only when the change makes invocation clearer, reduces duplicated behavior, sharpens completion criteria, or removes stale/no-op text. Otherwise leave it alone and record nothing.
