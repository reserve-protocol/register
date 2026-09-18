# Non-auction tables — inspection and isolated fixes

September 14. Two demonstrated narrow-layout problems were fixed and verified
in isolation while Claude reviewed the primary source. They are now integrated
under the user's [follow-up authorization](../design-system-table-governance-followup-2026-09-14/README.md),
with fresh primary-source checks. No data, copy, units, sorting, permissions,
links or shared component defaults changed. The evidence below is the original
overnight pass; the follow-up receipt owns current verification.

## Fixes ready for review

| Finding                                    | Root cause and exact boundary                                                                                                                                                                                                                                                                                                                                                      | Result                                                                                                                                                                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Earn vault identity overlaps rate at 320px | The compact identity button could size to its supporting text beyond its allocated flex cell. `vlSQUILL-OPEN` and `vlRSR-CMCindex` intersected the rate region even though the table itself did not overflow. Local compact-cell styles now bound the button and allow supporting identity text to wrap. Desktop and canonical EntityIdentity/InlineAction defaults are unchanged. | Both themes failed the new text-to-rate intersection check before the fix and passed afterward. Full identity remains visible, without ellipsis, hidden rate kind or smaller typography.                                               |
| Owned-position numbers split mid-number    | The fixed two-column compact Balance/Value grid gave a long amount half a row; the existing emergency word-wrap split `$12,345,678.90` into two lines. The local Balance/Value pair now wraps whole fact groups when their intrinsic widths do not fit. Governs/APY retain their paired row.                                                                                       | Literal fixture amount and balance are unchanged and each fits on one line in the 320px pressure case. Ordinary short values still sit side by side. No precision reduction, number formatting, balance filtering or valuation change. |

Compare Earn before *(capture generated locally; not tracked)*
with Earn after *(capture generated locally; not tracked)*.
Compare owned pressure before *(capture generated locally; not tracked)*
with owned pressure after *(capture generated locally; not tracked)*.
The trade-off is additional height only where identity/amount content needs it;
readable information is preferable to overlapping text or a severed decimal.

The [isolated patch](isolated-layout.patch) contains just two local column owners
(six added application lines, two replaced lines) and one browser-check file.
It was checked against the preserved working source, not simply the older HEAD.
That conflict check passed again after Claude's review before integration.
The patch is now historical evidence, not something to reapply to the main lab.

## Coverage and dispositions

| Family                              | Fresh coverage                                                                                                                                                                                     | Disposition                                                                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portfolio positions and withdrawals | Light/dark 320/375/1400, 639/640/1023/1024 container boundaries, constrained and long content; default, loading, withdrawals waiting/processing/complete; retained links and focus                 | No additional demonstrated composition defect in this pass. Existing source/transaction-adoption gates remain.                                       |
| Holdings exposure/collateral        | Light/dark 320/375/1400, 511/512/767/768 boundaries, constrained and Overview-host projections; long names, stock baskets, new/missing/loading data; touch identity, sorting and linked provenance | No new fix. The stock and long-name examples keep identities/weights readable without hiding numeric facts.                                          |
| Discover rows/cards                 | Desktop light/dark, 1151/1152 boundary and constrained column; cards at 320/390/768, focus transfer, sort persistence and ticker/reduced-motion recovery                                           | No new fix. Card versus row is an intentional responsive projection; chart/endpoint policy is not part of this table pass.                           |
| Earn Index/Yield                    | Light/dark 320/390/1400, 1024/constrained projections; wallet on/off, sparse, partial loading, missing, whole loading, empty, long content; rate help, disclosure and sort recovery                | Compact identity fix above. Existing tests measured cell overflow but missed peer text overlap; the added regression tests the visible relationship. |
| DeFi opportunities                  | Light/dark 320/390/1400, 1023/1024/1279/1280 boundary/focus; sorting, long names, unavailable/loading/empty                                                                                        | No new fix or pool/rate interpretation change.                                                                                                       |
| Owned vote-lock/stake positions     | Light/dark 320/390/1400, 1023/1024/constrained, long amounts, partial loading/zero/empty, governed-link disclosure and Modify boundary                                                             | Whole-fact wrapping fix above. Appreciating-vault exchange-rate/units and source/target action distinctions remain unchanged.                        |

The initial existing-suite pass was 53/53. It generated 334 image attachments;
27 representative ordinary-viewport captures were retained and visually read,
not all 334 independently inspected. Eight additional Discover-card checks passed.
The new governance inventory is documented [separately](governance.md).
Final affected-suite results and exact commands belong to [verification](verification.md).

## Things deliberately not changed

- On the 320px lab page, the navigation's Status icon crowds Screens. That is
  shared lab chrome, not a table-row defect; record it for a separate shell pass.
- Several token marks resolve to fallback logos in these offline/source-bound
  captures. No remote logo reliability or asset identity change is inferred.
- Discover and Earn still have their own seam/bottom-padding rules. This pass
  does not turn the user's auction-table divider decision into a global default.
- No exhaustive browser/device/accessibility or translated-content certification.
  These checks use desktop Chromium with constrained viewports and existing
  fixtures; no real phone, screen reader, financial API or transaction execution.
- No new user-facing wording, chart design, financial calculation or migration
  adapter is included. Engineer review gates in each owning brief remain open.
