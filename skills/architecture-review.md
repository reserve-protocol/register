# Architecture Review Skill

Use this when the user requests architecture improvement, or when concrete evidence shows repeated change fan-out, a bug cluster, cross-domain coupling, duplicated orchestration, or behavior that cannot be tested at a stable interface. Do not run it on a calendar or because “cleaner” code sounds desirable.

## Goal

Find the smallest architecture change that improves caller leverage, locality, and testability. A valid result may be “keep the current shape.” Diagnosis is separate from refactoring.

## 1. Establish Evidence

Name at least one observed cost:

- one behavior repeatedly changes many callers;
- related bugs recur across modules;
- understanding one domain concept requires bouncing across unrelated files;
- callers duplicate boundary/error/state orchestration;
- tests must reach past the public interface or reproduce large internal graphs;
- cross-domain imports make a feature hard to remove.

Support it with current code plus, when available, commit history, bug records, or test setup. Explorer discomfort alone is a lead, not proof.

## 2. Map the Current Shape

For the affected domain concept, record:

- callers and ownership;
- current interface: types, invariants, ordering, errors, configuration, performance constraints;
- implementation responsibilities;
- dependencies and where they are constructed;
- existing behavioral test seam;
- decisions/compatibility constraints from the wiki.

Use project terminology; architecture vocabulary never overrides the domain's language.

## 3. Diagnose

Apply:

- **deletion test:** does removing the module erase complexity or spread it into callers?
- **depth:** how much useful behavior does each caller learn through how much interface?
- **locality:** does one conceptual change land in one owner?
- **interface-as-test-surface:** can real behavior be tested without internal knowledge?
- **variation test:** what actually varies enough to justify a seam/adapter?

Classify dependencies: in-process; local-substitutable; remote-owned; true external. This determines whether tests call directly, use a local substitute, or inject a port/adapter.

## 4. Rank Candidates

Present at most three: **Strong**, **Worth exploring**, or **Speculative**. Each candidate must name:

- evidence and affected callers;
- proposed ownership/seam in plain language (not a full interface yet);
- expected reduction in caller knowledge, change fan-out, or test setup;
- migration risk and compatibility constraints;
- why doing nothing is acceptable or costly.

Steelman each candidate into its strongest version before trying to falsify it; rank what survives.

Default to concise Markdown. Add a diagram only when call/dependency relationships are materially clearer visually. Do not generate HTML/CDN artifacts by default.

## 5. Select Before Designing

Stop after ranking. The user selects a candidate; no broad refactor begins implicitly.

For the selected candidate, propose one interface first. Explore multiple radically different interfaces only when the decision is hard to reverse or broadly public (SDK, storage schema, service boundary, global provider). Compare alternatives on depth, locality, seam placement, compatibility, and test strategy—not aesthetics.

## 6. Migration Contract

Implementation returns to `skills/workflow.md` and includes:

- characterization evidence where existing behavior is not already pinned;
- expand → migrate callers in green batches → contract when compatibility requires it;
- tests through the new public interface;
- deletion of old paths/tests only after callers are migrated and replacement evidence covers their behavior;
- explicit human review for public contracts or cross-domain ownership changes.

## Completion

Architecture review is complete only with either:

- no justified change, with evidence showing why the current module earns its complexity; or
- one user-selected candidate with an interface proposal, dependency strategy, migration path, verification seam, expected measurable simplification, and named remaining risk.

“Cleaner,” “more scalable,” or “best practice” without a concrete caller/test/change effect is not a finding.

Influence: adapted from Matt Pocock's `codebase-design` and `improve-codebase-architecture` skills (MIT, 2026) after production-workflow review.
