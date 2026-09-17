# Standalone documentation entry receipt

Status: **implementation-verified; Engineer review required**. Base
`02434707c0614d2262b10560eebb05cde4319931`. No commit, push, publication,
catalog change, content migration, product-provider edit, or port 3042 action
occurred.

## Outcome

The design-system documentation now has a dedicated Vite/React entry that
mounts the verified S2a-1 shell at the existing
`/internal/design-system/*` paths without mounting the product `App`, wallet or
chain providers, updater tree, analytics/telemetry startup, referral capture,
product chrome, chat, or Toaster. The ordinary in-app route remains available
through the original product entry.

The standalone entry reuses the existing router, catalogs, localization,
Jotai defaults, tooltip support, theme CSS, search, aliases, and shell. Its
production artifact contains only the documentation application, five locale
chunks, one SPA fallback, a favicon, and three fonts. It does not copy the
product public tree.

## Compatibility boundary and honest semantic gap

Button keeps its real state sheet in the standalone artifact. Non-Button detail
pages are **catalog-sourced compatibility placeholders**, not migrated or
accepted component documentation. They preserve route identity, status, and
the catalog record while explicitly stating that the complete legacy specimen
remains in the in-app lab.

There is intentionally no working in-page link from that notice to the in-app
lab yet. The standalone and product entries currently share the same path, and
the hosted hostname/access decision is deferred to U11/U12. Adding a guessed
link would misrepresent the hosting contract. This limitation must remain
visible in the S2a-2 handoff; it is not a completed consumer handoff.

## Architecture

- `vite.design-system.config.ts` owns the independent HTML entry, build output,
  dedicated static surface, and a build-only alias for component details.
- The ordinary application statically imports
  `component-detail-entry.ts`, which eagerly re-exports the complete legacy
  detail renderer. The standalone build resolves only that boundary to its
  compatibility renderer. Ordinary product loading behavior therefore remains
  eager and unchanged.
- The standalone root mounts `BrowserRouter`, Jotai `Provider`,
  `LanguageProvider`, `TooltipProvider`, the existing design-system router, and
  the preserved `#app-container` scroll owner.
- A dedicated `_redirects` file retains direct SPA deep links without copying
  product sitemap, robots, manifest, AI/DTF content, imagery, or metadata.
- HTML includes `noindex, nofollow` as a local safeguard. Hosted response-header
  enforcement, access control, URL/hostname, and Records exposure remain the
  later U11/U12 decisions and are not claimed here.

## Scoped identity

This is an owned-path snapshot, not a repository-wide dirty-tree manifest.
Substantial unrelated work remains preserved.

### Pre-existing owned files

| Path                                                                        | Starting blob                              | Returned blob                              |
| --------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| `package.json`                                                              | `0f62d7050863c4c919fdd0dda9c24aa5bc06bd6d` | `9e27adcbb7fff4c070fb6b2fce72380b8fa7158b` |
| `src/views/internal/design-system/index.tsx`                                | `f2e7973bf8ab45a3c4ed8bb1fe111adfc4029416` | `638f561702d37e8ed127af1d7f540f3d10c8d723` |
| `src/views/internal/design-system/tests/documentation-presentation.test.ts` | `e5c824aa75acd88d729acea55912e286ef46081a` | `f1971f6dc9f1defa387d5bb0125a2708c19c4744` |
| `src/locales/en.po`                                                         | `42e10525856e31ab6f3437253a1a7a6da23c9e71` | `b8feda90d88869055d76a8eb60c95df702b3b974` |
| `src/locales/es.po`                                                         | `9a292f4eb4abcba25abc28228845836a94985211` | `b90fd941b41551c4a4bd8eabb9359b9132dc0a7d` |
| `src/locales/ko.po`                                                         | `f6442c710c520f5178a44c87e2cfc9d698e67ee1` | `0ca6c17888ba65b2fb49d627eceefce7c12b9aa9` |
| `src/locales/zh.po`                                                         | `ae5d8527503e04fc9670711983ce6bb9903bbdfc` | `b1d30fdc90d03f69bf16226e9c05dd8d42feddb3` |

The locale starting blobs are the returned S2a-1 fixed point. This slice adds
only the two compatibility-boundary messages; it does not own the earlier shell
catalog additions.

### Closeout documentation

| Path                                                   | Starting blob                              | Returned blob                              |
| ------------------------------------------------------ | ------------------------------------------ | ------------------------------------------ |
| `docs/plans/design-system-documentation-experience.md` | `3cb341ba96a30aa8614f546caa5d2143f525c430` | `6df869d5f79878b26fb28e0d9a2f774a89654165` |
| `docs/plans/design-system-engineering-handoff.md`      | `c23a94062bba02beb41311296f2995b4b80e3bc7` | `05a66a2c1a62608029199b42e2f49df72c05d795` |
| `docs/wiki/progress.md`                                | `4605b5ec42e214bface30c4c17a1760d88f36b56` | `ae3907042b3ba791189ca2a716cbef6a7aa8eaa4` |
| `docs/wiki/log.md`                                     | `9b197d8cee350d845e54a303001012148cba0f11` | `47a6a67a72a32dc91c8b4cf7a97293e9b70ed4ca` |

These files were pre-existing authorized dirty inputs. The slice changes only
the stale S2a-entry status/next-action claims, adds the build/routing engineer
review row, and appends the dated closeout summary.

### New owned files

| Path                                                                      | Returned blob                              |
| ------------------------------------------------------------------------- | ------------------------------------------ |
| `vite.design-system.config.ts`                                            | `bf4c34d41172293c5668d68fbc2e98a0f8ecbd9a` |
| `playwright.design-system-standalone.config.ts`                           | `f134cdda0d3c6002f2d14a1fdd89e2a20b3a082a` |
| `src/views/internal/design-system/component-detail-entry.ts`              | `1d2170530f993b178feae921213a1f35b13360bf` |
| `src/views/internal/design-system/standalone/index.html`                  | `5477f60701eaa58a464d393d5a3c5571f930fb2d` |
| `src/views/internal/design-system/standalone/index.tsx`                   | `2602209a3f5509b1bf3198aa1335edfd86322f50` |
| `src/views/internal/design-system/standalone/component-detail.tsx`        | `30efb3dc8adb8276498278f8e573c553a8c4bf93` |
| `src/views/internal/design-system/standalone/public/_redirects`           | `7797f7c6a7356b0d451d11a49925df854c22e978` |
| `src/views/internal/design-system/tests/standalone-entry.test.ts`         | `4241b62e2bef9b4e56bdf7167bd8a0591655737d` |
| `e2e/design-system/standalone-entry.spec.ts`                              | `07864970df6b4fc1a93f9b6c4083756c48f34746` |
| `docs/plans/design-system-standalone-entry/evidence/SHA256SUMS`           | `5fb313d056a1ace6cea74af37c6b5b27fbf0f6a8` |
| `docs/plans/design-system-standalone-entry/evidence/artifact-summary.txt` | `be1f033aead31e534ebb0ea9b840ea49091dbd1e` |
| `docs/plans/design-system-standalone-entry/evidence/runtime-summary.txt`  | `1709c94e482792ae0de27e86d7aba34f44c6b947` |

## RED and GREEN evidence

RED was preserved at the real seams:

- the standalone source guard failed before the HTML, React, and Vite entries
  existed;
- the current product-root documentation route called the injected provider
  twice with `eth_accounts`;
- the first standalone build still emitted the legacy component graph and an
  approximately 2.56 MB component chunk, exposing wallet/RainbowKit code;
- independent review found the first isolation boundary had made the product
  detail route lazy, the whole product public tree was copied, mobile zoom was
  restricted, and fresh provider tracing did not yet cover detail routes.

Final GREEN:

- focused source/projection units: 11/11;
- fresh standalone production build: 1,967 modules, 20 files, 7,900 KiB;
- forbidden artifact scan: zero matches for product entry, chain/updater,
  analytics/telemetry, or wallet connector identifiers;
- standalone production browser matrix: 10/10 across desktop/mobile fresh
  Start, Components, Button, and Chart contexts plus direct reloads;
- existing shell behavior against standalone: 10/10;
- ordinary application compatibility: 1/1;
- application and E2E TypeScript, scoped Oxlint, Prettier, and en/es/ko/zh/pseudo
  gettext checks: pass.
- the broad inherited-tree unit run passed 1,404/1,405 in the sandbox; its sole
  known native filesystem-watcher case then passed 7/7 with the macOS backend.

Exact artifact and runtime facts are retained in
[`evidence/artifact-summary.txt`](evidence/artifact-summary.txt) and
[`evidence/runtime-summary.txt`](evidence/runtime-summary.txt).

## Render evidence

First and final Start/Components renders are retained at 1400px and 390px under
[`evidence/first`](evidence/first) and [`evidence/final`](evidence/final). They
were visually inspected against the S2a-1 shell precedent: neutral chrome,
sidebar/mobile navigation, hierarchy, spacing, and the existing intermediate
Components index are preserved. Exact hashes are in
[`evidence/SHA256SUMS`](evidence/SHA256SUMS).

## Pilot evaluation

| Question                                                         | Result                                                                                                                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Correct authority retrieved?                                     | Yes. Existing shell/router/catalogs and S2a-1 receipt remained the source.                                                                                                      |
| Correct precedent chosen and applied?                            | Yes. The standalone renders preserve the verified S2a-1 shell rather than introducing a new visual treatment.                                                                   |
| Approved human decisions preserved?                              | Yes. Paths, aliases, product compatibility, no content migration, no publication, and port isolation were retained.                                                             |
| Substantive repairs required?                                    | Six, all implementation/verification errors; no subjective refinement or bad composition.                                                                                       |
| What failed?                                                     | Legacy graph leakage; brittle import-boundary assertion; changed product loading semantics; copied product public tree; disabled mobile zoom; incomplete fresh-context tracing. |
| Did focused verification catch the failures before human review? | Yes. Build inspection, units, runtime instrumentation, and independent Intent/Risk review found every repair before handoff.                                                    |
| Model/reasoning fixed?                                           | Yes. The implementation owner retained inherited settings throughout the pilot.                                                                                                 |

## Review reconciliation

- Intent P1, missing durable proof: confirmed and fixed by this receipt plus
  artifact/runtime/hash evidence.
- Intent P2, lazy ordinary product details: confirmed and fixed with the static
  product boundary plus standalone-only build alias.
- Risk Important, copied product public tree: confirmed and fixed with a
  dedicated public surface and four explicitly copied assets.
- Risk Important, `maximum-scale=1`: confirmed and removed.
- Risk Minor, unignored default output: confirmed and fixed by using
  `build/design-system`, already covered by the repository's `/build` ignore.
- Risk coverage gap, fresh detail contexts: confirmed and fixed with Button and
  Chart provider/network cases at both breakpoints.

The affected-axis Intent and Engineering Risk re-reviews both pass with no
remaining Critical or Important blocker.

## Remaining risks and next boundary

- **Engineer review required:** this adds a shared routing/build boundary and
  must be reviewed before publication or production adoption.
- The main documentation JavaScript is 785.85 kB decoded / 229.29 kB gzip and
  CSS is 219.34 kB / 36.16 kB gzip. Wallet/product startup code is absent, but
  later content slices should still watch documentation payload growth.
- Non-Button standalone component pages are compatibility records, not migrated
  specimens. Color S2a-2 may begin only after this infrastructure handoff is
  accepted; it must not treat these placeholders as proof of the future
  component-page template.
- Hosted access, response-level noindex policy, Records exposure, hostname, and
  any cross-entry link remain U11/U12 decisions. No publishable preview is
  claimed.

No component content, foundation content, Charts guidance, Toast, Progress,
catalog authority, production consumer, or shared component default changed.
