# Debugging Skill

Use this for a bug, failing test/build, flake, performance regression, or unexpected behavior before proposing a fix.

## Exact-Symptom Loop

Build one fast, deterministic, agent-runnable command that can go red on the reported symptom: focused test, request script, CLI fixture, browser assertion, replay, differential run, or bisection harness. It must drive the real path and distinguish this bug from a nearby failure.

If a human action is unavoidable, structure the steps and capture the result. If no loop can be built, list what was tried and request the missing access/artifact instead of theorizing.

## Diagnose

1. Reproduce the exact symptom repeatedly enough to trust the signal.
2. Minimize one input, caller, config value, or step at a time; every remaining element must be load-bearing.
3. Read errors and recent relevant changes; find a working comparison when one exists.
4. Rank 3–5 falsifiable hypotheses. Each states what one probe would change if true.
5. Probe one variable at a time. Prefer debugger/REPL; otherwise tag temporary logs `[DEBUG-<id>]`. For performance, measure a baseline/profile/query plan before changing code.
6. Trace invalid state backward to its writer/source. Before fixing behavior gated by a state variable, search every writer.

Do not add validation at every internal layer by default. Validate at trust boundaries and at the owner of an invariant; add another guard only when a demonstrated bypass or destructive sink justifies it.

## Fix and Prove

Use `skills/testing.md`: turn the minimized repro into a RED regression test at the correct seam, fix the source, then run GREEN. Rerun the original un-minimized scenario and relevant scoped verification.

Replace arbitrary waits with condition/event-based waiting unless elapsed time is itself the contract. Remove all `[DEBUG-<id>]` instrumentation and throwaway artifacts. Record the root cause and why the test would catch a recurrence.

After three failed fixes on the same symptom, stop. Revisit the architecture, the feedback loop, or missing evidence; another patch is not progress.

## Completion

Done requires: original symptom green; regression test red-before/green-after or documented absence of a correct seam; mapped checks green; debug artifacts removed; root cause stated. “Could not reproduce” is not “fixed.”

Influence: adapted from Matt Pocock's `diagnosing-bugs` and Obra Superpowers' `systematic-debugging` techniques (MIT), with evidence-driven rather than universal defense-in-depth.
