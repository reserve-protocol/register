# Candlestick lab worker receipt

Status: implementation-verified; human review required. The September 15 G7
repair closes the lab keyboard and stable-touch OHLC oracle while preserving
production defaults.

## Starting tree

Fixed point and HEAD: `49f9f22ae94d579b4c530de845e8637d299a9c7d`.
The inherited tree contained 28 modified tracked paths and 11 untracked paths.
Its `git status --porcelain=v1` SHA-256 was
`63ffadc339a71d0771f1268222b6e4771d2464b6903d7486b25323f554150883`.
Starting hashes for overlapping chart sources were recorded before edits:

- `review.tsx`: `2347e7547c015d30cb047dc9613ff1b7e9de2aee1ea2ef1b264f81d4c718e0ee`
- `source-overview.tsx`: `810770746a51d9c6e220e4c1a764c98751fa976056b975a211eb1b70b2cb30dc`
- `source-set.tsx`: `f30c74833d26d7f6e2a530b6e707d2d1bb080202f35dba3b88d73324e5a0eb79`
- `mobile-preview.tsx`: `517c1ef82db8df06a9e2d049ca4afcc012a14ec6c8d923dc46302950126bb468`
- `chart-review-lab-regressions.spec.ts`: `943f362699c934d777bd6335ae26981e682ad46f388397f4ebc3e56bc350bac3`
- `chart-mobile-preview-lab-regressions.spec.ts`: `12895f395edacfb86c77bc13d234c6cff0ae0934faeacf2adcec65c0dbc4b9c4`

All inherited changes remain in place.

## Source provenance

The offline fixture is the unmodified response captured on
`2026-09-14T22:00:48Z` from the public staging endpoint
`https://api-staging.reserve.org/v2/historical/dtf/candles/` for BSC chain 56,
PHOTON address `0xa0fe4e0aeca5479705ce996615b2eacb6b6a10fb`,
`from=1767225600`, `to=1789311670`, `interval=7d`. It contains 37 raw
candles. One raw bucket has `low=0`; the lab reuses the production mapper,
which excludes that invalid candle and renders the remaining 36 without
replacement or synthesis. The last captured bucket has count 1039 and is
explicitly presented as partial, not completed seven-day performance.

This capture is independent from the older Overview headline and line-history
snapshots. No values, returns, timestamps, or periods are reconciled across
them.

## Verification log

- RED: the focused browser test timed out waiting for the absent
  `chart-type-candles` control.
- First GREEN: real renderer selection, identity, interval, axes, launch
  annotation and light desktop capture passed 1/1.
- Fixture and production-mapper oracle: 2/2.
- Stable browser subset: 6/6. This covers the real Overview renderer, pointer
  OHLC inspection, settled 320px and 390px iframe renders, desktop dark and
  narrow dark containment, stable footer ordering, and the line/candles/line
  round trip in both the review and iframe.
- Historical keyboard oracle: failed with production defaults because the existing
  tooltip did not expose `Open` after keyboard navigation.
- Historical second-candle touch oracle: failed with production defaults because
  the existing tooltip did not retain the complete OHLC payload (`High` was
  absent). The assertion remains enabled and unchanged.
- Earlier explicit keyboard opt-in characterization: keyboard passed, but touch
  selected the January 8 candle only transiently and reset to January 1 after
  the required 500ms retention interval.
- Three bounded touch experiments reached the workflow stop condition: the
  opt-in reset above, pointer suppression removed the tooltip, and touch-origin
  focus suppression removed the tooltip. All three experiments were removed.
- Separately authorized September 15 repair: focused keyboard/stable-touch 2/2,
  protected geometry/hover 5/5, full candlestick 12/12 and integrated chart
  matrix 86/86. The active interaction assertions were not weakened or skipped.
- Application TypeScript: passed.
- E2E TypeScript: passed.
- Scoped Oxlint: passed.
- Base-relative whitespace validation: passed.
- Locale diffs remain bounded to 24 additions per catalog (the inherited five
  chart-preview messages plus the new chart-type label).

## Final source state

The lab has a real Line/Candles selector and mounts the existing Overview
`CandlestickChartBody` with the captured 7-day OHLC fixture. The production
mapper, interval meaning, headline price and return, ticker, launch timestamp,
estimated/actual distinction, renderer defaults, and financial data plumbing
remain unchanged. The only production-component presentation seam is an
optional launch-marker annotation variant; callers that omit it retain the
existing default.

The production OHLC tooltip remains unchanged. The existing optional lab
`tooltipContent` seam enables Recharts keyboard accessibility and records the
actual pressed candle index as Tooltip `defaultIndex`, so focus retains a
non-first touch selection. No retained-payload override, focus capture or
pointer suppression remains. Header inspection stays line-only. Frozen footer
labels are specimen-only: desktop order remains Line then Candles; mobile shows
the selected type.

## Evidence

- `evidence/candlesticks-light-1400.png`
- `evidence/candlesticks-light-mobile-320.png`
- `evidence/candlesticks-dark-mobile-390.png`
- `evidence/candlesticks-dark-narrow.png`

Each final capture waited for two identical 36-candle geometry readings after
the render animation. Visual inspection confirms real up/down bodies and wicks,
the flat square Overview surface, 32px desktop and 24px mobile titles, normal
desktop axes, hidden mobile axes, preserved ticker/headline, and launch
annotation. The Playwright-owned preview process exited after each run; the
user's port 3005 preview was not touched.

The captured fixture SHA-256 is
`550f4ea8005ab33d82e5669bcd10b491bb8b239f39c9e5a4209dbddd09507a2e`.
The final isolated server check returned connection refused on port 3022.

## Interaction recovery and decision

Pointer hover, keyboard navigation and stable touch selection now retain all
four OHLC values and the timestamp in the lab opt-in. The fix is bounded to the
custom-tooltip caller; omitted options retain the production renderer defaults.
Production adoption therefore still requires engineer and human review, but no
lab interaction failure remains deferred.
