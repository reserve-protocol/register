# Yield / Portfolio integration — September 15

Historical integration receipt. The [completion package](completion/README.md)
owns the current revision and verification; the evidence below describes the
initial integration, not the revised presentation. The [revision plan](revision-plan.md)
records the human feedback. Not accepted or adopted in production. Mounted below
Overview/Home/candles at `/internal/design-system/components/chart#chart-next-families-review`.
The nearby responsive-preview link offers Normal/Narrow and true 390/320px
iframes. That HTML preview is local-development only, not a deployment entry.

## Scope and reconciliation

Copied only the worker-owned next-families folder, dedicated spec and receipt.
No inherited reference files copied back. Coordinator added the mount, preview
link and integration regression. The candidate title became h2 and received
sticky-header scroll margin; these are the only candidate-source deviations
from the worker implementation manifest. Preview-only CSS is not imported by
the main section. Production callers, shared defaults and financial logic are
unchanged. Existing candle work and its interaction gates were left open in
this historical integration. The separately authorized
September 15 G7 repair subsequently closed the lab keyboard/stable-touch gate
without changing production defaults.

Dark review findings: missing actual Portfolio total line confirmed/fixed with
ComposedChart; inaccurate touch-index approximation confirmed/removed rather
than accepted; mixed-input duplicate markers confirmed/fixed by suppressing
native indicators. The browser suite checks the actual line and single marker.
Light review closed the total-line finding after inspecting source and test;
source review was not represented as visual acceptance. Coordinator also
required distinct price ticks, bottom controls, retained domains/units, clear
simulation labels, and corrected mobile document flow/theme updates.

## Fresh coordinator evidence

- App and e2e TypeScript checks passed.
- Fixture contract suite: 7/7 passed.
- Dedicated and integration browser suites: 6/6 passed on main port3005.
  Includes retained candle selector, light/dark, 320/390px, Empty/Default,
  actual CSV contents, ranges, unique price ticks and a single selected marker.
- Scoped Oxlint and formatting passed; wiki/diff checked at handoff.
- Main Yield and Portfolio mounts inspected in live Chrome; final light320
  and dark390 screenshots inspected for layout, labels and legend containment.
  Evidence images were regenerated against the integrated checkout.

Chromium could not launch inside the sandbox; the authorized rerun passed.
The worker's whole-repository gate remains non-green on two inherited failures
recorded in README. The coordinator scope dry-run includes 171 accumulated files,
not this slice alone; no claim is made that the overall chart stage is closed.

## Review and engineering boundaries

Yield Price/Supply/Staked RSR use captured inputs; APY and Portfolio are visibly
simulated. Composition palette and persistent stacking are studies, not approved
changes to product interaction. Existing Gain/change figures, ETH conversion,
and Portfolio hover/click behavior are explicitly protected, not removed.
Pointer and keyboard inspection are included; touch inspection is unsupported.

**Engineer review required before adoption:** independently timed RSR/USD
valuation, real APY/Portfolio payloads, period/unit semantics, retained Gain and
change figures, touch/keyboard compatibility, localization and production host
integration. No new data adapter or calculation is approved by visual review.
