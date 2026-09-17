# Accelerated Components documentation receipt

## Result

`implementation-verified; human visual review required`

The Components destination is now a continuous, anchored reference for all 45
typed catalog entries in catalog order. It shows 28 lightweight canonical-owner
specimens, three accepted isolation slots, three pattern slots, six Exploring
treatments, and five undefined/not-planned treatments. It does not mount full
state sheets or heavy review workspaces.

This is a local documentation candidate. It does not accept new design-system
authority, migrate production, or change component APIs/defaults. Nothing was
committed, pushed, published, stashed, reset, or served on port 3042.

## Authority and approved deviation

The typed component catalog, accepted decisions, and canonical implementation
owners remain authoritative. A live specimen is now mounted only when both its
ID has a documentation-owned specimen and its current derived design status is
`accepted`; a later catalog demotion therefore removes the live specimen.

The authorized packet projected 31 accepted direct owners. The first standalone
build proved that direct imports of Global navigation, Product navigation, and
Copyable value pulled product and wallet dependencies into the standalone
artifact: 8,203 transformed modules and a 1.88 MB main chunk containing wallet
code. The coordinator approved preserving standalone isolation instead. Those
three entries remain Accepted, retain their canonical detail links, and render
explicit isolation slots; this does not claim that the components themselves
require providers at runtime. The repaired build transforms 2,008 modules, emits
an 867.44 kB main chunk, and contains no Reown, RainbowKit, WalletConnect, Wagmi,
ConnectKit, or Coinbase Wallet matches outside source maps.

## Rendered evidence

- First complete candidate: [`evidence/first`](evidence/first) — 40 captures.
- Final affected surface: [`evidence/final`](evidence/final) — 40 captures.
- Integrity list: [`evidence/SHA256SUMS`](evidence/SHA256SUMS).
- Standalone artifact facts:
  [`evidence/standalone-artifact-summary.txt`](evidence/standalone-artifact-summary.txt).
- Provider/artifact guard:
  [`evidence/provider-scan.txt`](evidence/provider-scan.txt).

The rendered matrix covers light and dark at 320, 390, 768, and 1400px, plus
every family at representative phone and desktop widths. Browser assertions
cover all 45 entry sections, all eight family anchors and direct anchor reloads,
horizontal containment, keyboard activation for Checkbox, Segmented control,
and Accordion, and Button/Dialog/Chart detail-route reloads. This is honest
representative detail coverage; all 45 detail routes were not individually
opened and reloaded.

## Verification

- RED: the first focused unit failed because the row-only overview had no
  continuous entry sections or canonical outputs.
- RED: the authority-gating unit failed with
  `canMountDocumentationComponentSpecimen is not a function` before the guard
  existed.
- GREEN: focused Components unit — 4/4 passed.
- GREEN: final Components browser matrix — 2/2 passed on isolated port 3059.
- GREEN: documentation-shell compatibility — four unaffected checks passed in
  the complete run; the two stale Components assumptions then passed a focused
  2/2 rerun after repair on isolated port 3060.
- GREEN: focused broad-lab compatibility — 1/1 passed after updating the Tabs
  detail-link seam on isolated port 3022.
- GREEN: standalone desktop/mobile runtime — 12/12 passed with no provider,
  external-request, or WebSocket startup.
- GREEN: application TypeScript and E2E TypeScript.
- GREEN: scoped Oxlint and Prettier.
- GREEN: Spanish, Korean, and Chinese gettext catalogs pass `msgfmt --check`;
  no untranslated entry remains for the Components page, overview, or specimen
  modules.
- GREEN: standalone production build and artifact/provider scan.
- GREEN: `git diff --check` and wiki lint.
- PARTIAL: the required broad gate passed repository TypeScript and lint, then
  the full unit run reported 1,413 passed and one unrelated filesystem-watcher
  harness failure in
  `e2e/helpers/tests/design-system-review-source.test.ts`. A focused retry
  reproduced `watcher-error` with 6/7 checks passing. This task did not edit the
  watcher or its test; the scoped Components unit, browser, build, runtime,
  compatibility, and localization evidence above is green.

Known build warnings are pre-existing Tailwind arbitrary-duration ambiguity,
font URLs intentionally resolved at runtime, and Vite's standard chunk-size
advisory.

## Scoped identity

Base ref: `02434707c0614d2262b10560eebb05cde4319931`.

| Existing path                       | Actual pre-edit blob                       | Returned blob                              |
| ----------------------------------- | ------------------------------------------ | ------------------------------------------ |
| `canonical-components-overview.tsx` | `f69fa201255f23331240712e5c62024e410359e1` | `b7f4be9d1aff1467b1ca7123ef47434daf14c39a` |
| `documentation-components-page.tsx` | `cc04b2c04290a3ad2bfd703e05d8321f966dccee` | `1d3c59a640ea031733d8faa95526641bed770f34` |
| `e2e/design-system/lab.spec.ts`     | `570c266ce2a82bdaaaff594e66c1c8e993526b2b` | `13be739a720379b16ea9692ff68d8c051398ad5f` |

`documentation-shell.spec.ts` was a concurrently created untracked shell-owned
file. Only its stale Components assertions were updated; its returned blob is
`7c2fcf34b290f28cdd015cf7a3ac77e6ac2b49a2`. Locale catalogs are shared dirty
files; this task changed only extracted Components messages and their es/ko/zh
translations.

| New Components-owned source/evidence path            | Returned blob                              |
| ---------------------------------------------------- | ------------------------------------------ |
| `documentation-component-specimens-actions.tsx`      | `37e868f4cb618a6e84176a107ac3238dcf6e9b38` |
| `documentation-component-specimens-data.tsx`         | `905f81f853200ae564890a3ba91a8e0ac3ac7e36` |
| `documentation-component-specimens-disclosure.tsx`   | `8747abdb3f237e15fe3c09816aaeb877531dd099` |
| `documentation-component-specimens-feedback.tsx`     | `eef7a4981de982c5611905b137af49809cc12801` |
| `documentation-component-specimens-fields.tsx`       | `9479ef8079c0d6bd5171703c5835f8689abbe11a` |
| `documentation-component-specimens-navigation.tsx`   | `fcd3230804bf3f6b422aecfbdd8290518ae40b2f` |
| `documentation-component-specimens-overlays.tsx`     | `38be588f2e2158301c60311487c0f9b572b55cae` |
| `documentation-component-specimens-selection.tsx`    | `57aea7235570739d0dd7dd3a09b7056920302721` |
| `documentation-component-specimens.tsx`              | `779d55bf470ad9b4beecfad3494b880bcad36f48` |
| `tests/components-documentation.test.tsx`            | `5607e343161642b752f5f337fbc7061bd7583569` |
| `e2e/design-system/components-documentation.spec.ts` | `b1dfee6ee6e960888a8cd96c888be48e2c95cff6` |
| `playwright.design-system-components.config.ts`      | `74e546d0592c927d1709b211f4503da7c5820e78` |

Evidence file hashes are intentionally kept in `evidence/SHA256SUMS` rather
than repeated here.

## Repair log and pilot evaluation

Three substantive repairs were required:

1. **Bad composition / implementation error:** direct Navigation and Copyable
   value imports violated the provider-free standalone artifact boundary. The
   coordinator approved three truthful isolation slots. The production build
   caught this before human review.
2. **Implementation completeness error:** the Components page description was
   initially left untranslated in es/ko/zh. Independent Intent review caught it;
   all Components-slice messages are now translated and validated.
3. **Implementation error:** the direct-specimen allowlist was not gated by
   current catalog authority. Independent Engineering Risk review found it. A
   focused RED/GREEN unit now proves an accepted owner mounts and the same owner
   does not mount when its design status is Exploring.

Non-substantive harness repairs: element/full-page screenshots were clipped by
the internal scroll owner and were changed to viewport captures after scrolling;
strict duplicate selectors were scoped; existing shell/lab assertions were
updated to the new stable detail-link and group-anchor seams.

Pilot classification:

- Correct authority retrieved: **yes** — all 45 identities and statuses come
  from the typed catalog and existing presentation projection.
- Correct precedent chosen and applied: **yes** — 28 specimens use real
  canonical owners; no substitute product compositions were invented.
- Approved human decisions preserved: **yes** — continuous result-first
  browsing, progressive detail links, status honesty, and no production
  adoption changes.
- Substantive repairs: **3**.
- Causes: one bad composition/import-boundary error and two implementation
  completeness/correctness errors; no repair was purely subjective refinement.
- Focused verification caught failures before human review: **partly** — build
  verification caught the dependency regression and browser checks caught stale
  compatibility seams; independent reviews caught localization completeness and
  the missing authority guard. No human visual acceptance has occurred.
- Model/reasoning control: inherited parent settings remained fixed throughout
  implementation and repairs.

## Morning human review

Review the final light/dark overview at 1400 and 390 first, then check:

1. Whether the metadata/specimen balance supports fast casual scanning.
2. Whether the three accepted isolation slots explain the build boundary
   without implying a component runtime limitation.
3. Whether wide controls such as Pagination remain comfortable rather than
   merely contained at 320/390.
4. Whether Exploring and undefined treatments are honest without becoming
   visually dominant.
5. Whether dark-theme canvas contrast and family separation feel deliberate.

No engineer review is required for component behavior because canonical APIs,
defaults, providers, product behavior, and catalog authority were not changed.
Human visual review remains required before this candidate is described as
accepted or collaborator-ready.
