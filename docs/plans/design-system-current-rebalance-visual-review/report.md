# Current rebalance workspace — independent visual and surface-UX review

Review-only critique of the lab composition at
`/internal/design-system/components/table?current=<scenario>#auctions-browse-review`
(working tree on `289b2af86e8245ced89d9058a09182799c65f825` plus the uncommitted
composition/header changes; fingerprints unchanged for the whole pass — see
[coverage.md](coverage.md) § Source drift). Nothing was implemented. Screenshot
numbers refer to `evidence/NN-*.{jpg,png}`. "Observed" means seen in the rendered
lab; "judgment" means my reading of it; "product question" means the interface
cannot answer it and a human owner should.

## 1. Overall diagnosis

The workspace is a calm, flat, square card with three bands in the right order:
a general header (title, provenance, expiry, Details), a working band owned by
one "Auction N" heading with a plan | operation split, and a cumulative
"Rebalance so far" strip, with history as a second card below. The three-part
comprehension question — what is about the rebalance, what belongs to the
upcoming or live auction, what already happened — is answered structurally: two
inset dividers, two same-role headings, and the working band swapping its body
(plan → chart, terms/action → bids) while its frame stays put. Type hierarchy
(20 / 16 / 14) is restrained and consistent; pending and unavailable data are
never rendered as zeros; state changes do not jump the frame.

What holds it back is not the structure but how the width and the time/status
vocabulary are used at desktop:

- The 3:2 working grid is filled on only one side in every state. Preparation
  leaves the plan cell roughly half empty; live monitoring leaves the operation
  cell roughly four-fifths empty (02, 17, 18).
- Time lives in three registers with near-synonymous verbs ("Expires in",
  "Ends in", "Permissionless in") and the status pill changes home between
  working and closed states, so "which clock governs me" is answerable only by
  reading everything (01, 07, 18, 35).
- The cumulative strip spreads four inline pairs across 1352 px with
  right-aligned values and runs its progress rail under all four, so the
  desktop result reads as a table row without a table; the same component
  reads well at 900 and 390 (03, 46, 53).
- Bid inspection has no visible owner: the selected bid row does not change,
  and its detail appears under the whole list (19, 20, 48).
- Outcome states keep the "so far" heading, stack two differently-laid-out
  metric groups, bury the completion sentence, keep "Expires in" after
  completion, and label the archive action like a navigation link (22, 35–37).

None of this calls for a redesign. The direction in § 5 keeps the card, the
bands and the container breakpoints, and changes proportions, grouping and the
placement of status/time.

## 2. What works and should be preserved

- One surface, three bands, two inset dividers. The card never nests a second
  frame; warnings sit between the heading and the grid, inside the auction's
  ownership, without tinting anything else (30, 38, 12).
- "Auction N" as the single owner of plan, terms and action, with the body
  swapped for chart + bids when live. The frame does not move when an auction
  starts, ends, or a result replaces an action (18 → 21 → 22).
- Unknown data stays unknown: skeletons while pending (11), dashes and an
  "Unavailable" pill otherwise (12–14). The results strip shows dashes, not
  zeros. This is a real improvement over the audited production behaviour.
- The operation region is stable through wallet → receipt → indexing (15, 16)
  and after rejection (65). The primary action never moves.
- Container-query responsiveness. 390 and 320 stack cleanly with no overflow
  (45–56); the results strip and history projection are better at narrow widths
  than at 1400.
- Assets and liquidity as one disclosure that expands at full working width,
  with real table columns and per-leg popovers/retry (05, 06, 31–34).
- History below the workspace as a second, quieter card with its own label;
  the vertical reading order current → history is natural (01, 44).
- Keyboard reach: title, Details, proposer, action, disclosure, bids and bid
  detail links are all focusable with visible rings (57–59).

## 3. Findings

### Highest impact

#### VR-01 · Time and status are split across three registers; the pill changes home
- **State / viewer / width:** every working state, all viewers; closed states; 1400 and 390.
- **Evidence:** 01, 07, 08, 18, 47, 35, 36, 52.
- **Observed:** "Expires in 1d 1h" is a muted 14 px phrase in the header meta
  line. "Permissionless in 1h 0m" is a bold-value fact inside the auction terms
  list, at the same weight as "Duration" and "Estimated trade value". When live,
  "Ends in 10m 0s" sits in the heading row beside the pill. In closed states the
  pill leaves the heading row and appears alone under the header meta line,
  while the header meta switches to "Ended".
- **Why it matters:** a visitor's central question is "can I act, and when?";
  a monitor's is "when does this auction end?"; everyone's is "when does the
  whole rebalance stop?". Three clocks with the same verb family, placed by
  layout convenience rather than by what they govern, force a full read. The
  non-launcher's answer is split across three elements: the muted reason line,
  the disabled button and the clock buried in the terms (08). The moving pill
  breaks the one anchor that stays constant across states.
- **Recommendation:** one status line, always in the same place (the "Auction
  N" heading row), carrying the pill and the single clock that governs the
  next event for this viewer: restricted non-launcher → pill + permission
  clock; live → pill + auction end; closed → outcome pill in the same row (the
  heading can become the outcome label). Keep the rebalance expiry in the
  header but as the only clock there. Remove "Permissionless in" from the
  terms list — it is a permission fact, not an auction term. Judgment: for the
  launcher it can disappear entirely (product question below).
- **Trade-off:** the heading row carries more when live (pill + timer); at 390
  it already wraps to a second row (47), which is acceptable. Exact wording is
  copy-owner territory; the recommendation is placement and grouping.

#### VR-02 · The working grid fills only one side in each state
- **State / viewer / width:** preparation (all viewers) and live; 1400 and 900.
- **Evidence:** 02 (preparation), 17 and 18 (live), 53 (900), 21.
- **Observed:** in preparation the plan cell (≈ 790 px) holds one sentence and
  two logo stacks that end at ≈ 620 px; the region between "BTCB, WBNB +7" and
  the vertical rule, and below the stacks, is empty. In live monitoring the
  operation cell (≈ 500 px) holds a 14 px "Bids" label and two 44 px rows
  beside a 208 px chart; with no bids it holds the label and a bare "0". The
  column proportions are inherited from the other state each time.
- **Why it matters:** the 3:2 split was chosen for continuity, but continuity
  is carried by the heading row, the dividers and the action rail, not by the
  exact ratio. As rendered, the emptiness reads as disconnected content rather
  than as deliberate margin, and the eye lands on the void beside "Buying"
  before it lands on the action. Judgment: this is the main reason the ready
  state feels less "designed" than the 390 projection.
- **Recommendation:** treat the right cell as a fixed-width action rail
  (roughly the current CTA width, ~440 px) rather than a 40 % track, and give
  the plan cell a bounded measure (Selling/Buying and the description at a
  maximum width of about 640 px, left-aligned) so the remaining space reads as
  margin. In live state the rail holds the bid list at its natural width and
  the chart takes the rest; the rail's top line can carry "Bids · 2" and, when
  none, a short empty line instead of a bare "0". If a fixed rail is rejected,
  the cheaper fix is to fill the plan cell with the compact liquidity summary
  line (Estimated trade liquidity · Simulated route) that currently only
  appears inside the disclosure.
- **Trade-off:** a fixed rail changes the 832 px breakpoint arithmetic and the
  balance at 900 (53), which must be re-checked; possible design-system gap
  (see § 6).

#### VR-03 · The cumulative strip scatters its pairs at desktop and the rail under-claims
- **State / viewer / width:** all states with the strip; 1400 only (900 and 390 are fine).
- **Evidence:** 03, 39, 21, 46 (390), 53 (900).
- **Observed:** four inline label/value pairs share one 1352 px row with
  right-aligned values, so label-to-value distance is 150–250 px and the four
  values align to nothing in particular. Once any auction has started (live, or
  a completed run) a full-width rail runs under all four pairs; it belongs to
  "Execution progress" only. Before the first auction the strip shows
  0 % / 0 / $0 / −10.39 % and no rail.
- **Why it matters:** this band answers "what has already happened"; at
  desktop it is the hardest band to read, while at 390 the same facts stack
  legibly. The rail's span makes "1 auction completed" and "$84,210" look like
  they sit on a progress scale.
- **Recommendation:** at ≥ 1024 use stacked facts (label above value, left
  aligned in four equal cells — the outcome group already uses this recipe,
  35) and place the rail directly under the "Execution progress" cell, or make
  the rail the first, wider cell with the percentage as its label. Keep the
  inline pairs for < 1024 where they already work. Consider showing the strip
  in a lighter form before any auction has run (the plan document also asks for
  "compact" cumulative context before trading).
- **Trade-off:** two facts layouts by width; the closed state then needs one
  stacked group instead of two (see VR-05), which is a simplification.

#### VR-04 · Bid inspection has no visible owner
- **State / viewer / width:** live with bids, any viewer; 1400, 390, 320.
- **Evidence:** 19, 20, 48, 55, 59.
- **Observed:** clicking "Bid #1" enlarges its dot on the chart and appends a
  detail block (Selling / Buying / Bidder / Transaction) under both bid rows.
  The Bid #1 row itself is unchanged; the block sits as close to Bid #2 as to
  Bid #1. Keyboard users get `aria-expanded` but no visible cue on the row.
- **Why it matters:** the only visual link between the detail and its bid is
  the dot size on a schematic curve. With three or more bids the block would be
  unattributable.
- **Recommendation:** give the selected row a selected treatment (weight or
  substrate reveal, the same accent as the enlarged dot) and render the detail
  directly under the selected row (an expanded row), not under the list. Keep
  the dot enlargement. Possible design-system gap: a selected/expanded state
  for the quiet list button (§ 6).
- **Trade-off:** rows below the expanded one shift down; acceptable for a short list.

#### VR-05 · Outcome states are two half-layouts under a working-state heading
- **State / viewer / width:** complete, expired, expired-complete, in-session expiry; 1400 and 390.
- **Evidence:** 22, 35, 36, 37, 52, 44, 62.
- **Observed:** after completion or expiry the working band disappears; the
  card shows "Rebalance so far" (inline strip + rail), then a second, stacked
  group (Rebalance accuracy, NAV Change, Total price impact), then a muted
  caption ("Rebalance Finished" / lab expiry note), then a secondary button
  labelled "Historical Rebalances". In `complete` the header still says
  "Expires in 1d 1h" beside a "Completed" pill. "Execution progress 96.4 %",
  "Rebalance accuracy 96.4 %" and "Current basket deviation −3.6 %" appear as
  three facts in two layouts.
- **Why it matters:** this is the state a returning participant sees most
  often, and it reads as leftovers: "so far" after the end, a caption doing the
  headline's job, a button that reads as a link to the section below rather
  than as "move this to history", and a clock that no longer applies. The
  handoff then removes the card and leaves an orphan "Current Rebalances" label
  above history (44).
- **Recommendation:** one outcome band that replaces the working band under
  the same heading position: outcome pill in the heading row (VR-01), one
  stacked fact group (accuracy, auctions completed, traded, NAV change, price
  impact) with the rail, and the completion statement as the band's lead line
  rather than a trailing caption. Hide the expiry clock once the rebalance is
  complete. The archive control's label and its need are product questions;
  visually it should read as an action, and the current-section should show
  its empty state after it, not a bare label.
- **Trade-off:** the "Rebalance so far" strip and the outcome group merge into
  one component with a state switch; the 390 projection (52) already stacks
  both, so narrow widths lose nothing.

### Worthwhile smaller findings

- **VR-06 · Expanded asset table geometry.** Asset column at 40 % leaves ≈ 450
  px of blank between identity and the first number; rows are 60 px, so 18
  tokens run ≈ 1,250 px and push the cumulative strip far down; there is no
  closing control at the end, the trigger having scrolled away; "Refresh" floats
  alone at the far right of the summary line (05, 06, 31, 32). Judgment:
  narrow the identity column (≈ 30 %), drop row height to 48 px, and add a
  collapse affordance at the end of the table (possible design-system gap).
- **VR-07 · Unlabelled description line and dash placeholder.** "Buy/sell
  tokens to move closer to proposed weights." reads as filler under the heading;
  when data is unknown it becomes a lone "—" (01, 11, 12). If this is the round
  type, it needs to look like a fact; if not, it can go. Product question.
- **VR-08 · "Current basket deviation" is homed with results.** It is a
  present-state fact, not something that happened; at 0 auctions it is the only
  non-zero number in a "so far" strip (03). Judgment: it belongs with the
  progress rail as remaining distance, or with the auction terms.
- **VR-09 · The plan's disclosure trigger rides the operation column's
  height.** Because the trigger is bottom-aligned to the taller column, it moves
  40–60 px between launcher, visitor, indexing and rejected states (01, 07, 16,
  65). Observed, not severe; a fixed rail (VR-02) removes it.
- **VR-10 · Warnings and their consequences are linked by words only.** The
  "Ondo limits" message at the top and "Rebalance Percent 2 % · Ondo limits" in
  the terms share a phrase, not a position (30). The per-row "Retry" pill makes
  the failed leg the heaviest row in the table (31). Judgment: keep the
  messages where they are, but let the affected term or row carry the same tone.
- **VR-11 · Editor validation is border-only and cascades.** An invalid unit
  shows a red border and no message; every other row's target allocation flips
  to "—" because the total cannot be computed (28). Judgment: a field message
  under the invalid field; keep other rows' current values visible.
- **VR-12 · Tab order jumps from the header to the action before the plan's
  disclosure** (proposer → Start auction → Assets and liquidity), i.e. right
  column before the left column's last control (58). Observed; minor.
- **VR-13 · Dark theme: the card edge nearly disappears.** Card and page
  surfaces are almost the same value, so the workspace and history read as
  one plane separated only by their small labels (61, 62). Consistent with the
  flat-surface rule, but the current/history boundary is weaker than in light.
  Design-system decision, not a local fix.
- **VR-14 · Handoff leftovers.** After "Historical Rebalances" the current
  section is a bare label; the transferred row prints "$84,210.00" where
  fixture rows print "$84,210" (44).
- **VR-15 · Three simultaneous "launching" signals** (pill, button, caption)
  during wallet/receipt/indexing (15, 16). Acceptable; the caption is lab copy.
  The rejected state re-arms the button under a danger message with the pill
  still "Ready to start" (65) — coherent, because retry is possible. A reverted
  receipt renders identically (66): one message covers a wallet rejection and an
  on-chain failure, which is acceptable for retry but hides which one happened.
- **VR-16 · Details is a popover behind a chevron.** The chevron implies an
  inline expansion; the panel floats over the pill and terms (04). Minor.
- **VR-17 · "Bids 0"** — a bare zero under the label in a mostly empty column
  when an auction has just started (17). Minor; folds into VR-02.
- **VR-18 · Possibly transient:** after "End auction" the Selling/Buying
  stacks rendered a single logo for one capture (21). Seen once; likely image
  loading, listed for completeness.

## 4. Answers to the review questions

- **What gets attention first?** The primary button (Start auction / Connect
  wallet), then the title, then the "Auction N" row. Appropriate for a
  launcher; for a visitor the button ("Connect wallet") is still the loudest
  element although they cannot act — the pill "Ready to start" then reads as an
  invitation. When live, the chart wins, which is right.
- **Which pieces look related, and is it correct?** Terms + action (correct);
  pill ↔ heading (correct but distant at 1400); "Permissionless in" ↔ auction
  terms (incorrect grouping); rail ↔ all four cumulative facts (incorrect);
  bid detail ↔ bid list (ambiguous); warnings ↔ affected term (verbal only).
- **Is the next action obvious, including why it is unavailable?** Yes for the
  launcher and for the wrong-network and data-error cases (single message, one
  disabled or replaced button). For a non-launcher the reason is split across
  three elements (VR-01).
- **Are auction timing, permission timing and rebalance expiry
  distinguishable?** By position, partly; by wording and weight, no (VR-01).
- **Do columns feel balanced?** Aligned within the grid, not balanced (VR-02).
- **Is empty space helping?** Section gaps and the 24 px axis help; the plan
  and bids voids expose disconnected content.
- **Do expanded sections stay owned by their parent?** Assets and liquidity:
  yes by position, weakened by length and the missing close (VR-06). Bid
  detail: no (VR-04). Details popover: yes.
- **Does the layout stay coherent when content changes?** The frame does;
  the pill's home and the disclosure trigger's position do not (VR-01, VR-09).
- **Does the workspace sit naturally above history?** Yes. The two cards, the
  small labels and the identical proposer/date sentence make the pair legible;
  the history table's stronger column rhythm makes it look more "finished" than
  the current strip, which VR-03 addresses.

## 5. Recommended layout direction

Keep the single card, the three bands, the two inset dividers and the
container breakpoints. Change four things, in this order of value:

1. **One status line.** The "Auction N" heading row always carries the pill
   and the one clock that governs the viewer's next event (permission clock,
   auction end, or the outcome). The header keeps only the rebalance expiry,
   and drops it once the rebalance is complete. Terms lose "Permissionless in".
2. **Action rail.** The right cell becomes a fixed-width rail (~440 px) that
   holds terms + action in preparation, bids (+ filler control) when live, and
   nothing when closed. The left cell holds the plan at a bounded measure, the
   chart when live, and the outcome group when closed. The rail's fixed width
   stops the trigger drift and gives bids a natural column.
3. **One facts recipe for "what happened".** At ≥ 1024 the cumulative strip
   uses stacked facts in equal cells with the rail under the progress cell; in
   closed states the same group absorbs accuracy, NAV change and price impact,
   led by the completion statement. Below 1024 everything stays as the current
   inline pairs.
4. **Owned disclosures.** Selected bid row + detail under that row; expanded
   asset table with a tighter identity column and a closing control.

How it adapts:

- **Preparation:** heading row = "Auction N" + pill (+ permission clock for
  non-launchers); left = description-as-fact, Selling/Buying, compact liquidity
  line, disclosure trigger; rail = terms + primary action (+ Manage Weights);
  strip below in compact form until an auction has run.
- **Live monitoring:** heading row = "Auction N" + Ongoing + Ends in; left =
  chart; rail = bids with the selected bid expanded in place; strip with rail.
- **Outcome:** heading row = outcome label + Completed/Expired pill; one
  stacked group with the rail; archive action reads as an action; after
  archiving, the current section shows its empty state.
- **Narrow:** unchanged order (heading, plan, action, disclosure, strip); the
  rail becomes the full-width action block it already is at 390/320.

## 6. Possible design-system gaps and product-meaning questions

Possible design-system gaps (the implementation owner verifies):
- A selected/expanded state for the quiet list button used for bids (VR-04).
- A stacked-fact group with an attached progress rail (VR-03/VR-05).
- A collapsible with a closing control at the end of long content (VR-06).
- A status-line pattern pairing `LifecycleStatusPill` with a clock, so the
  pairing is not hand-built per state (VR-01).
- Dark-mode separation for flat structural cards (VR-13) — token or surface
  decision, not a local override.
- A fixed-width action rail as a layout recipe alongside the 3:2 grid (VR-02).

Product-meaning questions surfaced by the interface (not resolved here):
- Should a launcher see the permission clock at all, and should the phase
  change ("permissionless") be visible to anyone once it has happened (09)?
- "Next auction target 100 %" shows the same value every round; is it the
  target for this auction or for the rebalance, and does it need to be a term?
- "Execution progress", "Rebalance accuracy" and "Current basket deviation"
  are three near-synonyms in closed states; which one is the outcome?
- What does the "Historical Rebalances" control do in production, and does the
  outcome need an explicit handoff at all?
- Is the description line ("Buy/sell tokens…", "Remove ETH…") the round type,
  and is "Bidding is ongoing…" needed when the pill says Ongoing?
- All "Lab:" captions (indexing wait, expiry, filler) still need product copy;
  the wrong-network control remains engineering-unresolved per the audit.

## 7. Coverage, limitations and drift

See [coverage.md](coverage.md) for the scenario × viewer × data × width ×
theme matrix, the interaction list, the viewport note (early captures at a
1567 px window with the same 1352 px content column as 1400), the keyboard
trail and the limitations. Source fingerprints were identical at start and
end (`evidence/source-manifest-start.txt`, `evidence/source-manifest-end.txt`);
`git status` changed only by this package. The review is single-version.
