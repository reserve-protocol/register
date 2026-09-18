# Chart refinement completion

Status: implementation-verified; human visual acceptance and production adoption
remain separate. Base: `49f9f22ae94d579b4c530de845e8637d299a9c7d`.
No commit, dependency change, production consumer migration, financial behavior,
or candle interaction hardening was included in this presentation packet. The
separately authorized September 15 G7 repair later closed the lab keyboard and
stable-touch gate.

## Implemented candidate

- Candles opt into the lab-owned `SourceCandlestickTooltip` through the new
  optional `CandlestickChartBody.tooltipContent` seam. Omission still renders
  the existing production `CandlestickTooltip` unchanged.
- The candidate retains the original four OHLC values, their existing
  significant-digit formatting, and the existing local timestamp display and
  timezone meaning. The timestamp now reads above the same compact two-column
  label/value rows on an 8px semantic floating surface with a restrained border
  and elevation. Existing Recharts placement and interaction behavior remain in
  control.
- Home opts into `v1TypographyVariants.lightPanelTitle`:
  `text-xl font-light leading-[26px]`. This retains the 20px size, 26px line
  height, title semantics, wrapping and layout. The established `panelTitle`
  default remains medium weight and unchanged. This additive variant is a
  proposed candidate, not a newly accepted global rule.
- Overview adds the second muted separator only inside the desktop inline
  return. Price, first separator, ticker, second separator and return use equal
  8px relationships; the arrow and percentage stay paired at 4px. Phone and
  constrained layouts render the existing wrapped return without the second
  separator, so no dot can dangle on its own line.

## Preserved behavior

- All captured candle samples, OHLC meaning, range, interval, timestamp,
  launch annotation, axes, candle geometry and performance colors are unchanged.
- Header inspection remains line-only. This packet did not change candle event
  handling or focus behavior; its then-unresolved touch/keyboard limitation was
  superseded by the September 15 G7 repair.
- Overview keeps the ticker during line inspection and withholds the unrelated
  headline return until reset. No hovered or historical return was derived.
- Home retains square outer/inner geometry, the 4px surround, 24px content
  axis, gradient and edge-to-edge plot bounds. Source controls remain frozen.

## Verification

| Check                                              | Result                                                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Typography RED                                     | Failed as intended: `lightPanelTitle` was absent                                                |
| Tooltip RED                                        | Failed as intended: legacy 20px-radius/card presentation did not satisfy the V1 floating recipe |
| Focused Vitest                                     | 8/8 passed: typography, tooltip presentation/payload, candle source                             |
| Full app + e2e TypeScript                          | Passed: `pnpm typecheck`                                                                        |
| Owned Oxlint, Prettier and diff check              | Passed                                                                                          |
| Frozen focused Playwright on existing preview 3005 | 6/6 passed in 20.3s                                                                             |
| Isolated separator retry on owned preview 3042     | 1/1 passed; server auto-closed                                                                  |

The earlier shared-preview attempt reached five green checks before port 3043
stopped accepting connections. The final recorded run used the still-running
user preview on port 3005 and passed all six scoped tests from one frozen source
snapshot. The machine-readable record is
[`refinements-browser-report.json`](refinements-browser-report.json).

## Render inspection

The final light/dark tooltip captures show a compact, readable date over four
aligned 14px OHLC pairs. The surface remains visually distinct over both chart
themes without becoming a large card. The 320/390 and wide Home captures retain
the requested square frame, surround, content axis and plot geometry; the lighter
name has sufficient hierarchy without competing with the chart or market row.
No clipping, horizontal overflow or unintended layout reservation was observed
in the scoped renders. The remote logo did not resolve in the dark 1400px Home
capture, so external logo loading is not certified by this evidence. The fallback
identity rendered in the other inspected Home captures; no logo source or
production identity behavior changed in this slice.

Evidence:

- `candlestick-tooltip-light.png` *(capture generated locally; not tracked)*
- `candlestick-tooltip-dark.png` *(capture generated locally; not tracked)*
- `home-frame-light-320.png` *(capture generated locally; not tracked)*
- `home-frame-light-390.png` *(capture generated locally; not tracked)*
- `home-frame-light-1400.png` *(capture generated locally; not tracked)*
- `home-frame-dark-320.png` *(capture generated locally; not tracked)*
- `home-frame-dark-390.png` *(capture generated locally; not tracked)*
- `home-frame-dark-1400.png` *(capture generated locally; not tracked)*
