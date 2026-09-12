# Unverified source-capture prototype

This is preserved research work, not a passing test or an enabled acceptance
spec. It is deliberately outside `e2e/` and no existing test was disabled.
The user approved resumed verification on 2026-09-11 after the retry stop and
architectural reassessment. This combined prototype remains historical and is
not being enabled; replacement captures separate list, wallet and drawer work.

The prototype combines too many independent source observations. Before any
approved rerun, split Index table/disclosure, connected Index wallet, and Yield
table/drawer observations. Type-check the prototype before browser execution.
Keep the multichain list outside the single-chain Yield drawer replay mode.
Exact `GetTokenListOverview` tokenIds and chain identify the list response; one
chain's data must not answer a legacy-chain query. Source fixture values are
observations from different dates, not a coherent live portfolio valuation.

Attempts, in order:

1. Node rejected the JSON import without a JSON import attribute. No browser
   test ran. Replaced it with the file-backed fixture loader.
2. A too-broad Yield query overlay and invalid boolean replay setting caused
   the source to crash on a missing token-logo entry. This was an invalid test
   fixture, not evidence of a production defect. The correct replay setting is
   a chain ID or false, not a boolean true.
3. With replay disabled for the list and tokenIds constrained, the list reached
   the source table, but exact `fullyCollateralized()` calls were unmodeled for
   two recorded basket handlers. The run was interrupted; it did not pass.
   A brittle governed-row selector was also replaced after this attempt.
4. The next execution was rejected by the retry guard. The prepared explicit
   basket-call overrides and revised selector have **not been browser-verified**.

The final prototype retains these unverified corrections for inspection. No
passing source capture, drawer verification, wallet balance verification or
transaction result is claimed. The public DAO response beside this folder is
valid independently of this failed browser setup; its metadata gives its hash.

That proposed split is now complete: the replacement batch passed 18 source
checks, retaining 24 images in the [verified receipt](../verified/record.json).
It preserved fail-loud boundaries throughout. This archived prototype itself
remains unverified and is not enabled.
