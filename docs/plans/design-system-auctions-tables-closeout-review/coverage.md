# Coverage — auctions tables closing review

## Source identity

| Item | Value |
| --- | --- |
| Checkout | `/Users/lill-kire/Code/register`, branch `design-system-v1`, HEAD `289b2af86e8245ced89d9058a09182799c65f825` |
| Working tree | dirty (627 `git status` entries at start; 628 at end — the extra one is this package) |
| Review-source digest | `ef4794d91f10cd4b804475c2c0ef078d2be0bd192a6537af925729143abc80a5`, 2437 public files, computed with `e2e/design-system/review-source.ts` (`readReviewSource`) via a scratchpad runner |
| Start / mid / end | 02:10:57Z / 02:22Z / 02:48:21Z (2026-09-14) — identical digest, no change in the 117 reviewed-area files ([source/start.json](source/start.json), [source/mid.json](source/mid.json), [source/end.json](source/end.json); reviewed-area file hashes only, no environment contents) |
| Spec attachments | every `current-source` attachment in the spec run carries the same digest ([verification/browser-report.json](verification/browser-report.json)) |

No drift occurred; all evidence belongs to one implementation.

## Preview and access

- The user’s preview (`vite` pid 77295 on 3005, cwd this checkout) was used read-only through the Chrome extension and never stopped or reconfigured.
- An isolated preview for scripted capture: Node 24.19.0 (codex runtime binary) running `node_modules/vite/bin/vite.js --host 127.0.0.1 --port 3047 --strictPort` with the env from `playwright.design-system.config.ts` (`VITE_E2E=true`, empty RPC keys). Started by this review (pid 90879) and stopped at the end. No dependency install, upgrade or purge; `pnpm` was not invoked.
- Access confirmation before auditing: the Chrome extension rendered the actual page, resized the window (1043×654, then 1400×757), scrolled, cmd+clicked a row (opened a second tab with the preview URL; closed afterwards) and saved a screenshot — evidence/user-preview-3005-all-view-1400.jpg *(capture generated locally; not tracked)*. Viewport-exact captures, touch emulation and keyboard sequences used headless Chromium 1217 via the repo’s `@playwright/test` 1.59.1 against 3047. The layouts matched the 3005 preview at the widths spot-checked (1400 and 1043); the only visible difference is the machine timezone in the compact dates.

## What was inspected

Current table (`[data-testid=current-rebalances-table]`), historical table, the retained detail page, and the lab controls around them.

| Pass | Coverage | Evidence |
| --- | --- | --- |
| All-state matrix | 18 examples, light + dark, 1400 and 390 viewports; per-example crops plus geometry (row heights, pill/arrow/help/expiry boxes, overflow) | `cov-all-states-*` |
| History | default at 1400/390 light + dark; expired, long content, metrics loading, unavailable, zero, loading, empty at 1400 and per-row at 390 (light); unavailable/zero/loading/long content in dark | `cov-history-*` |
| Previews | empty, loading, two-record at 1400/390 | `cov-previews-*` |
| Viewports | 320, 351/352/353, 390, 430, 511/512/513, 768, 895/896/897, 1023/1024/1025, 1400 for `ready&viewer=member` (both tables) | `cov-current-320/430-viewport`, `r1-*` |
| Container widths (inline width on both table containers at a 1400 viewport) | 288, 351/352/353, 511/512/513, 895/896/897, 1023/1024/1025 for ready-member, hybrid-member, live, indexing; 288–353 and 1023/1024 for auction-error and complete; constrained-column toggle (390px column) | `cov-*-container-*`, `cov-constrained-column-390-at-1400` |
| Detail pages | all 18 examples at 1400 (light), 8 at 390 (light), 8 at 390 (dark); arrival state after mouse click (first and last example) and keyboard Enter at 1400/390 | `cov-detail-arrival-and-top-1400-390`, `f1-*`, `r2-*` |
| Locales | es/ko/zh at 320, 390, 1400 for ready, permissionless, hybrid-restricted, live, indexing, auction-error, complete; history row at 390/1400; es detail at 390 | `cov-locales-*` |
| Pressure case | `live&data=price-error&viewer=visitor` at 1400/390 — stays Ongoing with Ends in and Bids · 2 | `cov-live-price-error-visitor-*` |

Measured (light 1400, card 1352px): columns Rebalance 488 / Status 338 / Auction 311 / Expires in 135 / arrow 80; row 88px (96–116 with a status explanation); arrow circle 32px inside a 44px target; help button 20px inside a 44px target. Compact 390 (card 358): title → provenance 4px, → auction 20px, → status 24px, → expiry 20px; arrow circle right edge = expiry value right edge = 24px inset at every width from 288 to 1023. Container cutovers confirmed at 352 (arrow beside status vs beside auction), 512 (history status beside vs below identity), 896 (history columns) and 1024 (current columns). Pill text stayed on one line in every state, width and locale; no horizontal overflow anywhere.

## Interaction checks (light theme)

Desktop 1400, `ready&viewer=member`:
- Row hover: `bg-muted/50` (rgba 242,240,238 at 0.5), `cursor: pointer`; arrow hover: `bg-muted`; proposer hover: foreground colour. ✔
- Help: hover opens after the delay and closes on leave; keyboard focus opens; Escape closes and keeps focus on the button; click keeps it open; clicking the tooltip content does not navigate. ✔
- Tab order from the heading: proposer → help → Details → history accuracy help → history NAV help → history proposers. All `:focus-visible` with the semantic ring (links also show the UA outline, R6). ✔
- Enter on Details → detail, heading focused, URL gains `rebalance-preview`; Back link → focus returns to that Details link; row-whitespace click → detail; browser Back → focus returns. ✔
- Cmd+click (real Chrome, 3005): opens a new tab, list stays. ✔ (Headless Playwright with `modifiers: ['Meta']` navigated the main page instead — harness artifact, not reproduced in the real browser.)
- Drag-selecting the title and releasing does not navigate; a later plain click does (the click collapses the selection first — normal browser behaviour). ✔
- Proposer: `target=_blank`, bscscan address URL, no row navigation. ✔
- History: no row hover, `cursor: auto`; header help tooltips open on hover; proposer links focusable. ✔

Phone 390×844, touch + mobile emulation:
- Launcher help tap opens without navigating; second tap closes. ✔
- Tap on the card while the tooltip is open → closes **and navigates** (F3). Tap below the card → closes only.
- Arrow tap → detail, heading focused; Back tap → focus back on Details. ✔
- Pill tap (non-link) → navigates (row). Proposer tap → new page, no row navigation. ✔
- History help tap: first tap flashes and closes (F2); second holds; measured at 320 touch, 390 touch, 390 touch+mobile. Outside tap closes without navigation. ✔

## Commands and results

```
# isolated preview (stopped at the end)
VITE_E2E=true VITE_WALLETCONNECT_ID=test-project VITE_STAGING_API= VITE_USE_STAGING= VITE_MAINNET_URL= VITE_INFURA= VITE_ALCHEMY= VITE_ANKR= \
  ~/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 3047 --strictPort

# existing focused specs, external base URL, captures redirected to the scratchpad
DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3047 CURRENT_REBALANCE_CAPTURE_DIR=<scratchpad>/spec-captures \
  node node_modules/@playwright/test/cli.js test --config=playwright.design-system.config.ts --project=design-system-review \
  e2e/design-system/auctions-table-constrained-lab-regressions.spec.ts \
  e2e/design-system/current-rebalance-all-states-lab-regressions.spec.ts \
  e2e/design-system/current-rebalance-launcher-help-lab-regressions.spec.ts \
  e2e/design-system/current-rebalance-table-locales-lab-regressions.spec.ts \
  e2e/design-system/current-rebalance-table-lab-regressions.spec.ts \
  e2e/design-system/auctions-history-lab-regressions.spec.ts
# → 36 passed, 0 failed, 0 flaky, 3.3 min; report copied (attachment bodies stripped) to verification/browser-report.json
```

Scripted review passes (scratchpad, not committed): all-state sweep, viewport sweep, container sweep, previews/history/detail, interactions, locales, touch timelines, arrival positions. Playwright’s JSON/HTML outputs under the gitignored `test-results/` and `playwright-report/` were regenerated by the spec run.

## Honest omissions

- Touch behaviour was emulated (Playwright touch events); no physical device or real mobile browser. The Chrome extension cannot emulate touch.
- Interaction checks ran in light theme only; dark theme was covered by static captures (all states, history states, detail subset).
- Locale checks used the All view for seven examples plus one history row and one detail page; not every state was captured per locale.
- Spot checks of the user’s 3005 preview were limited to 1400 and 1043 widths; other widths came from the isolated 3047 server built from the same source.
- No screen-reader run; accessible names and tab order were checked programmatically only.
- Arrival scroll position after navigation was checked for three paths (first example by mouse and keyboard, last example by mouse); one earlier probe saw the Back link 58px above the viewport after a keyboard path from a different scroll state — not reproduced in the controlled runs, so not reported as a finding.
- Nothing was run on Linux/Windows or in other browsers.
- Plan and wiki pages were not edited (writes limited to this package); the “bounded final independent table review” item in `docs/plans/design-system-current-rebalance-table.md` and its evidence index should be reconciled by the owner.
