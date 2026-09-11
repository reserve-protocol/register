# Provisional observations (recorded before reading decisions.md, postmortem, history, log)

Inspected so far: branch design-system-v1 @ adef9ee76, clean tree. Dev preview at 127.0.0.1:3005 (assumed same checkout; not proven). Playwright Chromium 1400x900/1000 light, some 375px, dark pending. Foundations (all 9), Components index, Button/Input/Select/Alert/Badge detail pages, transaction Zapper default, Status, Screens, Studies index; production Home, Discover, LCAP overview/issuance/governance/settings, Earn, Portfolio (disconnected).

## Visual quality
- V1 visual language (warm beige substrate, white content, Reserve blue, 300/500 Lausanne, pill controls, quiet feedback tints) is coherent and calm; it systematizes what Home/Discover/Overview already do in production. Good decisions to preserve: contrast calibration with measured ratios; typography role map with explicit size/leading/weight; spacing grammar 24/16/8/32; lifecycle status pills; inline message family; field anatomy; icon rules.
- Production cards are rounded-3xl white on beige with ~8px gaps; V1 radius foundation says structural regions are 0px with 1-2px beige seams. That is a real page-shape divergence that has never been validated on a whole page (Screens section is links only). Question requiring testing, not a defect.
- Production Zapper CTA is green (package-owned); lab Zapper is blue primary. Lab candidate diverges from installed package in a way the plan says the lab cannot change.
- Lab chrome is badge-heavy: 6 status badges + a green review panel on every detail page; index page is one 45,857px scroll with all state sheets inline.

## Demonstrated defects (lab)
- /components and /components/transaction-action auto-scroll on load to the vote-lock contained modal because transaction-contained-modal.tsx:25 focuses [role=dialog] on mount (measured initialScrollTop 7741 / 5799; activeElement = dialog DIV). Human reviewers land mid-page.
- e2e design-system suite cannot pass: foundation-detail-radius snapshot missing (0 files), baselines stale; suite not in CI nor scope.mjs.
- CLAUDE.md claims scope.mjs fires `comment-block`; no such flag exists.
- `--data-positive` referenced by lab/test but undefined; performance colours are hex in chart-performance-colors.ts and PerformanceValue.

## Definition / consumption
- Two overlapping role objects (candidateSemanticRoles vs v1SemanticRecipes) both imported as `roles`; five routes to "warning"; focus ring spelled six ways; 18px optical inset retyped in 4 places; v1LayoutRecipes has 0 component consumers.
- Typography: reusable typography.ts has 4 roles; the accepted 10-role scale lives only in lab typography-review-contract.ts. Elevation has no tokens. Radius roles are convention only.
- Size vocab: micro/compact/default vs compact/default vs compact/standard (Dialog) vs numeric (Spinner); `default` used as size, density, tone, treatment.
- IconButton defaults (compact/secondary) differ from Button (default/primary).
- 8 same-named components exist in ui/ and design-system-v1/; production imports 0 V1 modules. Adoption 0/45.
- Nothing enforces tokens-only; 185 palette classes + 135 non-icon hex in product code.

## Retrieval / documentation
- Ordinary tasks route through 17.7k words of instructions + 7.4k words of catalog before code; plan is 704 lines, ~65% transaction narrative; plan re-grew 3.7x after context-routing pass.
- Catalog: 80% prose; 28/32 baselines lack a decision link; 9 have no matching decision heading; `status` vestigial vs designAuthority; progress "defined" and "design-reviewed" are the same predicate.
- Vocabulary collisions: provisional (5 senses), blocked, defined, canonical, specimen; two feedback taxonomies; three migration disposition wordings.
- Templates candidate.md/synthesis.md never used; flow-composition-transfer used once.
- No skill names a viewport/theme for visual checks; no single self-check list before human review.

## Process
- Verification green = self-consistency (jsdom class assertions, catalog integrity). Browser suite exists but is outside gate/CI and currently red. No lab-vs-production comparison. No axe.
- Feedback recorded into an 18-row pressure register in the plan; rows are deleted on resolution (rationale lost) and component code has ~0 WHY comments by rule.
