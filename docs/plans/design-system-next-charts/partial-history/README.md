# Chart history-boundary closeout

Status: approved-for-now as part of the frozen chart lab baseline. This receipt
retains the bounded implementation evidence for the
[optical-refinement stage](../optical-refinement/plan.md). The September 16 chart
decision supersedes its human-review gate without authorizing production
adoption or changing the source/data boundary below.

## Result

- Normal Yield selections use their first and last available real points. Routine
  capture limits are not presented as missing history.
- The separate Price missing-history specimen was removed after the user
  explicitly chose the Portfolio lifecycle example in its place.
- The simulated Portfolio fixture explicitly models known zero holdings before
  the first positive sample. The final zero is `2026-05-31T23:59:59Z`; the
  existing positive series still begins at `2026-06-01T00:00:00Z` with all 13
  original positive weekly samples unchanged.
- The visible and live inspection date explicitly uses UTC day precision, so
  the last zero reads `31 May 2026` without leaking its geometry-only 23:59:59
  time. Precision is supplied by the caller rather than inferred from the
  timestamp or fixture cadence. The rendered monotone path stays on the exact zero baseline one
  pixel before onset and then rises nearly vertically to the June 1 value.
- YTD, 1Y and All include and can select the fixture's known-zero history. 7D and
  1M contain only post-holdings positive samples.
- The generic interrupted-data fixture remains separate. No unknown history is
  reclassified as zero and no generic range helper changed.

## Review reconciliation

The first candidate applied requested domains broadly; human review rejected that
presentation. A later dedicated Price example was then explicitly superseded by
the Portfolio pre-holdings lifecycle. Authority, catalog, coverage and evidence
references now describe that final candidate rather than restoring the removed
Price surface.

The initial Portfolio repair placed the last zero at the start of May 31. Browser
path sampling proved that monotone interpolation had already risen 152.27px one
rendered pixel before the June 1 onset. Moving the known-zero sample to one second
before onset corrected the path without changing the later curve.

## Verification

- Focused fixture/component tests: **15/15**.
- Full next-family unit suite: **32/32**.
- Affected browser specification: **20/20**, with a machine-readable JSON report
  at `../optical-refinement/evidence/portfolio-zero-playwright-report.json`.
- App and E2E TypeScript: passed.
- Scoped Oxlint and Prettier: passed.
- Wiki lint and `git diff --check`: passed.
- Light/dark 320/1400 total and composition captures were inspected with zero
  failures in the final browser report.

## Production boundary

Production currently hides finite periods older than the first positive
Portfolio value and does not synthesize or prepend zeros. Unknown history must
never be converted to zero. Adopting any part of this lab fixture or presentation
requires engineer review of the real Portfolio history contract and a separately
authorized production change.
