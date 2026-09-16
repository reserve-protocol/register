# Chart preview and Home launch annotation

Status: done — lab implementation verified; human visual acceptance remains open.
User authorized the two pending presentation fixes on September
14, including the chart-only preview document's minimal Vite build entry.

## Task contract

Fixed point: `49f9f22ae`, with inspected inherited chart/title/framing changes.
The existing unrun mobile-preview regression is inherited input, not evidence.
Medium configuration boundary; bounded design-system verification plus an actual
Vite build and built-preview check. No checkpoint or commit is authorized.

- Rename the misleading constrained control to “Narrow desktop container”.
- Add “Mobile preview” with a real 320/390px document viewport so CSS typography
  and JavaScript axis behavior agree. Mount only one chart set; retain theme and
  inspection comparison, without loading the app's wallet or live updaters.
- Apply an opt-in unboxed 12px Home launch label, retain the token marker and
  existing interaction, and prove default mobile visibility without hover/tap.
- Preserve production defaults, chart inputs, timestamps, segmentation, title
  roles, framing, inspection restoration, and frozen range/type controls.
- Do not calculate hovered returns or modify SDK/data/freshness/financial policy.

## Execution and verification

Usage: a designer on a wide desktop chooses Mobile preview, reviews both chart
contexts at 390px, then chooses 320px to pressure wrapping. Returning to the
ordinary view restores desktop axes and title size. Narrow desktop container
remains a distinct layout-pressure case, not a mobile simulation. The preview
does not imply touch hardware emulation; touch behavior needs browser evidence.
The rejected parent-document portal would move CSS layout but leave imported
JavaScript media queries in the desktop realm, reproducing the original defect.

One fresh Sol/medium implementation worker, `chart_preview_launch_finish`, owns
chart lab/marker code and dedicated tests in the shared checkout. Coordinator
owns current documentation, convergence and final inspection; no concurrent
implementation writers. Capability assignment is provisional: bounded source
editing and browser checks, with coordinator review, not a claim of measured
model equivalence or cost. If evidence fails, repair with the same owner before
expanding scope. No independent implementation tournament is needed.

The worker's result lives in
[the implementation receipt](design-system-chart-mobile-preview/README.md).
Required evidence: observed RED then GREEN for mobile viewport behavior;
default/edge launch-marker proof; 320/390 light/dark plus desktop restoration;
pointer/keyboard inspection retained; app/e2e typecheck, scoped lint, actual Vite
build and built-preview rendering. Review the changed config and opt-in seams
through Intent and Engineering Risk before closing. The user's 3005 preview is
not a test runner and must not be restarted or stopped.

## Deployment boundary

The existing `_headers` CSP uses `frame-ancestors 'none'`. Local Vite dev/preview
does not apply that deployment policy. Do not weaken it for this lab: a locally
verified iframe is not proof of a deployed embedded preview. Any future deployed
lab preview needs a separately authorized security/deployment decision. The
Mobile preview option is restricted to loopback hosts; ordinary and narrow
review remain available elsewhere rather than offering a known-broken iframe.

## Review reconciliation

- Coordinator: confirmed loss of source-context labels/notes in the initial
  child document; restored one shared source-set composition, including Discover.
- Coordinator: confirmed launch line crossing the newly unboxed label;
  fixed with a verified 4px annotation-only gap, without changing timestamp x.
- Dark/Risk: confirmed deployed-preview control would be blocked by existing CSP;
  fixed with a loopback-only option (including bracketed IPv6), headers unchanged.
- Dark/Risk: confirmed fixed launch-label width could overflow translated copy;
  fixed with annotation-only intrinsic measurement and Spanish containment proof.
- Light/Intent: confirmed shared context note inaccurately implied mobile axes;
  fixed with viewport-neutral lab explanation. Dynamic theme, actual iframe
  inspection and explicit mobile-to-desktop restoration now pass in the built run.

Dark and Light rechecked their affected findings. Coordinator confirmed the
remaining IPv6 spelling correction in final source. No scoped source blocker
remains; these checks are not human acceptance of chart design.

## Closeout

The worker reports dev browser 8/8, retained chart compatibility 10/10, settled
dark capture recheck 1/1, built-preview browser 8/8, app/e2e types and scoped
style checks. The coordinator inspected the retained built report: all eight
tests pass with no skips/retries, and every attached source fingerprint matches
the final tree, digest `8701eb4564ac7828354cea9986c51ac8fdcdf37c948b8a83c95cd2c92517e7c2`.
The coordinator independently ran marker-presentation, motion and typography
units (6/6), scoped lint and app/e2e types, and inspected settled light 320,
dark 390 and Spanish Home captures. The earlier mid-animation capture was
replaced using actual curve/draw-clip readiness, not a chart behavior change.

Actual user Chrome on 3005 was also checked: child viewport 390, title 24px,
zero axis ticks, Home label visible before interaction, 12px text and 4px line
gap in dark mode. The real PHOTON icon rendered there; offline captures use its
documented fallback. Original light theme restored, mobile preview left selected.
No production caller, financial policy, dependency, security header or shared
default was changed. No commit or checkpoint. Review the label and true mobile
layout next; hovered percentages remain deferred until their baseline is agreed.

The initial scope invocation attempted the repository `pnpm lint` mapping but
the package-manager wrapper tried a dependency refresh and aborted before lint.
No dependency refresh is authorized. Equivalent installed local executables
will supply the actual check evidence; this failed wrapper is not a lint pass.
