# Scar-Mining Skill

Use this before building something others have already built: learn from what they had to tear out. Mine a mature project's **history, issue tracker, and changelog** for reverts, refactors-under-pressure, the most-painful bugs, and admitted shortcomings — then map each to whether your own design is already safe or exposed. This is the negative-space counterpart to `codebase-deep-scan`: that harvests the code worth copying; this harvests the mistakes worth not repeating.

## The one invariant

A scar with no anchor is a rumor. Every finding resolves to a real commit, pull request, issue, or changelog entry — cited — or it is dropped, never stated as fact. And every scar ends in one question: *does my design already avoid this, or am I exposed?* A scar not mapped to your own design is trivia.

## Procedure

1. **Pick the richest source, not the nearest.** The most mature or most-churned project that already solved your problem carries the most scar tissue. Confirm it resolves to a real repo before reading a line.
2. **Read history, not just code.** The learning is in what *changed*: reverts and "remove / deprecate / breaking / migrate" commits, big refactors and their forcing function; the issue tracker sorted by reactions and by comments, the bug label, and design regrets closed as won't-fix; the changelog and any breaking-changes or migration docs. Code is secondary here.
3. **Partition by failure surface** (delegate the fan-out to `topology`): reverted/removed, refactored-under-pressure, most-painful bugs, admitted shortcomings. One agent per surface; every finding carries its anchor. Absence is itself a finding.
4. **Map every scar to your design.** For each: already-safe (why), or exposed (where, and the fix). This is the payoff — a finding you cannot tie to your own exposure has not earned its place.
5. **Verify a sample of anchors.** Re-open a few of the cited issues or commits and confirm they exist and say what the finding claims. One that does not resolve condemns the batch — this is the anti-rumor gate.
6. **Land as study material.** A pitfalls document per source; when scanning several, add a synthesis of the failure laws that recurred — a pattern in one project is an anecdote, in three it is a law. It informs; porting a fix is a later, separate decision.

## Stays out

- Reusable code to copy verbatim → `codebase-deep-scan`. Critiquing your own live structure → `architecture-review`. A single known bug → read that one issue; a scan is overhead.
- Your own project's post-mortem is in scope (self-scar) — same anchors, same exposure map.

Link: [[codebase-deep-scan]] the good-code sibling, [[wayfinder]] to decide which fixes to port, [[testing]] since each live scar suggests a regression worth owning.
