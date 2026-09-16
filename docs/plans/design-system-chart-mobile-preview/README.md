# Chart mobile preview and Home launch annotation

Status: implementation verified on September 14, 2026. Human chart acceptance and production adoption remain separate. Fixed point: `49f9f22ae` plus the inspected inherited worktree.

## Outcome

- Current Review now has mutually exclusive Normal, Narrow desktop container, and Mobile preview modes. Narrow constrains the source set inside a desktop JavaScript viewport. Mobile uses an independently loaded HTML/React document at real 320px or 390px CSS and JavaScript viewport widths.
- The chart-only document mounts one source set with the named Overview, Discover, and Home contexts. It imports React, Lingui, Jotai-backed source renderers, and the app styles without mounting App, wallet providers, route updaters, or product data readers.
- Theme and inspection mode synchronize through the iframe hash. Browser proof covers a post-mount theme change plus touch and keyboard inspection inside the child document.
- Mobile preview is available only on loopback hosts. The deployed `_headers` policy retains `frame-ancestors 'none'` and `X-Frame-Options: SAMEORIGIN`; no security policy was changed. A deployed embedded preview therefore remains blocked and requires engineer review before any deployment proposal.
- Home's source replay opts into an unboxed 12px auxiliary `DTF Launch` label and secondary historical caption. The dashed line ends 4px above the label, localized label widths are measured, and the token marker keeps its hover/focus interaction. The production-default 10px pill remains the default and is pinned by unit coverage. The mobile marker and label are visible without interaction when launch is in range.

No chart data, calculation, range, plot geometry, launch timestamp, default visibility, token marker interaction, production caller, SDK, live source, or shared default changed. The annotation-only vertical line endpoint and label geometry changed as described above.

## RED and GREEN

RED mobile command:

```sh
DESIGN_SYSTEM_PORT=3037 node_modules/.bin/playwright test --config=playwright.design-system.config.ts --project=design-system-review e2e/design-system/chart-mobile-preview-lab-regressions.spec.ts --reporter=list
```

Result: 1/1 failed because `chart-viewport-mobile` did not exist.

RED Home command:

```sh
DESIGN_SYSTEM_PORT=3037 node_modules/.bin/playwright test --config=playwright.design-system.config.ts --project=design-system-review e2e/design-system/chart-home-launch-marker-lab-regressions.spec.ts --grep 'Home source opts' --reporter=list
```

Result: 1/1 failed because the mounted Home source label was the existing 10px pill instead of the approved 12px annotation.

Final development-server proof:

```sh
DESIGN_SYSTEM_PORT=3037 CURRENT_REBALANCE_CAPTURE_DIR=docs/plans/design-system-chart-mobile-preview/evidence node_modules/.bin/playwright test --config=playwright.design-system.config.ts --project=design-system-review e2e/design-system/chart-mobile-preview-lab-regressions.spec.ts e2e/design-system/chart-home-launch-marker-lab-regressions.spec.ts --reporter=list,json
```

Result: 8/8 passed. The retained Overview title, frame, geometry, header, Home frame, and real mobile-touch subset also passed 10/10 in the combined compatibility run. A final settled dark-theme capture recheck passed 1/1 after the capture readiness guard was added.

Build and built-output proof:

```sh
node_modules/.bin/tsc --noEmit
SENTRY_AUTH_TOKEN= node_modules/.bin/vite build --outDir /private/tmp/register-chart-preview-build.UcMucl
node_modules/.bin/vite preview --host 127.0.0.1 --port 3037 --strictPort --outDir /private/tmp/register-chart-preview-build.UcMucl
DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3037 node_modules/.bin/playwright test --config=playwright.design-system.config.ts --project=design-system-review e2e/design-system/chart-mobile-preview-lab-regressions.spec.ts e2e/design-system/chart-home-launch-marker-lab-regressions.spec.ts --reporter=list,json
```

Result: the multi-entry production build completed and emitted both `index.html` and `src/views/internal/design-system/charts/mobile-preview.html`; the exact served build passed 8/8. The build reported the repository's existing Tailwind ambiguous-duration, Rollup pure-comment/eval, mixed static/dynamic import, and large-chunk warnings. Sentry release and source-map upload were skipped because no auth token was supplied.

Additional checks:

```sh
node_modules/.bin/vitest run src/views/home/components/highlighted-dtfs/tests/performance-chart-launch-marker-presentation.test.tsx
node_modules/.bin/tsc -p e2e/tsconfig.json --noEmit
node_modules/.bin/oxlint <changed code, config, and test files>
node_modules/.bin/prettier --check <changed code, config, and test files>
git diff --check
node scripts/llm-workflow/scope.mjs --base 49f9f22ae --dry-run
```

Results: marker tests 2/2; app and E2E typechecks, scoped lint, formatting, and diff checks passed. The scope dry run sees the larger inherited 157-file design-system tree and recommends high for that combined tree; this receipt claims only the bounded files and checks above. The `pnpm` wrapper attempted a metadata fetch/install and aborted in the non-interactive environment, so installed local binaries were used without installing or relinking dependencies.

## Curated evidence

- [Light 320 mobile preview](evidence/chart-mobile-preview-light-320.png)
- [Light 390 mobile preview](evidence/chart-mobile-preview-light-390.png)
- [Dark 390 mobile preview](evidence/chart-mobile-preview-dark-390.png)
- [Home launch annotation](evidence/chart-home-launch-annotation-light.png)
- [Home mobile default-visible marker](evidence/chart-home-launch-annotation-mobile.png)
- [Spanish label fit](evidence/chart-home-launch-annotation-es.png)
- [Built-output browser report](report-built.json)

The deterministic E2E boundary does not provide the PHOTON token image, so Home evidence shows the TokenLogo fallback. The user's live local preview displayed the real logo; these captures do not certify remote image availability.

## Live handoff

The owned built-preview server on port 3037 was stopped after coordinator verification. The verified files remain in `/private/tmp/register-chart-preview-build.UcMucl` and can be replayed with:

```sh
node_modules/.bin/vite preview --host 127.0.0.1 --port 3037 --strictPort --outDir /private/tmp/register-chart-preview-build.UcMucl
DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3037 node_modules/.bin/playwright test --config=playwright.design-system.config.ts --project=design-system-review e2e/design-system/chart-mobile-preview-lab-regressions.spec.ts e2e/design-system/chart-home-launch-marker-lab-regressions.spec.ts --reporter=list,json
```

The user's port 3005 preview remains running and was not started, stopped, or controlled by this worker.
