# Accelerated foundations documentation candidate

## Goal

Replace the Foundations card gateway with one continuous, anchored,
result-first reference for all nine foundations. Color is a complete primary
reference; every other foundation shows a truthful current summary without
creating new design authority.

## Current state

The standalone documentation runtime is verified, but the Foundations overview
still renders nine linked preview cards. Full foundation definitions, studies,
evidence, and history remain on stable detail routes.

## Non-goals

- Do not change catalogs, tokens, shared component defaults, product behavior,
  the standalone runtime, or any component or pattern family.
- Do not invent unresolved values or promote exploratory work.
- Do not delete legacy detail content, publish, commit, push, stash, or reset.

## Acceptance evidence

- Focused unit and standalone-browser tests prove the continuous overview,
  stable anchors, closed secondary disclosures, direct detail routes, and
  standalone isolation.
- First and final light/dark captures cover 320, 390, 768, and 1400px.
- Production build, artifact scan, TypeScript, lint/format, diff check, and wiki
  lint remain green.
- A durable receipt retains hashes, render evidence, repairs, and unresolved
  authority questions.

## Test seams

- `FoundationsOverview` is the highest stable UI seam for the aggregate page.
- Standalone `/internal/design-system/foundations` and direct foundation routes
  are the browser seams.
- Catalog entries and named implementation owners are the independent content
  oracle.

## Slices

- Slice: pin the missing continuous/result-first behavior with focused failing
  tests; blocked by: none.
- Slice: implement the aggregate foundation reference and complete Color
  presentation; blocked by: the RED proof.
- Slice: capture the first render, inspect, and make one bounded repair pass;
  blocked by: implementation.
- Slice: run final affected-surface verification and write the receipt; blocked
  by: repairs.

## Unresolved decisions

- Exact elevation recipes, general 12px/48px spacing adoption, and a completed
  Layout contract remain open. The presentation must label those boundaries and
  continue without inventing answers.
