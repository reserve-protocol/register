# Design-system screenshot purge

## Goal

Remove captured screenshots and raster review evidence from every commit on
`design-system-v1`, keep the branch buildable without tracked screenshots, and
prevent generated captures from being committed again.

## Current state

Complete. The 28 commits unique to `design-system-v1` were rewritten and the
remote branch was updated with an explicit lease. All 6,623 captured PNG/JPG
files (about 685 MB) were removed from design-system evidence, Playwright
baselines, and documentation-owned static captures. Product artwork, token/icon
assets, logos, and external image fixtures remain required by the app and were
preserved.

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
  complete.
- Remove tracked captures, add narrow ignore rules, and reconcile evidence docs;
  complete.
- Rewrite and force-push branch history with lease, then restore unrelated local
  changes; complete. The rewritten local and remote tips matched at
  `3df625b177c255f27435ba7a538f73d70b2cd865`, and all 28 remote-reachable branch
  commits passed the purged-path audit before the closeout note was added.

## Closeout evidence

- The pre-rewrite and rewritten tips have identical source trees.
- The rewrite preserved the `origin/master` merge base and the expected 28
  branch-only commits before this closeout commit.
- Typecheck, eight focused documentation tests, the 4,020-module standalone
  documentation build, whitespace validation, and the full pre-rewrite
  verification suite pass.
- The only interim wiki-lint warning came from the intentionally stashed,
  unrelated basket documentation update; the update is restored after branch
  publication and verified separately.
- A complete recovery bundle was verified outside the repository before the
  rewrite backup ref was removed.

## Unresolved decisions

None. The user selected full branch-history removal and explicitly excluded
ordinary product artwork from the screenshot definition.
