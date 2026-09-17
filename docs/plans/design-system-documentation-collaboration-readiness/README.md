# Collaboration-readiness polish receipt

Status: **implementation-verified; human visual review required**

This reversible presentation-only slice makes the existing standalone design-system documentation easier and more truthful for designers and engineers to consume. It does not accept the visual result, change design-system authority, migrate production, or publish anything.

## Scope and identity

- Fixed point: `02434707c0614d2262b10560eebb05cde4319931`.
- Execution: shared checkout, isolated verification ports 3063/3064; port 3042 was not touched.
- Authority preserved: catalogs, accepted decisions, component APIs/defaults, frozen Chart/Table/Transaction/navigation owners, product routes, and provider/build architecture.
- No commit, push, stash, reset, publish, or production migration occurred.

Owned implementation paths:

- `src/views/internal/design-system/documentation-presentation.ts`
- `src/views/internal/design-system/canonical-components-overview.tsx`
- `src/views/internal/design-system/lab-shell.tsx`
- `src/views/internal/design-system/documentation-pages.tsx`
- `src/views/internal/design-system/screens-page.tsx`
- `src/views/internal/design-system/layout-studies-page.tsx`
- `src/views/internal/design-system/standalone/component-detail.tsx`
- `src/views/internal/design-system/foundations-pages.tsx`
- `src/views/internal/design-system/tests/documentation-presentation.test.ts`
- `src/views/internal/design-system/tests/components-documentation.test.tsx`
- `e2e/design-system/collaboration-readiness.spec.ts`
- `e2e/design-system/documentation-shell.spec.ts`
- `playwright.design-system-collaboration-readiness.config.ts`
- the 13 newly extracted documentation messages only in `src/locales/{en,es,ko,zh}.po`

Returned implementation blob IDs, in the first eight source-path order above:

```text
9015f4c54d951b08ad3dafd850c774a6adb509aa
89184e0cd1c7c411b0e72d9260b63d6f233ebbe0
978eaf0ad0dc9fd50a2b0ad2f1e28c802db8f210
101804bf36824cd863055904f79d9338fe3831a3
8cdb778eb5ac802cb6632b91e3b2d3f4a47e0d22
626129b7ff9daf388bc9ea3a8b3cafe63234ac0f
5b1fe2b91635ce1c6d1a2dfd4307f905a4a78f1f
4889af32246675e3892d943cc8153117ca411c70
```

Starting blob IDs for shared/previously dirty paths are retained in the task record. `layout-studies-page.tsx` and `screens-page.tsx` were clean at task start and can be compared with the fixed point. Locale ownership is limited to the 13 extracted messages; the files otherwise contain concurrent dirty work.

## Result

Nine substantive repairs were made:

1. Sidebar and search now lead to result-first overview anchors rather than legacy supporting-detail pages.
2. Exact search matches rank deterministically, and Pattern results precede conflicting group/component labels; Chart, Table, Form, and Navigation resolve to Patterns while Select resolves to its component.
3. Mobile hash restoration measures the visible sticky header and leaves context below it.
4. Mobile component entries place the real result before Code, Production, and detail metadata while preserving the desktop grid.
5. Standalone Workbench and Product Contexts no longer promise integrated review/product routes they cannot open.
6. Studies and Internal Records now state their mixed-status and summary-projection boundaries explicitly.
7. Supporting component/foundation detail pages provide escape paths back to the canonical overview result.
8. Pattern concept aliases now use localized descriptors, so translated exact searches retain Pattern precedence; the Spanish `Tabla` journey is pinned in the browser suite.
9. Re-activating the current hash destination after scrolling away now restores its target by observing React Router navigation identity.

Three browser-harness adjustments were needed during implementation: the ambiguous `Product contexts` selector was scoped to Workbench content; the canonical Foundations assertion was narrowed to its named return link; and the same-hash journey was exercised through search because the sidebar intentionally lists component groups rather than every component. These were test composition, not product behavior repairs.

## RED and GREEN evidence

The initial focused unit RED run failed the intended seams: component and foundation destinations still targeted details, exact ranking/Pattern precedence was absent, and mobile component output followed metadata.

The final focused unit run is green: 14/14 tests across `documentation-presentation.test.ts` and `components-documentation.test.tsx`. The broader standalone provider/direct-route suite is green: 14/14 at desktop and mobile breakpoints. Application TypeScript, E2E TypeScript, scoped Oxlint, scoped Prettier, all three translated catalog checks, and wiki lint are green.

The final collaboration-readiness suite completed 4/4 in isolation on port 3063. It covers overview-first destinations, translated exact-search precedence, same-URL anchor restoration, mobile result order and anchor context, truthful secondary destinations, compatibility returns, and the retained final renders. An earlier concurrent rerun rendered blank pages on one port; those harness-only failure screenshots are not retained as product evidence.

## Evidence

Retained final renders live in `evidence/final/`:

| Artifact                            | SHA-256                                                            |
| ----------------------------------- | ------------------------------------------------------------------ |
| `components-button-dark-mobile.png` | `5ffff22689f48f7afed736f3dd354b866bca00fe1fd669f3e8838f3bb33e395b` |
| `components-button-mobile.png`      | `7e450162f818b1cdaf341e02159c2c3b685e436198dcb3e8dd138ea42c3c3947` |
| `icon-button-detail-mobile.png`     | `f14a82bf74500be52c35a7941a2447ea220fc3da8ef5b977b0faf8fd2ad6fcae` |
| `patterns-charts-dark-mobile.png`   | `874830026d5e3c58970b5bda2bec93a0314b778b60d7c3c3c4a07830c0daae4b` |
| `patterns-charts-mobile.png`        | `4fa78f161fbd6f4d8430d2c92c86fa3427f4f19c5722b77104524109b8f85be8` |
| `records-dark-desktop.png`          | `2b213fa5ed68de9b13db008ca797ed4c6775728222bb5a98eb0e82d33253f42d` |
| `records-desktop.png`               | `c8ae8daeee170e2f0dec0f80b4469e2cd0a2542a416db3069021dbe6a93ba548` |
| `studies-desktop.png`               | `c0202666658816f4fb7c24a2ee0806faa22ef3e1cd11a3c6e0a5a44677f943dd` |
| `workbench-desktop.png`             | `fd43a18837826882e13876c70cb03707574ed97d333dbb48c6bc877f0252ee4a` |

The files in `evidence/before/` are failed blank capture attempts made before React rendered. They are explicitly excluded as visual evidence. The valid before-state evidence is the initial RED output, recorded starting blobs, and the coordinator's retained newcomer audit/captures.

Visual inspection of the valid final renders confirmed result-before-metadata hierarchy on mobile, visible anchored headings beneath the sticky header, truthful Workbench/Studies/Records boundaries, and usable light/dark composition. Human visual approval remains intentionally outstanding.

## Independent review

- Intent review: pass; no actionable P0/P1/P2 findings. It confirmed result-first browsing, overview-first retrieval, mobile hierarchy, truthful standalone boundaries, and unchanged authority/frozen-owner surfaces.
- Engineering Risk review: the initial review found two P2 issues—localized Pattern precedence and same-hash restoration. Both were repaired, covered in the isolated browser suite, and passed focused re-review with no remaining actionable finding.

## Known remaining items

- Human visual review is required; this receipt does not mark the presentation accepted.
- The narrow project-status/adoption matrix remains horizontally scrollable and difficult to read (P2). No safe tiny redesign was attempted in this polish slice.
- The pre-existing standalone routing/build boundary retains its earlier engineer-review requirement. This slice did not change that architecture and does not add a new engineer-review surface.

## Pilot evaluation

- Correct authority retrieved: yes; overview receipts and approved U14-U17 decisions governed the slice.
- Correct precedent applied: yes; continuous Foundations, Components, and Patterns overviews remained the primary rendered precedent.
- Approved human decisions preserved: yes, confirmed by independent Intent review.
- Substantive repairs: nine, listed above.
- Failure causes: the nine repairs address accumulated presentation/routing composition and truthful-boundary gaps; three later adjustments were browser-harness composition. No authority or implementation-family defect was introduced.
- Focused verification caught problems before human review: yes for routing, translated ranking, same-hash restoration, DOM order, isolation, localization, compatibility, and light/dark render coverage.
