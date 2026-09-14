# Weight summary and familiar unit labels — September 14

Bounded, low-radius lab follow-up at fixed point `289b2af86`; prior dirty lab
work is input. The user authorized the remaining recent recommendations, not a
new lifecycle design or production change.

## Retained meaning

- Before target confirmation, Estimated trade value and Execution target remain
  visible as static dashes above the actual Duration. One associated explanation
  says Available after confirming target weights. No animated loading cue or
  fabricated zero is introduced for this prerequisite.
- Confirmation preserves that order and exposes the existing illustrative
  estimates. Unchanged defaults remain valid; unavailable prices still suppress
  estimates and disable launch. Reload returns to the unconfirmed summary.
- The editor restores Current units and New units, retaining current holdings,
  starting-target references and current-to-target allocations. The helper uses
  matching terminology. Existing unit-label translations are reused; the revised
  helper and prerequisite explanation are translated into es/ko/zh.
- The preceding outlined auction-size control is retained unchanged. Production
  math, parsing fallback, wallet actions, permissions and persistence are outside
  this follow-up. Exact-unit semantics still need engineer review before adoption.

## Verification

RED: the 1400px comparison test expected Estimated trade value, Execution target
and Duration but found only Duration. This failed at the rendered summary before
the implementation, not on a missing test identifier.

[Final browser report](browser-report.json): **19/19 passed**. The run combines
weight-comparison/editor journeys with affected hierarchy and risk/action checks:
1400/900/390/320, save/reopen/discard/reload, unchanged defaults, pending/unavailable
prices before and after confirmation, non-preset units and limits, keyboard limit
expansion, CSV, independent records, guarded Back, caps and transaction waits.
Translated 320px summaries and editors are captured. Each case records a stable
source fingerprint. No real transactions or signatures were requested.

App/E2E typecheck, scoped oxlint, Prettier, diff check and wiki lint pass. Owner
inspected desktop and phone summaries, known post-confirmation values, matching
editor terminology, dark mode and translated phone captures. Existing 320px lab
navigation crowding is outside this change. The long saved basket still uses the
previous bottom-aligned operation layout; no new geometry redesign is claimed.

Low-profile self-review covers correctness and product intent. The lab is ready
for human review, not production adoption or proof of financial correctness.
3005 is left running and the isolated 3022 test server shut down. No commit or
push. Earlier receipts retain their original source and captures.
