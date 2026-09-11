# Consolidation implementation and verification record

2026-09-09 · bounded implementation of the [active plan](design-system-foundation-consolidation.md).
The latest closeout appears below. Earlier sections remain dated evidence of
the capture prerequisite and first typography batch, not the current work queue.
This is not a new visual approval or a production-adoption checkpoint.
The separately preserved fresh-agent controls are in the [evaluation record](design-system-consolidation-evaluation.md).

## Latest verified checkpoint

S1–S3b implementation is verified. The [final evidence index](design-system-consolidation-evidence/final/index.json)
retains the public source manifest, four ordinary-viewport source/geometry
records, twelve inspected screenshots, case results and verification hashes.

| Check                                               | Final result                                                                              |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Full unit gate                                      | 1,172/1,172 in 129 files; typecheck and lint pass                                         |
| Helpers, included in the full unit suite            | 84/84 in 10 files; real watcher and missing-baseline failure exercised                    |
| Read-only design-system browser suite               | 159/159, no retries or skips, 13.4 minutes                                                |
| Source-bound review, included in that browser suite | Nine regressions plus four captures; 72 raw images, twelve curated/inspected              |
| Existing app smoke suite                            | 58 passed, one existing fixme skipped, no failures/retries, 1.2 minutes                   |
| Fresh-agent compositions                            | All three unchanged artifacts pass the same four mounted checks; original unit tests pass |

The existing smoke skip is the Overview Market Cap data-type test; this pass
neither added nor removed it. The smoke run uses the original mock/environment
configuration, with only its owned port (3024), explicit checkout working
directory and output paths adapted. The first adapter attempt stopped before
tests because the temporary configuration defaulted to its own directory;
binding the checkout explicitly resolved startup. The user's preview was not
stopped, reused or modified. Remote Linux CI execution remains unobserved.

The final four captures share one public source-content digest with matching
before/after checks and no observed edits. Selected evidence totals approximately
13.0 MB, within the justified 14 MB checkpoint allowance below. Full-page baseline
maintenance is not blanket visual approval, and passing the original app smoke
suite is not a production migration rehearsal. S4 comparison is now reconciled
with a mixed result; its unmet positive exit and S5 named-pilot approval remain
explicit authority boundaries.

## Historical prerequisite implementation

The existing design-system Playwright configuration now defaults to read-only
snapshot verification, accepts an owned alternate port, and emits JSON/HTML
reports with attachments. The new `design-system-review` project records the
ordinary viewport, Button focus, open Select and three Typography-map positions
in light/dark at 375×812 and 1400×900. Select Escape/focus return, ten rendered
type samples and the actual theme are asserted.
Screenshots are taken before geometry collection so finite-animation settlement
does not leave pre-animation measurements attached to a settled image.

A content manifest includes tracked and new runtime sources, relevant config,
and lockfile. Environment fingerprints are checked only in memory, never
serialized; the exported digest also excludes them. A native watcher rejects observed edits
even if their content is restored; missing required attachments also fail.
The original retained records included private-file fingerprints, not raw
credentials; those records and their private-derived aggregate hashes have now
been sanitized, with one shared public manifest and updated artifact hashes.
The owned server avoids an
unknown already-running preview. This proves selected source stability during
each test, not exactly which startup configuration Vite consumed or dependency
binary identity. It is a controlled local prerequisite, not source attestation.

## Historical harness proof

This set predates the S3a source edits. It is not the S2 before baseline;
S2 requires a fresh capture of its affected surfaces before changing an owner.

- `pnpm exec vitest run e2e/helpers/tests`: **81/81**, including nine new
  capture/config tests; native watcher tests ran outside the restricted host
  sandbox. The sandboxed scoped run failed on watcher availability; it is not
  represented as a green full gate.
- `pnpm exec tsc -p e2e/tsconfig.json --noEmit`: pass.
- Repository lint: pass with existing warnings; focused changed-code lint and
  formatting: pass.
- `DESIGN_SYSTEM_PORT=3019 pnpm exec playwright test --config=playwright.design-system.config.ts --project=design-system-review`:
  **4/4**, no retries, 45.2 seconds. Twelve screenshots and four source/geometry
  attachments are retained in the [evidence index](design-system-consolidation-evidence/index.json).
- Real missing-baseline probe: the actual runner rejected a synthetic missing
  snapshot and did not create its expected file. Unit tests separately exercise
  changed/restored source, added source, dependency changes and absent attachments.

Capture identity: HEAD `adef9ee76ffe2a579f6811cae2f5cf152cd0cf99`, selected
public source-content digest is in the shared manifest linked by the evidence
index. All four original runs matched before/after, with no observed changes.
The retained public digest was recomputed during privacy sanitation. Runtime:
Node 20.20.0, pnpm 11.19.0, Playwright 1.59.1, Chromium 147.0.7727.15, Vite 7.3.2,
React 18.3.1, Tailwind 3.4.19, Lingui 5.9.5 on macOS. Compare like-for-like
platform/runtime evidence; these are not cross-platform pixel baselines.

All twelve images were inspected. They show the expected themes, Button focus
and visible Select menu. Select rows match recorded geometry: phone x=51,
first y=473, width=273, height=40; desktop x=59, first y=525, width=382, height=40.
The overview still lands on transaction specimens rather than the page start:
the known auto-scroll defect is preserved, not fixed or approved. Window scroll
is zero because the app scrolls its own content region; it is not evidence that
the overview stayed at its beginning.

Independent Intent and Engineering Risk reviews found no confirmed blocker in
this bounded infrastructure slice. The minor test-title overclaim was corrected;
theme fidelity, screenshot/measurement ordering and provenance limitations were
addressed and rerun. An intermediate theme assertion incorrectly used an
asymmetric matcher with `toHaveJSProperty`; its four failures are retained
privately, and the supported class assertion passes. This was a harness fix,
not an app or design change.

## Historical prerequisite boundaries

The deduplicated historical evidence set is harness proof, not an approved snapshot.
Raw reports and control transcripts have the retention boundary in the evaluation
record; the durable index retains content hashes. Reports in ignored output
folders may be overwritten by later test runs; these selected attachments remain.

At that checkpoint, still pending: CI upload/workflow routing, affected-state coverage for S2, the
known lab defects, browser-baseline policy completion, and the lab area guide.
Motion, all lab states, complete keyboard journeys, production integrations,
and the full repository gate were not validated here. The generic scope run
stopped at the sandboxed watcher test; the entire helper suite was then verified
outside that sandbox, without claiming generic smoke or full-gate completion.

S3a began with two evidence-backed stale-reference corrections: ActionGroup and
Field/TextInput are accepted baselines, not still awaiting their original review.
Their production adoption and other pending compositions remain separate.
Those historical first-slice claims do not describe later source changes.
The focused review corrections and packaged guidance-only fixture are now
recorded in the active plan and evaluation record.

## Typography batch verification

Final verification of that first batch: full unit suite **1,164/1,164**; capture/helper
suite **82/82**; final mounted capture **4/4**; app and e2e typechecks green;
repository lint passes with existing warnings. These are bounded consolidation
results, not a completed repository integration gate. The production smoke
runner's protected port 3005 was not acquired or disturbed.

The first S2 batch moves six existing reviewed recipes and all ten existing
usage descriptions into the shared typography owner. Existing four keys,
classes, samples, usage wording and layout are unchanged. Its new API test
failed on the missing six roles before implementation. The wider suite caught
an older exact-four-keys assertion; it now checks backward compatibility while
the new test checks the complete ten-role contract.

Fresh owned-port captures at 3021 ran before and after the owner change:
four light/dark × 375/1400 cases in each run. All twelve typography screenshot
pairs are byte-identical; every role's computed typography and text bounds
match across all three map positions (120 paired measurements, not 120
independent states). All twelve distinct images were visually inspected.
The [typography evidence index](design-system-consolidation-evidence/typography/index.json)
retains one image per identical pair, separate public before/after manifests,
eight source/geometry records, the comparison and consumer inventory.

Only the typography owner, its lab contract and characterization tests change
between these source identities. The earlier capture at the intermediate
test-only state remains private; the final capture includes the compatibility
test correction. No current semantic-role migration is implied by this proof.
Button focus and open Select/Escape checks also pass, but their screenshots
remain in expiring raw reports, not this curated typography set.

The historical and typography evidence together remain below the 5 MB budget.
The private-configuration regression proves public serialization is unchanged
by adding/changing a synthetic secrets file while the stability guard still
rejects that change. Real watcher tests require the unsandboxed host runtime;
the sandboxed failure remains disclosed. The same 2026-09-16 retention boundary
applies to private raw reports. No new kit skill, shared default, theme value,
production consumer, wallet action, commit or push is part of this batch.

## Consolidated ownership and review loop

S1–S3b implementation now closes the earlier outstanding items:

- One semantic owner accounts for all 61 original consumer modules; both old
  forwarding/overlapping maps are removed. Distinct static, focus-visible,
  inset and group-focus behavior remains distinct.
- Ten typography recipes and usage descriptions are owned in code; fourteen
  exact duplicate recipes in seven canonical files consume those values.
- Twelve Tailwind aliases expose already-defined semantic variables without
  changing either theme's CSS values. All thirteen layout relationships have
  explicit dispositions; IconButton defaults stay compact/secondary.
- Scoped executable hygiene rejects raw colors, palette utilities, unknown
  references and duplicated reviewed type recipes. Important modifiers and
  reordered literal classes are tested; explicit owner/scrim exceptions remain.
- All 45 catalog entries retain their underlying distinctions while exposing
  five independent questions: authority, implementation, output, adoption,
  review. No pending design or production adoption was promoted.
- The lab guide and test map own the rendered procedure. Workflow selection
  covers canonical owners outside the V1 directory; CI runs the full unit suite
  plus the normal-viewport review project and retains artifacts for 30 days.
  Wiring is locally tested; a remote Linux CI execution has not been observed.

The [owner dispositions](design-system-consolidation-evidence/consolidated/owner-dispositions.json)
and [catalog mapping](design-system-consolidation-evidence/consolidated/catalog-dispositions.json)
make these scope claims inspectable. S2's before/after comparison retains 71/72
byte-identical images. The unequal identity pair is retained: token logos had
not finished loading. Final captures require visible images to be ready.
The desktop geometry comparison's `false` result is also retained: four
class-name metadata substitutions per theme differ, while computed values and
bounds match. Three older route-ID fallbacks showed the overview, not dedicated
Field/Message/Metric pages; the strengthened final capture asserts the actual
routes. Do not count those historical fallbacks as dedicated-surface proof.

## Review findings and verification maintenance

The independent Intent and Engineering Risk reviews completed their bounded
implementation review. Confirmed findings were corrected: CI now selects all
unit tests, not only the V1 directory; hygiene catches important/reordered
literal bypasses; the shared-contract engineer-review register includes the
semantic/Tailwind owner changes. Reviewer probes confirmed the twelve aliases
produce identical nonempty styles. No unresolved important implementation finding
remained in those reviews; subsequent capture/test maintenance is self-reviewed.

The old browser suite had stale pre-consolidation assertions and baselines:
accepted Link/Accordion behavior, changing inventory/chart counts, routing to an
old review destination, and missing Radius images. Assertions now consume their
actual owners and scoped specimens. The obsolete snapshots were inspected before
replacement; the four missing Radius baselines use explicit macOS filenames.
Both phone layout/modal studies also predated accepted copy/typography updates.
Their before/after images were inspected in full; clipped fixed-width historical
modal examples remain provisional studies, not proof of a responsive product UI.

Full-page capture CSS now removes sticky positioning from the sticky wrapper,
not only its child nav. The giant Components sheet applies its capture-only
layout before advancing the frozen clock so resize-driven selected options and
charts settle. This does not alter the live UI or loosen pixel thresholds.
The 32 original full-sheet differences were inspected at their top/bottom and
targeted regions, not every pixel of the very long sheets. Normal-viewport
captures remain separate and do not apply this full-page CSS.

The final twelve curated ordinary-viewport images were inspected in both themes:
phone overview, connected Field and Inline Message states; desktop Button focus,
Checkbox focus and open Select. The overview stays at its beginning, visible
control relationships and focus treatments are retained, and the open Select
is contained. This is the named inspection scope, not a claim to have judged
every element of every long state sheet.

Verification failures are not erased: an initial 114/159 run found obsolete
assertions/baselines; a later 157/159 run isolated timing and phone-baseline
issues. Unit output once reported all assertions passing while asynchronous
logo updates errored after jsdom teardown. The manual lifecycle test now mocks
the separately browser-covered image boundary. The real watcher test yields one
event-loop turn after setup before its synthetic edit, accepts relevant coalesced
events, restores bytes and still checks drift rejection. Lowering test concurrency
did not solve that race and is not presented as the fix. The settled full gate
exited successfully with **1,172 tests in 129 files**, typecheck and lint green.

## Evidence scope and retention

Retain the historical prerequisite, twelve identical typography pairs, the
semantic comparison including its exceptions, final source records and a curated
image subset, plus the six synthetic first outputs. The initial 5 MB cap is
explicitly raised to **14 MB for this checkpoint** so before/after evidence and
unrepaired evaluation artifacts coexist. Do not retain all raw 72-image runs or
duplicate each manifest; hashes and exclusions accompany the selected subset.
The 38 updated/new macOS regression baselines total 43.2 MB. They are separate
test fixtures, not additional claims of human visual acceptance; this is a real
repository cost beyond the 14 MB curated-record allowance. The large full-sheet
run remains checkpoint-only, while routine/CI review uses the bounded project.

Raw local reports/workspaces expire by **2026-09-16** under the evaluation
record; no retention extension or cleanup automation was silently created. CI's
30-day upload policy applies only when a CI job actually runs. Private environment
fingerprints remain in memory only, and exported source digests exclude them.

Source checks cover the selected source/config set from test start; they do not
attest Vite startup configuration or dependency binary identity. Mocked browser
checks cannot prove production integrations, real wallet execution, all states,
or complete motion/accessibility. No production view was migrated. Existing
shared components consume the consolidated owner with value-preserving aliases;
no theme value, component default, SDK/math/approval policy, wallet state,
commit or push changed.

S4's [independent comparison is reconciled](design-system-consolidation-reconciliation.md).
Authority/API benefits do not establish better composition; its positive exit
criterion remains unmet. The source-backed Downloadable resources pilot is prepared
in the plan but requires named scope approval before implementation. Shared
semantic/public-contract changes retain **Engineer review required before adoption**.
