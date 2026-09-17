# Specimen-canvas pilot evaluation

Date: 2026-09-17

## Pilot scope

- Controlled specimen: Select, with URL-backed family and state dimensions plus scoped reset and current-state link.
- Ordinary no-control specimen: Metric, using the same documentation, host, and specimen boundaries without irrelevant controls.
- Model and reasoning effort: unchanged for the full pilot.
- Owned implementation paths: the Select and Metric documentation specimen modules, their focused component-documentation tests, and the focused browser pilot journey.

## Evaluation

| Question | Result | Evidence |
| --- | --- | --- |
| Did the task retrieve the correct authority? | Yes | Both specimens render the existing accepted `Select` and `Metric` owners; no catalog, production owner, or shared default changed. |
| Did it choose and apply the correct precedent? | Yes | The existing inline accepted specimens were retained inside the shared three-layer `DocumentationSpecimenCanvas` contract. Select uses the accepted compact text-only segmented control for two-value dimensions; Metric omits controls that do not apply. |
| Did it preserve approved human decisions? | Yes | Select remains one bounded-list choice with accepted default/compact and ready/unavailable states. Metric retains inline and headline roles. Status, adoption, and authority records were not promoted or rewritten. |
| How many substantive repairs were required? | Two | One focused unit-test repair and one cross-surface browser-journey repair, detailed below. |
| What caused the failures? | Implementation errors | No failure was caused by missing instructions, bad composition, or subjective refinement. |
| Did focused verification catch the problems before human review? | Yes | The component test caught the Metric instance-count mismatch. The pilot browser journey caught direct-hash drift when query controls updated. Both were corrected before the final passing journey. |

## Repair log

1. The first canvas implementation left three Metric instances across the two canonical roles. The focused render contract expected one inline and one headline example. The unit test caught this before browser review; the redundant inline instance was removed. Classification: implementation error.
2. The Select state hook correctly preserved the current hash, but the shared scroll observer had already settled a direct `#select` load to the preceding `#textarea` section. The browser pilot caught the URL changing to the wrong section when controls updated. The shared observer owner repaired direct/reload/query settling, and the unchanged pilot journey then passed. Classification: implementation error at the shell/canvas integration seam.

No subjective visual repair was made after inspecting the final desktop-light and phone-dark captures.

## Durable evidence

- `first-render-select-desktop-light.png`
- `first-render-select-phone-dark.png`
- `first-render-metric-desktop-light.png`
- `first-render-metric-phone-dark.png`
- `final-render-select-desktop-light.png`
- `final-render-select-phone-dark.png`
- `final-render-metric-desktop-light.png`
- `final-render-metric-phone-dark.png`
- Focused unit contract: `src/views/internal/design-system/tests/components-documentation.test.tsx`
- Shared canvas/query contract: `src/views/internal/design-system/tests/documentation-specimen-canvas.test.tsx`
- Browser behavior and capture journey: `e2e/design-system/components-documentation.spec.ts`

## Final verification result

- Focused component and shared-canvas tests: 18 passed.
- Provider-free documentation build: passed.
- Focused lint: passed.
- Final desktop/phone render and Select query/reset/link/scroll journey: passed.
- Full TypeScript was initially blocked by an unrelated concurrent Charts module being between file states; all pilot-owned TypeScript findings were corrected during this pass.
