# VLONE / MVTT10F deprecation

- Base: `7155c7a21`; medium, one governance action. The mechanical high hint counts locale catalogs and docs; this remains one feature-local slice.
- Add a Base-only proposal action for VLONE and MVTT10F. Match the executed MVDA25 proposal: deprecateFolio, revoke rebalance managers, revoke auction launchers, revoke owner timelock admin last.
- Reuse standard SDK proposal submission and existing receipt navigation. No direct execution, other DTFs, or dependency patches. Commit, branch push, and PR creation authorized by the user; merge and deployment are outside this task.
- Before signing, display the irreversible effect and exact role holders. Fail closed on unexpected admin ownership or missing SDK data; hide already deprecated DTFs.
- Acceptance: captured MVDA25 calldata oracle; scoped type/lint checks; browser submit and failure/gating checks; desktop/mobile visual check; Dark/Light review.
- Decision: use the SDK role lists as requested by Luis; no new RPC reads. Availability follows SDK catalog status and owner-admin membership.

Evidence: calldata oracle failed against empty implementation, then passed after encoding all six reference actions.

Validation: reference calldata RED→GREEN; duplicate governor filter RED→GREEN with captured SDK data; browser allowlist assertion RED→GREEN against LCAP; four temporary dialog integration checks (submit, voting power, reject/revert retry, wrong identity/status/duplicate guards); desktop/mobile dialogs checked with live SDK data for both DTFs. Temporary harness removed after verification. Isolated candidate: typecheck, lint, 920 unit tests green. Existing untracked transaction-hook test remains untouched and fails workspace typecheck. Dark finding (cross-governor duplicates) fixed and re-reviewed; Light passed. Smoke: 59 passed, one existing skip. Proposal browser flow: one passed. E2E typecheck and 72 harness tests passed; wiki-lint green. Scoped wrapper cannot use pnpm in the isolated copy with linked node_modules (it attempts reinstall); equivalent checks ran directly with the installed executables. State: human-review-required; prepared for PR review on `feat/deprecate-vlone-mvtt10f`. Engineer review required before shipping governance changes.
