# Highlighted-card framing — September 14

User-approved-for-now framing, implemented in the chart lab excerpt only:
square outer/inner corners, 4px card-colored surround, gradient immediately
inside it, 24px outer-edge content alignment, edge-to-edge 208px plot. This is
highlighted-card context, not universal chart padding. No production or chart
renderer/data/interaction change. The older full-card study is labeled historical.

Low, local presentation correction; coordinator implementation and self-review.
Inherited working-tree changes were preserved. The framing regression first
failed with expected 4px versus actual 8px. Final browser run: **4/4**, no retries,
skips or failures; source attachments are in [the report](report.json).
Both themes at 320/390/1400 assert the two square edges, 4px top/side surround,
24px title alignment, plot width/height and containment. All six captures were
inspected. Source frames and existing axis geometry also pass.

Focused catalog/hygiene units **37/37**, app/e2e types, scoped lint, wiki lint
and diff check pass. An initial capture check assumed one SVG; Home has separate
fill and stroke layers, so the final check waits for both existing layers.
Logo fallback and compact ticker truncation are retained fixture behavior,
not newly reviewed changes. Browser launch required sandbox approval.

Replay against an isolated preview (3037 used, not the user's 3005):

```sh
DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3037 CURRENT_REBALANCE_CAPTURE_DIR=docs/plans/design-system-charts-source-reset/highlight-frame PLAYWRIGHT_JSON_OUTPUT_NAME=docs/plans/design-system-charts-source-reset/highlight-frame/report.json node_modules/.bin/playwright test --config=playwright.design-system.config.ts --project=design-system-review e2e/design-system/chart-review-lab-regressions.spec.ts --grep 'source frames|highlighted-card framing|source chart review preserves' --reporter=list,json
```

No new interaction/analytics, shared default, dependency, commit or migration.
Production adoption and full-card synchronization remain separate work.
