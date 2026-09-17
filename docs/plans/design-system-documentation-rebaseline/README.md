# Design-system documentation S1 rebaseline

Status: **human-review-required**. Snapshot:
`02434707c0614d2262b10560eebb05cde4319931` on 2026-09-16.

S1 revalidated the documentation-experience plan after the upstream merge. It
changed documentation only. No shell, component, catalog, test, provider,
preview, production, Git-ref, stash, commit, or remote state changed.

## Evidence package

- [Migration ledger](migration-ledger.md) — all 9 foundation and 45 component
  IDs, protected routes/fragments/query state/preview documents/test boundaries,
  destinations, compatibility actions, migration owners, cleanup candidates,
  and unresolved classifications.
- [Post-merge audit](post-merge-audit.md) — current typed counts, corrected
  authority/content findings, the two distinct Table URL-state owners, and a
  fresh representative rendered recheck.
- [Provider/runtime baseline](provider-baseline.md) — inherited providers,
  denied-network behavior, outbound attempts, payload/runtime measurements,
  injected EIP-1193 trace, limits, and the human-gated U10 recommendation.
- [Independent re-review](independent-review.md) — fresh Claude review of
  authority preservation, compatibility coverage, rendered evidence, and U10;
  the four initial Important findings were repaired and the final verdict is
  Pass.

## Rebaseline result

- Typed authority remains 9 foundations (8 current-baseline, 1 exploratory)
  and 45 components (34 current-baseline, 6 exploratory, 5 undefined).
  `CURRENT_REVIEW` is empty and every component still has `adoptionStatus:
none`.
- The ledger records 9 route/fallback contracts, 23 fragment contracts, two
  separate Table URL-state owners, two Chart preview documents, 11 protected
  test-boundary groups, and 11 cleanup candidates. Cleanup remains later-slice
  work; S1 authorizes none of it.
- The stale Modal and Auctions presentations, ambiguous Meaning-colors label,
  candidate-era foundation scaffolding, stale Typography relative copy,
  foundation evidence placeholders, hashless Table default, apparently
  unimported control-geometry matrix, test-owned product audit, repeated
  provenance copy, and duplicate Chart controls all have current evidence and
  later owners.
- Typography's Recommended refinements are accepted current guidance, not an
  open candidate. S2b must preserve them.
- The current docs routes remain usable with all external traffic denied and
  make no observed account-request/sign/switch/send/write call. They still load
  a 5.322 MB decoded wallet chunk and attempt 79–86 external requests per cold
  route. The inherited provider boundary is therefore temporary, not accepted
  as the long-term documentation architecture.

## Human gates resolved for S2a-1

The evidence changes no typed design-system authority. On 2026-09-16 the user
approved the recommended disposition of these presentation/architecture choices:

1. **U1/U3 — navigation aliases:** use the proposed top-level IA and include
   temporary, explicitly labeled Legacy lab aliases for Tables/records, Forms,
   Navigation systems, and Transactions until their owning migrations land.
2. **U2 — activity and scope:** keep Paused/Deferred as presentation-only
   Workbench activity, never inferred from prose; use the U13 index as the sole
   Paused owner. Show the compact sourced scope line for Accepted items with a
   partial or provisional boundary.
3. **U4 — order:** retain Typography → Button → newcomer gate → Charts, with
   Select as the later clean repeatability check.
4. **U10 — first shell boundary:** use the same-build route-aware shell as the
   smallest reversible S2a-1 step while treating inherited providers as
   temporary. Rerun the exact baseline afterward. If provider/storage/request
   and payload costs remain materially unchanged, stop for a human choice
   between a provider split and standalone documentation entry before hosted
   preview or further migration expansion.
5. **U13 — markdown/inline projection:** use the minimal typed presentation
   index limited to source key, route, question, owner, and activity. It handles
   markdown and inline study owners without a new build-time parser, must fail
   tests on missing/renamed sources, and cannot copy normative or engineering
   prose.

U11/U12 remain later hosted-preview gates; they do not block local S2a-1. No
acceptable privacy/performance budget is inferred by U10.

## Verification

- Catalog, inventory-reconciliation, and Typography focused suites: 3 files,
  43 tests passed.
- Application and E2E TypeScript passed; lint exited green with inherited
  warnings. The complete unit inventory passed 162 files / 1,394 tests: the
  broad sandbox run passed 161 files / 1,393 tests and the sole native
  filesystem-watcher file passed 7/7 outside the sandbox. The packaged gate
  wrapper itself could not run because this checkout's existing pnpm store
  metadata requested an interactive modules-directory purge; verification used
  the already-installed project binaries without changing dependencies.
- Fresh current-tree render: Studies dark; Typography light/dark; hashless and
  approved Table branches light. The receipt names the unrendered placeholder
  and dark-Table limits for their owning slices.
- Denied-network production build and injected-provider runs completed on
  isolated loopback ports; no owned server remains running and port 3042 was
  never touched.
- Independent four-finding re-review: Pass.

The gates above are resolved. S2a-1 is authorized through the bounded
[implementation handoff](../design-system-documentation-shell-handoff.md). It
must stop before S2a-2 or component migration for human review and the U10
provider-boundary disposition.
