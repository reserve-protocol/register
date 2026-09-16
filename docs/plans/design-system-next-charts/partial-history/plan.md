# Chart history-boundary treatment

Status: implementation-verified; **human-review-required**. The current result is
recorded in the adjacent [closeout receipt](README.md).

## Goal

Keep ordinary Yield charts on their available real-point bounds and model the
Portfolio lab fixture's known pre-holdings lifecycle honestly. Portfolio may show
exact zero only where the fixture explicitly knows holdings were zero; unknown or
missing history must never be converted to zero.

## Current state

Human review rejected the earlier all-partial treatment because routine Yield
sampling limits looked like missing history. The later dedicated Price example
was also explicitly replaced by the Portfolio lifecycle example and is no longer
mounted. Normal Yield remains available-bound.

The lab-only Portfolio fixture now contains sparse, explicit zero-valued samples
before the first positive holdings sample. Its last zero is immediately before
onset, keeping the monotone path on the zero baseline until the near-vertical
rise. YTD, 1Y and All include selectable known-zero history; 7D and 1M remain
post-holdings. This is known state in one simulated fixture, not a generic rule
for missing data.

Production behavior is unchanged: finite periods older than the first positive
Portfolio point are unavailable, and production does not synthesize or prepend
zero-valued points. The generic interrupted-data pressure fixture remains the
separate owner for internal gaps.

## Non-goals

- No production adoption, source, financial calculation, sampling, shared
  default, SDK, RPC, subgraph, token or accepted-authority change.
- No generic zero-fill, sentinel, backward carry, interpolation or resampling.
- No conversion of unknown history into zero and no second internal-gap system.
- No changes to frozen Overview or candlestick contextual replays.

## Acceptance evidence

- A rendered-path regression fails when the last zero is at the start of May 31
  because the monotone curve rises before the June 1 onset, then passes when the
  zero sample is immediately before onset.
- Browser proof samples the path one rendered pixel before onset, rather than
  inferring the shape only from nearby markers.
- Visible and live readouts can inspect `31 May 2026` as exact zero, and the first
  June 1 sample retains the existing positive category values.
- Component proof selects known-zero history in YTD, 1Y and All while confirming
  7D and 1M begin after holdings are positive.
- Ordinary Yield remains available-bound. Portfolio remains available-bound,
  with All using the fixture's actual minimum and maximum.
- Yield and Portfolio cadence-specific 24H disablement, inspection reset, real
  endpoint markers and visible-row exports remain intact.
- Focused and full next-family units, the affected browser specification, app and
  E2E TypeScript, scoped lint/format, wiki lint and diff checks close the slice.

## Test seams

- Fixture tests pin exact timestamps, category totals and the unchanged 13
  positive Portfolio samples.
- Testing Library drives the public range controls and keyboard inspection for
  broad known-zero versus short post-holdings ranges.
- The mounted design-system route samples the actual Recharts SVG path, readout,
  live output and total/composition modes across both themes and widths.

## Boundaries and remaining gate

The Portfolio lifecycle fixture is simulated lab data. It does not establish a
production rule for unknown history and cannot be adopted without engineer review
of the real data contract plus separate authorization. Human visual approval of
the chart candidate also remains required.
