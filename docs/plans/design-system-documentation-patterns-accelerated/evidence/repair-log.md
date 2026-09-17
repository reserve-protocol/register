# Patterns repair log and pilot evaluation

The model and reasoning effort remained inherited and fixed for the entire
pilot.

## Substantive repairs

1. **Implementation error:** the first real-owner composition imported Chart,
   Table, and Navigation graphs that transitively reached product state and
   wallet modules. The production build and unit-time Reown request exposed the
   failure before human review. Repair: keep only the clean Form owner live and
   remove the three provider-coupled imports.
2. **Bad composition:** text-only isolation slots protected the artifact but did
   not keep the approved system result in the foreground. Independent Intent
   and Engineering Risk review caught this before user review. Repair: capture
   the exact accepted owners in light/dark, present them as non-interactive
   canonical-result images, add explicit provenance and accepted-authority
   gates, and correct standalone link promises.
3. **Implementation error:** the first static assets lived in the application
   public directory, which the standalone Vite entry does not serve. Added
   decoded-image browser proof caught the blank regions before handoff. Repair:
   move the assets beside the documentation module and import them through Vite;
   the repeated responsive matrix then rendered all captures.

Substantive repair count: **3** — two implementation errors and one composition
failure. There was no subjective visual refinement after the accepted owners
were captured.

## Evaluation rubric

- **Correct authority retrieved:** yes. Catalog authority, accepted decisions,
  named owner modules, and the paused Transaction checkpoint were used.
- **Correct precedent chosen and applied:** yes after repair 2. Every capture is
  generated from the named accepted owner; Form uses the accepted reusable
  recipe; Transactions stays absent.
- **Approved human decisions preserved:** yes. Five continuous anchors,
  result-first hierarchy, separate Global/Product contracts, frozen Chart/Table
  scope, paused Transactions, and no production promotion remain intact.
- **Repairs required:** three substantive repairs, classified above.
- **Failure cause:** implementation error ×2; bad composition ×1; missing
  instruction ×0; subjective refinement ×0.
- **Focused verification caught problems before human review:** partially. Build
  and rendered-image verification caught both implementation failures. The
  composition gap required independent review rather than the initial automated
  seam, and is now represented in the final acceptance checks.

The complete first and final render matrices remain in `evidence/first/` and
`evidence/final/` for direct comparison.
