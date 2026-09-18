# September 13 checkpoint evidence

Contract: [review checkpoint](../design-system-review-checkpoint-2026-09-13.md).
This package verifies preservation of the accumulated lab candidates; it does not
accept their designs or exercise real wallet transactions.

## Runtime and replay

Use Node 24.19.0 and the installed pnpm 11.19.0, with
`pnpm_config_verify_deps_before_run=false`. The repository pins pnpm 11.5.2;
this is not a matching-pnpm or CI result. No dependencies were installed.
One browser worker uses the isolated 3022 preview. User previews are not owned
by this verification. All browser tests use existing offline boundaries.

```sh
CURRENT_REBALANCE_CAPTURE_DIR=docs/plans/design-system-review-checkpoint-evidence-2026-09-13/captures \
PLAYWRIGHT_JSON_OUTPUT_NAME=docs/plans/design-system-review-checkpoint-evidence-2026-09-13/browser-report.json \
pnpm exec playwright test --config=playwright.design-system.config.ts \
  --project=design-system-review --reporter=line,json \
  'auctions-.*lab-regressions' 'current-rebalance-.*lab-regressions' \
  'owned-positions-lab-regressions' 'owned-positions-source-capture' \
  'discover-cards-lab-regressions' 'table-row-links-lab-regressions'
```

The capture-directory override preserves earlier named screenshots. Its default
is unchanged. This and the report externalization below are evidence-preservation
changes, not product behavior changes.

## Lossless attachment storage

Report attachment `path` values are relative to the containing JSON report.
The shared `attachments/` directory stores each original body under its SHA-256
filename. PNGs are unmodified; JSON attachments preserve their original bytes.
Identical bodies share a file. Existing separately retained screenshots remain.

The [externalization utility](externalize-attachments.mjs) checks stored bytes and
reconstructs the complete original report, including original attachment metadata,
before replacing its inline bodies with paths. A canonical JSON digest must match
before and after that round trip. It does not rewrite test outcomes or timestamps.
Claude's `design-system-current-rebalance-flow-audit` package is unchanged.

Six earlier owned reports contained 87,872,978 bytes, largely repeated attachments.
Their JSON now occupies 327,951 bytes, with every attachment retained separately.
These remain historical reports; their own source digests and timestamps determine
what they prove. Their images are not promoted to fresh checkpoint evidence.

| Earlier report                                       | Attachments | Canonical round-trip SHA-256                                       |
| ---------------------------------------------------- | ----------: | ------------------------------------------------------------------ |
| Current workspace `final/browser-report.json`        |         167 | `d3666640fe07fdf4a65c80724c674a4686c15eb7f758a877ae108433e0545f74` |
| Current workspace `final/spacing-report.json`        |          88 | `b2b73613f7c70293dc6de37e0323a23fc0cd136a851e9c261d64c7e7bcc8fef8` |
| Current workspace `final/sections-report.json`       |          71 | `47edda89da835fe6603f5f3c073ed17d7f1f410ec4e58e07ab6ccb375c52065d` |
| Current workspace `final/header-report.json`         |          43 | `1dff20dd8510aa95f3d303f6e10065d7045c777a8cd64dac2ad7fdc399bc7cb0` |
| Current workspace `final/spacing-header-report.json` |          24 | `4ce9b32d40e153466e3e37be362ba5c931869bf6496fb6ec35871b70b69cb9d2` |
| Owned positions `final/report.json`                  |          69 | `5a01bdcaa34b942ad2620bad8d3b556d7be729478f888cdc3f11513edf9cc9ec` |

Dark independently checked all 462 report-relative pointers: no missing file,
symlink, hash mismatch or remaining embedded body. Light confirmed the capture
override preserves the original default and the revised catalog descriptions
match the current transparent 3:2 workspace composition.

## Fresh verification

[Browser report](browser-report.json): **102/102**, one worker, no failures,
skips, retries or flaky cases; started September 13 at 14:28:14 UTC, 7.2 minutes.
[Rich-record integration](integration-report.json): **2/2**, desktop and phone.
All 46 structured source attachments and 35 digest attachments share
`5ca7ac657876169cae1c6025335a369cd4c41b8b2a010c913a66ff6c8e9bc2f0`;
a post-run read matches (2,413 public files). Private configuration is guarded
in memory, not serialized. Both runs used the same unchanged source tree.

The fresh browser report's 416 attachment bodies are retained under `attachments/`.
Its JSON shrank from 59,419,083 to 230,758 bytes after round-trip digest
`410f1cded581fd34165dedbd50029d528e04b9a2add051272bca48ca066751e6` matched.
Together with the six earlier reports, all **878** pointers were checked for
existence, symlink avoidance and matching content-addressed hashes. The integration
report has no attachments. Its round-trip digest is
`aa3b0ed502297cd97398c6f93ebb32946c2fdabe41fef706fa29d0fa6712dd31`.

```sh
PLAYWRIGHT_JSON_OUTPUT_NAME=docs/plans/design-system-review-checkpoint-evidence-2026-09-13/integration-report.json \
pnpm exec playwright test --config=playwright.design-system.config.ts \
  --project=design-system-desktop --project=design-system-mobile \
  --reporter=line,json lab.spec.ts \
  --grep 'renders the source-grounded rich record review'
```

The owner inspected ordinary-viewport captures of
desktop repeat *(capture generated locally; not tracked)*,
dark 320px header *(capture generated locally; not tracked)*,
320px weights *(capture generated locally; not tracked)*,
expanded dark liquidity *(capture generated locally; not tracked)*,
phone cumulative/history context *(capture generated locally; not tracked)*,
live desktop *(capture generated locally; not tracked)*,
historical table *(capture generated locally; not tracked)*,
full Discover card *(capture generated locally; not tracked)*,
dark compact long card *(capture generated locally; not tracked)*,
phone governed list *(capture generated locally; not tracked)*
and owned desktop rows *(capture generated locally; not tracked)*.
Some remote logos use their offline fallback. These prove mounted lab geometry,
not live logo availability, dense production chart history or design acceptance.
All 144 named current-workspace screenshots are separate from earlier receipts.

[Affected units](units.json): **277/277**, 25 files, two workers. This includes
the unchanged Staged, Manual, Atomic, Vote Lock and Stake consumers of the shared
lab detail row. App/E2E typecheck and lint/format across 82 affected TypeScript
files pass. The read-only scope inventory fires correctness/product lenses and
no red flags; the V1 design-system checkpoint cadence owns verification breadth.

```sh
pnpm exec vitest run \
  src/views/internal/design-system/auctions-browse/tests \
  src/views/internal/design-system/tests/owned-positions.test.tsx \
  src/views/internal/design-system/tests/discover-family.test.tsx \
  src/views/internal/design-system/tests/discover-motion.test.ts \
  src/views/internal/design-system/tests/component-catalog.test.ts \
  src/views/internal/design-system/tests/catalog-ui.test.tsx \
  src/views/internal/design-system/tests/inventory-reconciliation.test.tsx \
  src/views/internal/design-system/tests/transaction-composition-staged.test.tsx \
  src/components/design-system-v1/tests/source-hygiene.test.ts \
  src/components/design-system-v1/tests/typography.test.ts \
  e2e/helpers/tests/design-system-config.test.ts \
  e2e/helpers/tests/design-system-review-source.test.ts \
  e2e/helpers/tests/design-system-routing.test.ts \
  e2e/helpers/tests/design-system-missing-baseline.test.ts \
  src/views/internal/design-system/tests/transaction-composition-atomic.test.tsx \
  src/views/internal/design-system/tests/transaction-composition-manual-states.test.tsx \
  src/views/internal/design-system/tests/transaction-composition-manual-lifecycle.test.ts \
  src/views/internal/design-system/tests/transaction-truth-spectrum.test.tsx \
  --maxWorkers=2 --reporter=json \
  --outputFile=docs/plans/design-system-review-checkpoint-evidence-2026-09-13/units.json
pnpm typecheck
```

Unit stderr includes the existing React `act` deprecation, wallet-library
initialization and a remote test-project configuration 403/fallback warning.
These do not represent a failed test or a wallet signature/broadcast.
Browser startup also emits existing ambiguous Tailwind duration and color-output
environment warnings. No browser assertion failed or was retried.
No full unit suite, unrelated repository integration, CI or production adoption
is claimed. All 81 production auction source fingerprints still match Claude's
retained audit baseline.

The default staged whitespace check reports only a final blank line in three
original terminal logs: `proposal-like-records/unit.log` in Auction browse evidence,
and `final/sort-red.log` plus `final/unit.log` in owned-position evidence. Their
raw bytes are preserved. `git -c core.whitespace=-blank-at-eof diff --cached --check`
passes; no other source/document whitespace defect is waived. All 542 relative
Markdown links resolve. The final preview inventory shows user 3005 still on its
original PID 3149 and no owned 3022 listener.
