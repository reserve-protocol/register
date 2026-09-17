# Accelerated Foundations documentation receipt

Status: **implementation-verified; human visual review required**

## Outcome and scope identity

The Foundations gateway is now one continuous, anchored, result-first reference
covering Color, Typography, Spacing & density, Radius, Layout & responsive
structure, Elevation, Motion, Iconography, and Accessibility. Color is the
complete primary reference for currently owned semantic roles; the other eight
sections provide truthful current summaries without inventing open authority.

Every pre-existing direct foundation route remains reachable as supporting
detail. Authority, implementation notes, and history are collapsed by default.
Visible status language is limited to `Accepted` and `Exploring`. Catalogs,
tokens, shared component defaults, production behavior, the standalone runtime,
and the user preview on port 3042 were not changed by this slice.

The handoff fixed point was Git tree
`02434707c0614d2262b10560eebb05cde4319931`. The two shared dirty inputs were
preserved: `foundations-pages.tsx` started at blob
`22122471449c8e7e7dd71aad54c984ed3d109ae6`; `lab.spec.ts` started this task's
authorized edit at blob `0f9d7459d6f5d33ae80e2169f3dc4d81efab889f`.
The standalone trace file retained the accepted standalone-entry receipt blob
`07864970df6b4fc1a93f9b6c4083756c48f34746` before the one-route matrix addition.

## Authority and unresolved boundaries

Authority retrieval score: **9/9 foundation records matched to their named
catalog and implementation owners**.

The presentation does not settle these open questions:

- exact Elevation shadow recipes;
- generalized promotion of 12px or 48px into the spacing ladder;
- exact Layout outer width, gutters, support-rail width, or proportions;
- future categorical chart colors without a real multi-series need;
- production adoption or legacy raw-color cleanup.

The Color reference explicitly preserves the current Dialog exception: the
floating `--popover` owner covers temporary anchored surfaces, while canonical
Dialog currently uses the content-surface owner.

## RED and GREEN evidence

The focused unit seam was written before implementation. Its first run failed
three aggregate behavior assertions against the nine-card gateway: continuous
sections did not exist, primary results did not precede secondary detail, and
the complete Color semantic reference did not exist.

Final GREEN:

- focused Foundations and standalone-entry units: 8/8;
- application TypeScript and E2E TypeScript: pass;
- scoped Oxlint and Prettier: pass;
- responsive standalone Foundations matrix: 2/2;
- fresh desktop/mobile standalone provider/network trace: 2/2;
- existing broad lab route-compatibility check: 1/1;
- standalone production build: 1,971 modules and 20 files;
- artifact boundary scan: zero forbidden product-startup, analytics, telemetry,
  or wallet-connector matches;
- es/ko/zh catalog validation: 143/143 Foundations messages translated in each
  locale, zero untranslated scoped entries, and `msgfmt --check --check-format`
  green.

Exact final commands:

```text
pnpm exec vitest run src/views/internal/design-system/tests/foundations-documentation.test.tsx src/views/internal/design-system/tests/standalone-entry.test.ts
pnpm exec tsc --noEmit
pnpm exec tsc -p e2e/tsconfig.json --noEmit
pnpm exec oxlint <owned Foundations TS/TSX and E2E paths>
pnpm exec prettier --check <owned Foundations TS/TSX, E2E, and plan paths>
FOUNDATION_EVIDENCE_PHASE=final pnpm exec playwright test --config playwright.design-system-foundations.config.ts
pnpm exec playwright test --config playwright.design-system-standalone.config.ts --grep 'boots /internal/design-system/foundations'
pnpm design-system:docs:build
msgfmt --check --check-format -o /dev/null src/locales/{es,ko,zh}.po
git diff --check
node scripts/llm-workflow/wiki-lint.mjs
```

Production artifact facts and runtime isolation are retained in
[`evidence/artifact-summary.txt`](evidence/artifact-summary.txt) and
[`evidence/runtime-summary.txt`](evidence/runtime-summary.txt).

## Render evidence

The preserved first output is under [`evidence/first`](evidence/first). The
post-review result is under [`evidence/final`](evidence/final), covering light
and dark at 320, 390, 768, and 1400px plus focused Color, Layout, and Elevation
captures. `evidence/SHA256SUMS` binds the sources, receipt, summaries, and render
files to this handoff.

## Repair log and pilot evaluation

Eight substantive repairs were required:

1. Removed a sticky in-page navigation treatment that competed with mobile
   documentation chrome — bad composition.
2. Repaired invalid Color section ID references — implementation/accessibility
   error.
3. Removed invented Layout ratios and widths — authority/composition error.
4. Expanded Color to cover all current semantic and performance owners —
   incomplete authority composition.
5. Replaced machine-facing status and misleading “full reference” wording —
   instruction/presentation mismatch.
6. Narrowed floating-surface guidance and exposed the canonical Dialog
   exception — authority error.
7. Routed newly authored visible copy through Lingui and filled es/ko/zh —
   missing project-rule implementation.
8. Replaced inline spacing geometry with explicit token classes —
   implementation-rule error.

Four verification-harness repairs were also made: an ambiguous anchor selector,
viewport evidence capture, one authorized stale broad-lab assertion, and moving
the provider/network proof into the already selected standalone trace matrix.

| Pilot question                                               | Result                                                                                                                                                                                  |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Correct authority retrieved?                                 | Yes; all nine records and named implementation owners were checked.                                                                                                                     |
| Correct precedent chosen and applied?                        | Yes; the verified standalone shell and result-first reference hierarchy were preserved.                                                                                                 |
| Approved human decisions preserved?                          | Yes; continuous browsing, result-first order, collapsed depth, simple statuses, stable direct routes, and no authority rewrite remain intact.                                           |
| Substantive repairs required?                                | Eight; listed above.                                                                                                                                                                    |
| Failure causes?                                              | Bad composition, authority retrieval/composition gaps, implementation errors, and missing project-rule application; no late subjective redesign was required.                           |
| Did focused verification catch failures before human review? | Partly. Units and browser checks caught structure, overflow, accessibility, and route issues; independent Intent/Risk review caught the authority and localization gaps before handoff. |
| Model/reasoning fixed?                                       | Yes; the implementation owner retained inherited settings throughout the pilot.                                                                                                         |

Intent review and Engineering Risk re-review both pass with no remaining
Critical, Important, or Minor finding in scope.

## Returned identities

| Path                                                                        | Returned blob                              |
| --------------------------------------------------------------------------- | ------------------------------------------ |
| `src/views/internal/design-system/foundations-pages.tsx`                    | `bac62f68cca73eece35af23afca55a4e2ec35ca2` |
| `src/views/internal/design-system/foundation-documentation-overview.tsx`    | `e41e1a4665ad791a4f86c0afd99cca9983b7eb0e` |
| `src/views/internal/design-system/foundation-documentation-results.tsx`     | `81881a4e838b09e97eabfa4128c3c0486fcdc020` |
| `src/views/internal/design-system/foundation-documentation-color.tsx`       | `7d6eeea282c4b9ec2de0f6dfeef3a019562feb14` |
| `src/views/internal/design-system/tests/foundations-documentation.test.tsx` | `774cd899558f1fe8a053be1b5f08e2d82f1f2727` |
| `e2e/design-system/foundations-documentation.spec.ts`                       | `3a61668787bdaded5d251bf34cf40783c738de87` |
| `e2e/design-system/standalone-entry.spec.ts`                                | `ae009737c1759590a08952e17d5513080c53eee8` |
| `e2e/design-system/lab.spec.ts`                                             | `570c266ce2a82bdaaaff594e66c1c8e993526b2b` |
| `playwright.design-system-foundations.config.ts`                            | `c08861cd504c7fe153fac2221fdccbae3018a87d` |

Locale files are shared dirty surfaces. This task owns only the extracted and
translated entries referenced by the three new Foundation presentation files;
it does not claim or rewrite unrelated catalog changes.

No commit, push, stash, reset, publication, legacy deletion, or production
adoption was performed.
