# Patterns scoped identities

Base ref: `02434707c0614d2262b10560eebb05cde4319931`.

## Shared owned files

| Path                                            | Pre-edit identity                          | Returned identity                          |
| ----------------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| `documentation-pages.tsx`                       | `acb98a355805f7c27ac38ad32fa5ad03ecffb638` | `bca4924842778d0b7c1bd6ac58799bce3bcce7c4` |
| `documentation-presentation.ts`                 | `308172f33374863f0b6c7bb54f2822fa5760ae0d` | `a4502eca93c588a64f31a0aa352b99f302595c28` |
| `tests/documentation-presentation.test.ts`      | `f1971f6dc9f1defa387d5bb0125a2708c19c4744` | `b4861b2061c3e249dcb025f6a7ad8a4ae389d9de` |
| `e2e/design-system/documentation-shell.spec.ts` | `7c2fcf34b290f28cdd015cf7a3ac77e6ac2b49a2` | `9c492ec719c4a0ae3b86d87285995253c1126ef3` |
| `e2e/design-system/standalone-entry.spec.ts`    | `ae009737c1759590a08952e17d5513080c53eee8` | `c60dbc83a1ebf1ca01c8793455c2ba29d87430e0` |
| `src/locales/en.po`                             | `b5bf6237d6dee1625849182f92e56ec8db26ed0e` | `2bfc9484191dc29114331b4ed6477c5d79d6f8c6` |
| `src/locales/es.po`                             | `4d6b62fbdba805df6a2a03368287354d66374c1d` | `718fefd6c473e2a90c4d1e2af495da7ea314bcc9` |
| `src/locales/ko.po`                             | `50b4f99427bdaf73a037ef8e2391f0e4acc104b2` | `1cc72967c721addf397f64c933de1ccdeb923462` |
| `src/locales/zh.po`                             | `52a2ca0ae05efd36d45dda8b217a66e5c5ea9d10` | `c52db615d0128f41d275a826f27c87d599074122` |

`src/views/internal/design-system/index.tsx` remained byte-identical at
`638f561702d37e8ed127af1d7f540f3d10c8d723`; its pre-existing legacy redirects
already satisfied this slice.

## Accepted owner identities used for capture/gating

| Source                                                   | Captured/current identity                  |
| -------------------------------------------------------- | ------------------------------------------ |
| `charts/source-small.tsx`                                | `07b8a101d3d87d50841304ad40fb29bf15e6c419` |
| `auctions-current-table/table.tsx`                       | `92ea407acc444c8ff4e3db9a214785aff1564bc0` |
| `navigation-systems-state-sheet.tsx`                     | `86f4af3e9402fe9673edc2f91b37dff4c2f25512` |
| `navigation-review-fixtures.tsx`                         | `53da0ebc1a8752c81fc861cafb3e99a285f305a1` |
| `components/design-system-v1/preset-or-custom-field.tsx` | `8ef8527a62011e9614d43c688f8ee655c0c8ad36` |
| `component-catalog-primary.ts`                           | `4cb138903d98db7793c953151a0e8f16e2cf11f7` |

The final scoped diff check returned zero changed paths across the frozen Chart,
Table, Auction, Transaction, Navigation-owner, navigation-fixture, and contained
form-review surfaces named in the handoff.
