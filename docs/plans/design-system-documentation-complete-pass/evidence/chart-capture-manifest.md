# Chart capture provenance

Recorded 2026-09-17 against fixed point
`02434707c0614d2262b10560eebb05cde4319931`. These images preserve accepted
rendered owners without importing their provider-coupled product graph into the
standalone documentation build. The source modules and fixture remain the
authority; the images are presentation evidence, not a new chart contract.

Source route:
`/internal/design-system/components/chart#chart-next-families-review`.

| Source                               | SHA-256                                                            |
| ------------------------------------ | ------------------------------------------------------------------ |
| `charts/source-overview.tsx`         | `7169517b888a25f4c0b76f23db3bcf15d28f8013b429a6a0f6925ca2cd230452` |
| `charts/source-small.tsx`            | `2aeaac43f24802e140940db69a5a4418abf85093718155e7f6e655e59b3f37d3` |
| `charts/source-set.tsx`              | `9d9cb391bfb0790c5579f5c626d4920a0b7fd2b5ca5c7afe4596ccec99978567` |
| `charts/fixtures/photon-source.json` | `0af725e5a1a023483dd648625f1f54916d83b9ae88f113f5f28cb37793c143cf` |

| Capture                      | Pixel size  | Light SHA-256                                                      | Dark SHA-256                                                       |
| ---------------------------- | ----------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Overview line                | 1648 × 1044 | `25ad63b9d4e00fe0f77ae473e3415bb8d0d6c6f709b8aa7251cf0ae2128bd4d5` | `ac110da964fa3cbe2b77ea4f10ba78a073144d1f4ddbbcf9a20085de1cca04d6` |
| Overview candles             | 1648 × 1044 | `08f708859670aea1171433b53854459d4e1691fe5818f6926f11a4414aedc323` | `2d9c1b1f0f8a589e6deb7382806ee2349ac0db377130b69adbff7b3ad7c1252f` |
| Home highlighted DTF         | 680 × 724   | `25246a875207a32b03e377a6eeebb3dfb2735a5bedfadc8dbd022c28011f811b` | `ced0b4f02d0d72e9b438e644cfa4f8f60817dc113fd1af34bf16598839d9838c` |
| Discover compact performance | 288 × 160   | `306a680884a986a4e04361aacdc43a3e631d3c780903b52a52929a234afe41b6` | `8397da3e0e655b6df7cf5a17268e24f3f803fcaf14787ed9fdcc208afdb44eb7` |

The documentation displays these captures at their declared CSS dimensions:
824 × 522, 340 × 362, and 144 × 80 respectively. Yield and Portfolio remain
live documentation-owned renderers and are not represented by this manifest.
