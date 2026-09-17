# Documentation shell S2a-1 receipt

## Disposition

S2a-1 is **implementation-verified; human-review-required** against fixed point
`02434707c0614d2262b10560eebb05cde4319931`. The shell is ready for human and
engineer review, but it is not accepted, published, or a component migration.
The required provider rerun triggered the planned stop before S2a-2: the docs
routes still initialize the application's full wallet/RPC/analytics boundary.

No provider, catalog authority, component family, production consumer, shared
component default, Git ref, stash, commit, or remote was changed. Typography,
Button, Charts, Select, Toast, and Progress were not migrated or modified.

## Result

- Exact `/internal/design-system` routes omit the product header and chat while
  retaining `#app-container` as their scroll owner. All other app routes retain
  their existing layout.
- The documentation shell supplies persistent navigation from 768px, a Drawer
  below 768px, grouped keyboard search, theme control, and Start, Foundations,
  Components, Patterns, Workbench, and Internal Records destinations.
- `/internal/design-system` is a Start page. Pattern URLs are presentation
  aliases over existing catalog routes. Existing detail, Studies, Screens, and
  Status routes remain reachable.
- Components is a lightweight 45-row grouped catalog. It does not import or
  mount `ComponentVisualOutput` or the state-sheet trees. Rows expose the
  translated component identity as their accessible name and the derived
  Design, Code, and Production facts as their accessible description.
- Human status is derived as one design status plus Code and Production facts.
  Only `CURRENT_REVIEW` means awaiting human review. The transaction checkpoint
  is an explicit presentation-only `Paused` Workbench record and is not inferred
  from catalog prose or review readiness.
- Search covers every first-class destination, component-group anchor,
  Workbench/Internal Records heading, and all four compatibility aliases. The
  aliases stay in a visibly separate `Legacy lab` result group.
- Patterns/Charts projects the `component:chart` catalog record and links to its
  canonical detail instead of restating authority in free prose.
- Shell-owned copy and all 45 component plus nine foundation identities use
  reactive Lingui messages. Every S2a-owned entry is filled in Spanish, Korean,
  and Simplified Chinese; long catalog descriptions remain on detail pages.
- The lab guide names `documentation-presentation.ts` as the human projection
  owner while preserving catalogs and `CURRENT_REVIEW` as authority.

## Returned scoped snapshot

The handoff deliberately scopes identity to owned paths and evidence; it is not
a repository-wide dirty-tree manifest.

### Pre-existing owned files

| Path                                                                 | Base blob                                  | Returned blob                              |
| -------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| `src/components/layout/index.tsx`                                    | `a08e5f01c7585b8568e68f4b849c88ebddb18eb5` | `0a533f0dacd50bf8ba5bc62e11324652046d1c40` |
| `src/views/internal/design-system/CLAUDE.md`                         | `1ebbfdc837e2cf60de4f88a57307c9cd351e400c` | `488e3379bd189d3eb11610a6206924ede5c625de` |
| `src/views/internal/design-system/canonical-components-overview.tsx` | `00d7fc38bc4b02e8d615afc6ffc056d3b166fd71` | `f69fa201255f23331240712e5c62024e410359e1` |
| `src/views/internal/design-system/components-pages.tsx`              | `ccb74f3604b1315e92f53235f7179460d9342438` | `85d4fa13fda390d12505172669e9e448760b68ce` |
| `src/views/internal/design-system/index.tsx`                         | `7c940254ee044c6d0bf3b28cc58073a8111a97ff` | `f2e7973bf8ab45a3c4ed8bb1fe111adfc4029416` |
| `src/views/internal/design-system/lab-shell.tsx`                     | `a6ea264dce1cb5abb208018b032d1a95c3be235d` | `5cb06b29e6f608093fc5ca1089140358c98a3d02` |
| `e2e/design-system/lab.spec.ts`                                      | `329b3fc4ae73e0fac104aec4ce2fb2102eee21dd` | `0f9d7459d6f5d33ae80e2169f3dc4d81efab889f` |
| `src/locales/en.po`                                                  | `3caa7a661d86d33691e523c32a938ae9e6bbbac7` | `42e10525856e31ab6f3437253a1a7a6da23c9e71` |
| `src/locales/es.po`                                                  | `ab3e184a5ac2c41b5ea18c531188625a8cebc833` | `9a292f4eb4abcba25abc28228845836a94985211` |
| `src/locales/ko.po`                                                  | `8c4c9ffdf4f007c0993fbc34afcdffa684a2586e` | `f6442c710c520f5178a44c87e2cfc9d698e67ee1` |
| `src/locales/zh.po`                                                  | `d613b2ac7137dde8aac15242a91e24a016f2da2a` | `ae5d8527503e04fc9670711983ce6bb9903bbdfc` |

`docs/wiki/progress.md` and `docs/wiki/log.md` were already authorized dirty
inputs and receive only the S2a-1 closeout row/entry from this stage.

### New owned files

| Path                                                                        | Returned blob                              |
| --------------------------------------------------------------------------- | ------------------------------------------ |
| `src/views/internal/design-system/documentation-catalog-messages.ts`        | `75c9653e202201fa1d246b410bffaab5670aad1b` |
| `src/views/internal/design-system/documentation-components-page.tsx`        | `cc04b2c04290a3ad2bfd703e05d8321f966dccee` |
| `src/views/internal/design-system/documentation-navigation.tsx`             | `8ed6d6db0d30ae2cc4e6c24b2ec97a18f051486f` |
| `src/views/internal/design-system/documentation-pages.tsx`                  | `acb98a355805f7c27ac38ad32fa5ad03ecffb638` |
| `src/views/internal/design-system/documentation-presentation.ts`            | `308172f33374863f0b6c7bb54f2822fa5760ae0d` |
| `src/views/internal/design-system/documentation-search.tsx`                 | `3cc6e4bfc2fe97edaf67754ef8ec26aa07d98a88` |
| `src/views/internal/design-system/documentation-toc.tsx`                    | `6888fe1f4f900e36f9780be2856ee1ab3e03958e` |
| `src/views/internal/design-system/tests/documentation-presentation.test.ts` | `e5c824aa75acd88d729acea55912e286ef46081a` |
| `e2e/design-system/documentation-shell.spec.ts`                             | `352de09c4f8a385ea958b5b7b652b0059b8e2236` |
| `docs/plans/design-system-documentation-shell-handoff.md`                   | `1d088ff3f863bac9691a7e9c44a6eb743d9d1af7` |

Each locale blob is reconstructed from its fixed-point catalog plus 165 active
messages referenced by the nine S2a-owned sources. Five existing active entries
were merged and 160 were added; every added source reference resolves to those
nine paths. No unrelated current-tree extraction or reference churn remains.
The first and final PNGs are listed with exact hashes in
[`evidence/SHA256SUMS`](evidence/SHA256SUMS).

## RED, GREEN, and affected-surface evidence

- RED projection/source guard: the new focused Vitest file failed three expected
  projection assertions before implementation.
- RED route seam: the focused Playwright shell test failed because the
  documentation sidebar did not exist.
- RED catalog-description search: exact Button and Motion catalog descriptions
  initially returned no result. The final projection/source guard passes 8/8;
  those descriptions are searchable terms but remain absent from visible
  result summaries.
- RED search identity: the Canonical and Workbench Transaction results rendered
  two options with one DOM ID before the input/index-scoped repair.
- RED hash navigation: the same-path Data display link changed the URL without
  bringing its component group into the app-container viewport.
- Final focused shell behavior: 6/6 passed, covering desktop/narrow navigation,
  unique grouped-search option IDs, direct reload, all five direct pattern alias
  loads, hash-aware active navigation, same-path hash scrolling,
  product-chrome separation, a specimen-free overview, status accessibility,
  translated output, complete destination/heading search, Legacy grouping, and
  scroll reset.
- Existing route compatibility: the desktop `routes through expected and
available capability states` case passed 1/1 in 1.9 minutes after its stale
  `Inspect Tabs` expectation was updated to the row's intentional `Tabs` name.
- Application TypeScript and E2E TypeScript passed independently.
- Scoped Oxlint and Prettier checks passed for every changed source/test path.
- Direct Lingui extraction passed twice after the pnpm wrapper stopped at its
  known non-TTY module-purge guard. The over-broad generated catalogs were not
  retained: fixed-point reconstruction plus the 165 owned messages leaves no
  added reference outside the nine S2a paths. Source-scoped untranslated checks
  are empty for es/ko/zh, and `msgfmt --check --check-format` passes for all four
  catalogs.
- The final production build passed. The lightweight documentation route chunk
  is 393.94 kB decoded / 98.36 kB gzip; detail specimens are isolated in a lazy
  782.57 kB / 190.42 kB gzip chunk. Inherited warnings remain; the largest
  chunks are wallet 5,322.42 kB, main 3,756.70 kB, and performance chart
  1,587.56 kB.
- Final rendered evidence was inspected at 320, 390, 768, and 1400px in light
  and dark. Additional Start, Patterns, Workbench, Records, Button detail,
  Legacy Tables target, and settled narrow navigation captures are retained
  under [`evidence/final`](evidence/final/).
- `scope.mjs --base 02434707c...` selected correctness, product, and complexity
  but its pnpm wrapper stopped at the known non-TTY modules-directory purge.
  The direct installed binaries above are the documented affected-surface
  equivalent. Unmapped plan/PNG files were inspected as documentation/evidence,
  not presented as runtime tests.

### Replay commands

```text
./node_modules/.bin/vitest run src/views/internal/design-system/tests/documentation-presentation.test.ts
DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3051 ./node_modules/.bin/playwright test --config=playwright.design-system.config.ts e2e/design-system/documentation-shell.spec.ts --project=design-system-desktop
DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3051 ./node_modules/.bin/playwright test --config=playwright.design-system.config.ts e2e/design-system/lab.spec.ts --project=design-system-desktop --grep "routes through expected and available capability states"
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/tsc -p e2e/tsconfig.json --noEmit
./node_modules/.bin/vite build --outDir /private/tmp/register-s2a1-build --emptyOutDir
```

## Production provider rerun

The final post-edit production build was served on isolated port 3053. Each
route used a fresh 1400×900 Chromium context, a four-second post-ready window,
blocked every non-loopback HTTP/WebSocket request, and injected a traced
EIP-1193 provider.

| Fact                                |             Components |        Chart deep link |
| ----------------------------------- | ---------------------: | ---------------------: |
| HTTP status                         |                    200 |                    200 |
| Load to ready                       |                 506 ms |                 643 ms |
| Post-ready observation              |               4,001 ms |               4,002 ms |
| External attempts                   |                     67 |                     74 |
| HTTP / WebSocket                    |                 61 / 6 |                 68 / 6 |
| `eth_getBlockByNumber` / `eth_call` |                34 / 16 |                36 / 16 |
| Injected `eth_accounts`             |                      2 |                      2 |
| Body text                           |            4,841 chars |            7,358 chars |
| DOM elements                        |                    840 |                  1,032 |
| App scroll height                   |                4,569px |                4,786px |
| Transferred / decoded local bytes   | 3,247,956 / 11,895,065 | 3,498,380 / 12,866,000 |
| Used JS heap                        |                37.3 MB |                60.3 MB |

Both routes registered four provider listeners and attempted six Binance wallet
WebSockets across the same inherited connector hosts. Neither called
`eth_requestAccounts`, signing, chain switch/add,
transaction send, another write method, legacy `.send()`, or `.sendAsync()`.
There were no dialogs or page errors. The final Chart route attempted five
remote token images; RPC/provider behavior did not vary.

The provider/runtime cost therefore remains materially unchanged from S1.
**Stop before S2a-2 or a shareable preview.** The next architecture decision is
provider isolation versus a standalone documentation entry; standalone is the
current recommendation because it isolates preview/runtime behavior without
changing production-app provider startup.

## Pilot evaluation

| Question                              | Result                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Correct authority retrieved?          | Yes — catalogs, `CURRENT_REVIEW`, the approved plan, and the bounded handoff remained distinct.                                                                                                                                                                                                                                                                                 |
| Correct precedent chosen and applied? | Yes — restrained typography, semantic tokens, flat dividers, result-first content, and visible focus were retained without copying product chrome or card-heavy gateways.                                                                                                                                                                                                       |
| Approved human decisions preserved?   | Yes — U1–U4, U10, U13 and every stated non-goal remain intact.                                                                                                                                                                                                                                                                                                                  |
| Substantive repairs?                  | 11. The first five repaired 768px composition, the static overview/detail import, duplicate search IDs, same-path scrolling, and hash-aware subsection state. Coordinator review added complete destination/Legacy search, localization, typed Charts projection, and row accessibility. Final Intent review narrowed locale ownership and restored catalog-description search. |
| Cause?                                | One bad-composition failure and ten implementation errors. The handoff was sufficient; the first composition and implementation were not.                                                                                                                                                                                                                                       |
| Caught before human review?           | Yes. Rendered inspection caught the composition; focused independent review and RED/GREEN browser checks caught the implementation errors.                                                                                                                                                                                                                                      |

The first render is preserved separately from the final evidence. A Drawer
capture taken mid-transition was recaptured after settled geometry and is not a
repair: the implementation was already correct.

## Independent review reconciliation

- The first Intent/Risk pass found a static specimen import on the overview,
  duplicate grouped-search option IDs, stale receipt hashes, missing direct
  alias proof, and unproved same-path hash behavior. The import boundary and
  search IDs were repaired; direct loads now cover Charts, Tables, Forms,
  Navigation, and Transactions; hash-scroll behavior has a retained RED/GREEN
  test; and this receipt identifies the returned snapshot.
- The affected-axis follow-up found those source repairs effective, then caught
  hash-unaware subsection active states and the still-stale receipt. Subsection
  links now expose exactly one hash-aware `aria-current="location"`, the final
  browser suite and production build were rerun, affected desktop evidence was
  refreshed, and the provider audit was repeated against that build.
- The coordinator closeout then found incomplete destination/Legacy search,
  untranslated shell-owned output, free-prose Charts authority, and an
  accessibility name override on component rows. Each was repaired at the
  presentation layer without changing catalog authority; focused RED/GREEN
  coverage, locale checks, render evidence, compatibility, and the provider
  trace were refreshed.
- The final Intent rerun then rejected broad whole-tree extraction churn and
  generic-only search indexing. Locales were rebuilt from fixed point plus only
  the 165 S2a-owned entries, and catalog names/descriptions became non-rendered
  search terms. RED/GREEN unit and browser search proof, Spanish runtime proof,
  the production build, and the provider trace were repeated after repair.
- `sourceKey` deliberately continues to identify the same authority source
  across Canonical and Workbench search projections. DOM option identity is a
  separate input/index-scoped value and is regression-protected.
- Final affected-axis Intent and Engineering Risk reruns both pass with no
  Critical or Important blocker after the locale-ownership and
  description-search repairs. The remaining provider/entry decision and human
  visual approval are intentional stage gates.

## Coordinator verification

The coordinator independently reran the final projection tests (8/8), focused
shell browser suite (6/6 on isolated port 3054), application and E2E TypeScript,
scoped Oxlint and Prettier, all four locale format checks, evidence SHA-256
verification, wiki lint, and diff whitespace checks. The first browser attempt
could not launch Chromium inside the restricted macOS sandbox; the identical
authorized run passed and the isolated server was stopped afterward. The
pre-existing user preview on port 3042 was already unresponsive at final check
and was neither stopped nor restarted by this stage.

## Remaining review and risk

- **Engineer review required:** route-aware global Layout behavior, navigation,
  deep-link compatibility, and the unresolved provider/entry architecture.
- **Human visual review required:** shell hierarchy, density, search/navigation,
  narrow Drawer, and the simplified status projection.
- The production title remains inherited as `Reserve app | DTFs`; publication,
  preview access, `noindex`, and Internal Records exposure remain U11/U12 work.
- Legacy aliases and existing detail pages are compatibility bridges, not proof
  that content migration is finished.
- No full repository-wide gate is claimed. The checkout contains substantial
  unrelated authorized work, and this lab-only stage follows the project's
  affected-surface cadence.
