# Testing Skill

Use this before implementing a bug fix or non-trivial behavior change when a correct automated test seam exists. Skip for copy, docs, data-only config, generated code, or trivial wiring; use the mapped verification instead.

## Test Surface

Choose the highest stable public interface that reproduces the caller/user behavior. Tests should survive internal refactors. If the only available seam cannot reproduce the real pattern, record the architecture limitation; a shallow test is false confidence.

Expected values come from an independent oracle: specification, worked literal, captured real fixture, or authoritative example. Never restate the implementation inside the assertion.

Mock true external boundaries, time/randomness, or expensive local substitutes. Do not mock internal collaborators merely to make construction easy. A fixture representing an external payload should preserve the complete relevant shape and identity constraints.

## Red → Green → Refactor

1. **RED:** write one minimal behavior test. Run the narrow command and confirm it fails for the expected missing/broken behavior—not a syntax, import, or fixture error. Capture the command and decisive failure.
2. **GREEN:** implement only enough behavior to pass. Rerun the same command and inspect warnings as well as exit status.
3. **REFACTOR:** simplify names/duplication while green, then run mapped scoped verification.

For an existing bug, rerun the original un-minimized scenario after the regression test passes. For refactoring existing unpinned behavior, add characterization evidence first; do not pretend a test written after the refactor proves the old contract.

## Quality Gate

A test is not evidence when it:

- passed before the behavior existed;
- asserts on a mock rather than observable behavior;
- uses an expected value computed by the same algorithm;
- verifies private calls/order instead of outcomes;
- cannot fail on the reported bug;
- depends on arbitrary sleep when a condition/event can be awaited.

When actual timing is the behavior, wait for the triggering condition first, then use a documented duration derived from the contract.

## Completion

Record RED command/result, GREEN command/result, final scoped checks, and any seam limitation. Testing effort follows risk: one strong behavior test at the right seam beats many implementation-coupled unit tests.

Influence: adapted from Matt Pocock's `tdd` and Obra Superpowers' `test-driven-development`/testing anti-patterns (MIT), calibrated against production workflow cost.
