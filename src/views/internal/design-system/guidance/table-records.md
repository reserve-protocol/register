# Table and governance record guidance

Read for table-family, Earn/owned position or governance record changes. Read the [common lab guide](../CLAUDE.md) first.
Code paths in prose are relative to the lab directory unless fully qualified.
These are scoped preservation requirements, not new design authority.

Owned Portfolio positions live in `table-family/owned-*`, separately from Earn
opportunities and pending withdrawals. Keep balance/value central, every governed
asset independently linked, and staking Modify navigation distinct from the
vote-lock's non-executing context dialog. Appreciating balances carry underlying
units and exchange rate; ordinary API share balances do not inherit those units.
The owned Governs cell keeps `+N` inline with the last visible DTF and opens the
full linked list in a popover; it does not expand the row. Hover is optional;
click/tap and keyboard open a persistent panel. Responsive projection changes
close it and return keyboard focus to the visible matching trigger.
The local table must constrain its actual nested table, not only DataTable's
scroll wrapper. Empty recovery remounts the focus owner. See the
[owned-position contract](../../../../../docs/plans/design-system-owned-positions-slice.md).

Compact Earn identities must fit beside the rate using their actual text bounds;
cell overflow alone misses a supporting-label collision. Bound and wrap the local
identity, not canonical EntityIdentity defaults. Owned Balance/Value wrap as whole
facts when long amounts need their own row; never split, shorten or reformat the
number to fit a fixed two-column cell. Governs/APY retain their paired row.

Compact Index Earn rate help is an icon-only canonical InlineAction beside the
plain period label, with the 44px tap region outside its 20px layout. Keep
the numeric/APR line control-free and right aligned; loading reserves the label
icon footprint. The same existing FAQ, focus key and accessible name remain.
Desktop IconButton and shared action defaults are unchanged; see the
[rate-help receipt](../../../../../docs/plans/design-system-table-governance-followup-2026-09-14/earn-rate-help/README.md).

Governance records own an inline-size container: below 28rem of content width,
the unchanged Fast/Contested qualifier precedes a full-width title, decision
evidence follows status, and standard quorum/vote facts use labels above values.
Whole facts wrap only when they cannot fit beside each other, without a stranded
divider. The local Constrained proposal column switch caps only this list at
390px, retaining every example. Row wrappers retain the card surface. Eligible
content rows/cards opt into the accepted opaque
[content-hover treatment](../../../../../docs/plans/design-system-content-hover-trial.md):
proposal, Earn, current/earlier rebalance records, Discover, Portfolio positions
and neutral catalog content links. Whole-row action ownership determines
eligibility, not a shared table default. Static/withdrawal/loading rows and
individual controls keep their own behavior. Discover's decorative strip and
fade masks follow the hovered card; loading masks remain unchanged. The solid
warm light / subtly lighter dark role is separate from selection, generic control
hover and structural substrate roles. Production adoption remains engineer-gated.
Wider records retain
inline title/qualifier and complete evidence groups. The lab review aside uses
content height. Governance's 13 frozen examples now use one leading pill,
unboxed foreground voting/challenge deadlines and a quieter Passed outcome.
Waiting period plus Execution available in is distinct from supplied Ready to
execute; timer zero never derives eligibility. Active strips describe lifecycle
timing, not vote support; closed rows omit them. The canonical help trigger is
independent of the stretched native overview link. A first outside touch dismisses
help without navigation; a subsequent touch retains normal link behavior.
Local Default/Loading/Empty previews do not query or simulate production recovery.
Shared timeline defaults, optimistic evidence and reference destinations remain
unchanged. Real proposal identity, live deadlines, permissions, data recovery and
Show all need engineer-owned integration; see the
[presentation closeout](../../../../../docs/plans/design-system-governance-presentation-closeout.md).
