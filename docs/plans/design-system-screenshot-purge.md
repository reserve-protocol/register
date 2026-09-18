# Design-system screenshot purge

## Goal

Remove captured screenshots and raster review evidence from every commit on
`design-system-v1`, keep the branch buildable without tracked screenshots, and
prevent generated captures from being committed again.

## Current state

The branch contains 6,623 captured PNG/JPG files (about 685 MB) in design-system
evidence, Playwright baselines, and documentation-owned static captures. Product
artwork and token/icon assets are separate and remain required by the app.

## Non-goals

- Do not remove product artwork, token icons, logos, or externally referenced
  image fixtures.
- Do not change production product behavior, design-system authority, or
  accepted component defaults.
- Do not discard the user's unrelated basket documentation edit or local build
  cache.

## Acceptance evidence

- No captured PNG/JPG/JPEG files exist in any rewritten branch commit.
- Product artwork and token/icon assets remain present.
- The documentation uses live source renderers or structured text instead of
  committed screenshot captures.
- Typecheck, design-system unit tests, documentation build, focused browser
  checks, diff validation, and wiki lint pass.
- The rewritten remote branch contains no purged screenshot blobs in its
  reachable history.

## Test seams

- Documentation chart and retained-detail component tests.
- Design-system Playwright behavior suites without pixel-baseline assertions.
- Git tree and reachable-object audits over the rewritten branch.

## Slices

- Replace runtime screenshot dependencies and remove pixel-baseline assertions;
  blocked by: none.
- Remove tracked captures, add narrow ignore rules, and reconcile evidence docs;
  blocked by: runtime replacement.
- Rewrite and force-push branch history with lease, then restore unrelated local
  changes; blocked by: verified final tree.

## Unresolved decisions

None. The user selected full branch-history removal and explicitly excluded
ordinary product artwork from the screenshot definition.
