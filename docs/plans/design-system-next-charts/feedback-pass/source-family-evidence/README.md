# Source family evidence

The slice's focused browser matrix passed 13/13. The coordinator's
[combined report](../final-report.json) supersedes those slice results: 46/46,
zero skipped, flaky or unexpected. [Closeout](../README.md) owns final
verification and visual-review boundaries.

## Reports

- `overview-report.json` — 3 passed, SHA-256
  `c75df8f4bad71c8bd8f3d4666ad73b9e254ccd76dabd04fad5a67f73e0906c3e`
- `mobile-report.json` — 3 passed, SHA-256
  `ac66e928959854f8711d96f1933f092c00a009ec1e5f7a6bf438e638380334e9`
- `home-report.json` — 3 passed, SHA-256
  `663180f64dc2e9ce3be19a217acfd0a6ebd1f0fafe6364172f95f1513119a969`
- `candlestick-report.json` — 4 passed, SHA-256
  `74676fd0383666c9acb0bccffbe4b0ae94c5f62abed075a01eb111fa068db851`

Each run used `DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3005`, the
`playwright.design-system.config.ts` `design-system-review` project and the
relevant focused grep against:

- `e2e/design-system/chart-review-lab-regressions.spec.ts`
- `e2e/design-system/chart-mobile-preview-lab-regressions.spec.ts`
- `e2e/design-system/chart-home-launch-marker-lab-regressions.spec.ts`
- `e2e/design-system/chart-candlestick-lab-regressions.spec.ts`

The canonical command shape was:

```sh
DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3005 \
CURRENT_REBALANCE_CAPTURE_DIR=docs/plans/design-system-next-charts/feedback-pass/source-family-evidence/captures \
PLAYWRIGHT_JSON_OUTPUT_NAME=<report-path> \
node node_modules/@playwright/test/cli.js test <spec> \
  -c playwright.design-system.config.ts \
  --project=design-system-review --grep <focused-pattern> --reporter=list,json
```

## Reviewed captures

- Overview line rest, inspected sample and restored rest in light/dark;
- 320px and 390px real mobile documents with axes hidden and markers unclipped;
- Home highlighted chart with aligned fill/stroke/fade/launch/endpoint layers;
- actual 90×40 Discover sparkline endpoint;
- Overview candle Y-label proximity without an endpoint marker.

The capture folder also retains `{light,dark}-1400-{rest,inspection,restored}.png`,
`chart-home-endpoint-dark.png` and `discover-dark-90x40.png`. The coordinator
refreshed the lifecycle captures to keep the chart title below sticky lab
navigation; that capture-only follow-up is `../final-capture-report.json`.

This directory's `final-report.json` is the earlier 13/15 diagnostic run, not
canonical evidence: two newly included header cases still used width-specific
54%-of-container guesses for an exact selected date. The coordinator replaced
those guesses with a known fixture timestamp mapped to the real curve extent,
retained exact value/date/layout assertions, and passed both cases in the
combined report linked above. Earlier slice reports retain their own source
snapshots; do not infer final snapshot identity from them.
