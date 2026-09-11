# First table slice — historical evidence

The [current hardening checkpoint](checkpoint.md) supersedes the initial
candidate description and screenshots for review. This file preserves the
meaning of the earlier evidence, not current implementation guidance.

The [original record](first-slice-record.json) contains seven passing browser
cases and its original public-source digest and image hashes. Its typography,
shared cell framing, separate Progress/Action columns, slice-before-sort
expansion and responsive headers predate subsequent user-directed changes.
Do not use it as a baseline for the current design.

## Direct Portfolio observations

The [observation body](portfolio-observation.spec.ts) mounted synthetic Index
positions and stRSR withdrawals at 375 and 1400px: two passing cases, no
transactions. It did not mount the vote-lock source sidebar or execute contracts.
Production's narrow withdrawal action extended beyond the visible table area;
the lab candidate uses a stacked record. Production takes five rows before
sorting; the lab now deliberately sorts before its preview limit.

- [Production positions, phone](table-production-375-positions.png)
- [Production withdrawals, phone](table-production-375-withdrawals.png)
- [Production positions, desktop](table-production-1400-positions.png)
- [Production withdrawals, desktop](table-production-1400-withdrawals.png)

These observations are not live financial correctness, wallet/chain gating,
receipt truth, production adoption, or visual acceptance. Their source binding
is weaker than the candidate's before/after public-source guard. The vote-lock
branch was code-inspected only. The source-transfer owner remains the
[first-slice brief](../design-system-table-family-first-slice.md).
