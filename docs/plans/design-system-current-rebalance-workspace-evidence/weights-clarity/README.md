# Weight comparison clarification — September 13

Ready for human review in the lab, not production adoption. This is a bounded
follow-up to the [state-composition candidate](../state-composition-verified/README.md).
The [workspace contract](../../design-system-current-rebalance-workspace.md#weight-comparison-clarification)
records the approved meaning and scope.

## Change

Confirm target weights is explicitly preparation before auction 1. The editor
separates current holdings, editable targets and persistent starting references.
Current holdings and initial targets are different illustrative fixtures. Current
amounts are per DTF token, not original proposal weights. Saving prepares a local
target, unchanged defaults can be confirmed, and reload discards saved edits.
The save explanation and buttons share a footer; existing input, table, button
and typography owners are reused. New copy is translated into es/ko/zh.

No production hooks, SDK contracts, wallet calls, persistence, transaction math,
shared defaults or tokens changed. Exact-unit normalization and the real target
adapter still require engineer review before adoption. Other proposed status
wording remains unapproved. Internal controls do not add product analytics.

## Verification

- RED: the new 1400px comparison check failed because a separately displayed
  current holding did not exist. It expected HYPE current 0.012, starting target
  0.018 and an independently editable target. An earlier attempt could not bind
  the isolated server in the sandbox; the authorized retry produced this RED.
- Initial comparison run: 4/4 passed at 1400/900/390/320, including dark at 390.
- [Regression report](browser-report.json): 23/23 passed, including existing CSV,
  draft, rejection, multi-record, missing-price, saved/loading, bid and outcome
  checks, plus the new comparison and es/ko/zh phone checks.
- A subsequent visual-only footer grouping was verified by the
  [final report](final-report.json): 7/7 passed from frozen final source. The
  named `clarity-*` captures reflect this final run; earlier regression report
  attachments preserve their original source and images.
- App/E2E typecheck, scoped oxlint, Prettier and diff checks passed after the
  final edit. Focused current-model/result/workspace unit suite: 27/27 passed.
  Wiki lint: green. No signatures or broadcasts; intercepted transaction logs
  stayed empty.

Owner inspected desktop, 900px, light/dark phone, translated phone layouts and
the grouped save footer. Screenshots are ordinary 900px-height viewport captures,
not full-page sheets. The phone lab-navigation crowding is unchanged lab chrome.

Low-profile self-review covered correctness and product intent. The mechanical
scope tool's medium size signal includes more than 2,000 accumulated dirty files
and prior audit artifacts; this follow-up changes only local lab presentation,
illustrative reference values, localized copy and its checks. It does not widen
runtime authority or define a new shared contract. No independent-review or
human-acceptance claim is made. The user's 3005 preview was left running; isolated
3022 test servers shut down after their runs. No commit or push was made.
