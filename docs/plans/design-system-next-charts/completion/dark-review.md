# Dark review — Intent/product

Verdict: **fixes pending** against the September 15 revision contract. Reviewed
the named completion seams against `49f9f22ae94d579b4c530de845e8637d299a9c7d`,
excluding inherited chart work. No production-adoption or financial-scope
expansion identified. This is not human design acceptance.

## Findings

- **Important — confirmed, fix pending:**
  `src/views/internal/design-system/charts/next-families/metric-line-chart.tsx:101`
  renders visible hyUSD identity only for Price. APY and Staked candidates rely
  on `review.tsx:101` lab notes; Supply also loses its unit when Empty replaces
  its headline with `—`. The contract requires identity/units in chart
  context/readout, never solely lab notes. An isolated candidate therefore loses
  its asset association. Coordinator confirmed a scoped persistent-context fix.
- **Minor — confirmed, fix pending:**
  `src/views/internal/design-system/charts/next-families/portfolio-history.tsx:278`
  end-anchors every non-first X label, including the desktop interior date.
  The contract reserves endpoint anchoring for endpoints; the interior label
  must remain centered on its timestamp. Current text appears left-shifted
  relative to the represented sample.

## Missing evidence

No current Yield/Portfolio screenshots were available at review time. Require
post-fix ordinary-height light/dark captures at 320/390, constrained and wide
desktop, resting/inspection/empty and large-value pressure, plus visible axis
bounds, exact point/date/key correlation, range/CSV/reset and native-scroll
proof. Existing browser specs are inspected coverage, not executed evidence.
Inspected Home light-1400/dark-320 and candle-tooltip light/dark captures support
the retained frame/title and compact four-pair tooltip, not whole-family approval.

## Strongest disconfirming evidence

Sought financial semantic drift, duplicate totals, source-order inversion and
unapproved host adoption. Formatters retain `%`, Supply's normal hyUSD suffix and
Staked's dollars; Portfolio header/key share one dated sample, retain source
stack/key order, omit duplicate Total, and label colors provisional. Candle
`tooltipContent` preserves the production fallback; Home's title remains opt-in.
These support the bounded approach but do not cure the identity/axis findings.
The descriptor-copy concern is rejected on the coordinator's explicit scoped
instruction to retain “RSR staked value” and distinguish dollars from quantity;
the coordinator owns synchronizing that wording in the plan.
