# Evaluate Workflow Skill

Use this only to decide whether an uncertain or misfiring workflow, skill, prompt, or structural instruction change should be promoted. It is cold by default. Ordinary product work, deterministic tooling checks, copy edits, and low-risk instruction cleanup do not trigger it.

This skill owns the run; `skills/model-capabilities.md` owns role assignment. It does not authorize fan-out: use one agent unless the normal topology gate admits more.

## Contract

Start from `templates/evaluation/plan.md`, then freeze:

- one fixed point and decision;
- one canonical task class and maximum promotion scope this run may support;
- one organic user task, identical base fixture, tools, permissions, limits, and held-out evidence for every arm;
- one independent rubric of 3–6 observable criteria, frozen before runs and hidden from performers;
- exactly one variable: workflow variant or capability profile;
- a usage reserve for verification and one repair attempt.

Do not start when the task cannot trigger the disputed behavior, isolation is unavailable, or acceptance depends only on a performer's opinion.

## Blind and Isolate

Each performer gets a clean, project-shaped workspace and only the organic request. Performer-visible prompts, paths, filenames, labels, and context must not reveal alternatives. Reject evaluator-introduced or arm-identifying cues such as variant labels, scoring instructions, hidden-rubric references, or alternative-run metadata. Ordinary project vocabulary—including `test` and `tests/`—is allowed when it exists identically across arms. Never ask which instructions were followed or invite chain narration.

Keep identities coordinator-only. Randomize neutral output labels before judgment. A single judge sees every artifact and the held-out rubric in one pass, without provider, model, workflow-arm, or author identity. Separate judge runs are not directly comparable because calibration drifts.

## Run and Measure

1. Diff performer-visible surfaces against the common base and leak-scan only evaluator-added material; record the result and shared-vocabulary allowlist.
2. Run the same organic task in isolated workspaces; preserve initial output before repairs.
3. Capture behavior and real-surface evidence at the highest available seam.
4. Capture actual instruction reads from workspace-scoped tool events, access logs, or transcripts: project-relative path plus privacy-safe evidence pointer. Citation and self-report are not read evidence. Never search unrelated workspaces. If unavailable, record `unknown`; do not infer compliance or promote on that criterion.
5. Record total-task usage from provider data or one preregistered proxy: performer context/tool traffic, retries, judge, reconciliation, and repair. Never invent token precision.
6. Record repair cost from first output to accepted output: turns, changed artifacts, reruns, usage, elapsed time. Record acceptance, real-surface proof, and rollback result.
7. Stop when isolation breaks, hidden material leaks, permissions differ, the reserve is threatened, or human approval is required. Preserve failure; never silently restart.

Preserve initial/final artifacts and access logs behind coordinator/judge-only access. Store project-relative or opaque pointers plus digests instead of raw prompts, transcripts, secrets, credentials, private messages, or proprietary source in evaluation records. Redact before judgment without hiding rubric-relevant behavior. Predeclare retention; after the verdict, delete raw copies unless project/user policy requires retention, then record access, reason, deadline, and deletion result. Performers never receive another arm's evidence.

Use `templates/evaluation/run-record.md` for every arm.

## Judge, Synthesize, Decide

The judge applies the frozen rubric once to all neutral labels and returns evidence pointers, criterion results, uncertainty, and disqualifiers. The coordinator reads every artifact and receipt, compares judgment with held-out evidence, then unmasks.

Use `templates/evaluation/verdict.md`. Promote only within the preregistered task class when behavior improves without worse accepted correctness, trust gates, rollback, continuity, or materially higher preregistered usage/repair cost. One organic task supports one narrow promotion or the next bounded experiment, never a universal/default workflow claim. Otherwise retain, revise, or reject. Without a live-agent harness, label behavioral confidence `unproven`.

## Complete Single-Agent Fallback

Parallel or diverse models are optional. With one available agent configuration, run arms sequentially in fresh contexts and clean fixtures, randomize order, keep prompt and rubric fixed, then judge neutral artifacts together. Without a fresh-context boundary, use captured organic tasks or deterministic replay. If neither exists, stop with `blinding unavailable`; use normal review, not a blinded claim. One agent may perform and judge serially, but must disclose that independence was unavailable.

## Pressure and Counter-Scenario

**Pressure:** a deadline does not permit revealing measured behavior, dropping held-out evidence, changing tools between arms, or spending the reserve. Reduce the number of arms or use the sequential fallback.

**Counter-scenario:** a typo fix, deterministic parser correction with a stable regression test, or ordinary feature implementation stays in its owning workflow branch. Do not manufacture an evaluation merely because this skill exists.
