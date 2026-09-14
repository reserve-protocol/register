# Coverage — current rebalance workspace visual review (2026-09-13)

Review target: working tree at `289b2af86e8245ced89d9058a09182799c65f825` plus the uncommitted
`auctions-current/` composition and header changes (fingerprints in `evidence/source-manifest-start.txt`
and `-end.txt`). Preview: `http://127.0.0.1:3005/internal/design-system/components/table?current=<scenario>#auctions-browse-review`.
Browser: Claude-in-Chrome, one tab, one worker. Theme light unless stated. Viewer = Connected launcher unless stated.

## Viewport and content width

| Captures | window.innerWidth | Workspace card width | Note |
| --- | --- | --- | --- |
| 04–16, 18–22, 43–44 (early sweep) | 1567 × 984 | 1352 px | The window resize did not apply until a later reload. The page container is `max-width: 1400px` with 24 px side padding, so the card is 1352 px wide at any viewport ≥ 1400: the composition is identical to the 1400 px target. |
| 01–03, 17, 23–42, 57–64 | 1400 × 857 | 1352 px | Target desktop viewport. |
| 45–52 | 1400 × 857, lab "Constrained column · 390px" switch | 390 px | Container-query projection (the card is `container-type: inline-size`; all breakpoints are container widths: 32/48/52/56/64 rem). |
| 53 | 1400 × 857, wrapper `max-width` forced to 900 px via page script | 900 px | Pressure check between the 832 px working breakpoint and the 1024 px facts breakpoint. |
| 54–56 | wrapper forced to 320 px | 320 px | Pressure check; `scrollWidth` = 320, no element outside the card box. |

Screenshots are viewport captures downscaled by the tool (early ones 1383 × 868 for a 1567 × 984 viewport); zooms are 2× device pixels.

## Scenario × state matrix (CURRENT_SCENARIOS)

| Scenario | Viewer / data / interaction covered | Width · theme | Evidence |
| --- | --- | --- | --- |
| ready (First auction · restricted) | launcher; visitor; non-launcher; non-launcher after "Advance to permissionless"; wrong network; Details popover; Assets and liquidity expanded (18 rows + totals); data = pending, price-error, auction-error, metadata-error, bounds, error; simulated launch success (wallet → receipt → indexing → live) and outcomes reject / revert; Receive bids; End auction → Auction 2; Expire → result; keyboard trail | 1400 L; 390; 900; 320; dark | 01–16, 17, 21, 22, 45, 46, 53, 54, 57, 58, 61, 65, 66 |
| permissionless (First auction · permissionless) | launcher | 1400 L | 40 |
| hybrid (Hybrid · weights required) | prerequisite; Manage Weights editor (fields, Max Auction Size per Token, invalid entry, Back, Save); saved → Start auction 1 + quiet Manage Weights | 1400 L; 390; 320 | 25–29, 51, 56 |
| live (Auction live · bids) | bids list; Bid #1 selected (detail block, enlarged dot); keyboard to bids/detail; Assets and liquidity trigger present | 1400 L; 390; 320; dark | 18–20, 47, 48, 55, 59, 60 |
| no-bids (Auction live · no bids) | "Bids 0"; also reached organically after a simulated launch | 1400 L | 17 |
| repeat / progressing (Next auction · prior run / Progressing) | visually identical (runs = 1, restricted); Auction 2 heading, results 62.8 % / 1 / $84,210 with rail | 1400 L | 39 (repeat is the same composition; first-impression capture at 1567 kept in scratch only) |
| remove (Remove tokens · first auction) | launcher | 1400 L | 38 |
| liquidity (Liquidity warnings · Ondo cap) | messages; Rebalance Percent 2 % · Ondo limits; table with Zapper error + Retry, Low liquidity, Limited; NVDAon popover | 1400 L; 390; dark | 30–33, 49, 50, 63 |
| liquidity-closed (Ondo market closed) | table row "Market closed"; popover Closed / Next open | 1400 L | 34 |
| complete (Target reached · window open) | result panel; Historical Rebalances handoff → row in history | 1400 L; dark | 35, 44, 62 |
| expired (Expired · incomplete) | result panel | 1400 L; 390 | 36, 52 |
| expired-complete (Expired · complete) | result panel | 1400 L | 37 |
| filler (Unlisted DTF · browser filler) | running (warning + orders + Stop); stopped (Start) | 1400 L | 23, 24 |
| multiple (Two current records) | two stacked workspaces (ready + hybrid prerequisite) | 1400 L | 43 |
| empty / loading / not-found | list-level states | 1400 L | 41, 64, 42 |

Interactions exercised with the lab controls: Viewer select (all three), Data select (all seven), Launch outcome (success, reject, revert; the "indexing delayed" hold is visually the captured indexing state with its Refresh control), Wrong network switch, Advance to permissionless, Receive bids, End auction, Expire rebalance, Historical Rebalances handoff, Constrained column switch, theme toggle (nav). Not exercised: CSV file upload (native picker), "Reach target" (the `complete` scenario renders the same result), "Run preview clock" (only changes countdown digits), "Submit filler order" / "Filler error" (filler stopped state captured instead), hover-only states.

Keyboard: Tab trail from the workspace title in ready and live states (title link → Details → proposer link → Start auction / Bid #1 → Assets and liquidity → lab controls → history help). Enter on Bid #1 opens the detail; its links are reachable. Chart dots are not focusable (by design per source). Focus rings verified on Details, the disclosure trigger and the detail link (57–59).

## Limitations

- The lab's dev server sometimes needed more than 3 s to render after navigation; those attempts were retried and only rendered states were used.
- Two popover captures (33, 34) were taken during the popover's fade-in and look translucent; content and anchoring are what was reviewed, not opacity.
- After "End auction" the Selling/Buying logo stacks rendered a single logo for one frame (21); this was seen once and is most likely image loading, not composition.
- One review tab; no parallel browser runs; no real wallet, signature or transaction. All actions were the lab's simulated ones.
- Prior layout rationale (`docs/plans/design-system-current-rebalance-workspace.md`) was read only after first impressions and source inspection were recorded (`scratch: first-impressions.md`, not part of this package). Required reading before the browser pass (area guide, `current-review.ts`) does contain some rationale; it did not include screenshots or visual-review conclusions.

## Source drift

`evidence/source-manifest-start.txt` and `evidence/source-manifest-end.txt` hash the 30 reviewed files (all of `auctions-current/`, `current-review.ts`, the design-system area guide, the three current-rebalance e2e specs including the untracked composition spec). The hash sets are identical and `git status` is unchanged apart from this package. HEAD stayed `289b2af86e8245ced89d9058a09182799c65f825`. The review is single-version.
