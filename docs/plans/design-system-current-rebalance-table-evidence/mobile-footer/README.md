# Compact current row — arrow and expiry

Historical receipt: the [status/arrow follow-up](../status-arrow/README.md)
supersedes this arrow placement above a 352px container. The expiry treatment
and narrow fallback remain; this report is not proof of the latest composition.

September 14, 2026. Low-profile lab follow-up; existing dirty worktree preserved.

The user selected an arrow beside the auction number and timing, followed by
an expiry row with label left and remaining time right. The existing 32px circle
keeps its reserved 44px hit area and native Details link. The two regions have
a 12px gap, without a separator or extra action footer. The existing 24px outer
inset and desktop columns are unchanged. “Rebalance expires in” makes the time's
scope explicit; its en/es/ko/zh catalogs are filled through isolated extraction
and a scoped merge that preserves unrelated catalog changes.

[RED](red/browser-report.json): the arrow was 66px below the auction block's
centre, and the separate labelled expiry row was missing.

[Final browser report](final/browser-report.json): **25/25**, without retries or
mock-wallet sends. The same layout check is green at 320/390/430/608/768px and a
390px constrained column, with desktop unchanged. It checks arrow/auction centre
alignment, expiry below that block and the counter on the right content edge.
All-state coverage, real 44px hit areas, navigation/Back, responsive focus,
loading/unavailable/empty states and es/ko/zh expiry labels pass. App/E2E types,
scoped lint/format, wiki lint and whitespace checks pass; existing Node color and
Tailwind duration warnings remain. No full repository gate is claimed.

Owner inspected the light phone, ongoing auction, dark unavailable and Spanish
phone captures. No clipped labels or counter overlap; the distinction between
auction timing and rebalance expiry is retained. Source was stable throughout
the final browser run. The earlier cleanup's separate history proof remains in
its [receipt](../mobile-cleanup/README.md).

Only the compact current table, this approved label, and its tests change.
Historical layout, state/data precedence, permissions, countdown derivation,
financial values, navigation destinations and all trading behavior are untouched.
No dependency installation, shared default, new analytics event or commit.
This is local correctness/product self-review, not the outstanding independent
review, human acceptance or engineer-reviewed production migration.
