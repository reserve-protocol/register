---
title: Governance Preview
updated: 2026-09-18
type: domain
sources:
  - src/views/index-dtf/governance/components/proposal-preview/rebalance-preview/legacy-basket-proposal-preview.tsx
  - src/views/index-dtf/governance/components/proposal-preview/tests/legacy-basket-proposal-preview.test.tsx
---

# Legacy basket allocation preview

Legacy `approveAuction` proposals encode sell floors and buy ceilings. A
`buyLimit.spot` of `10^54` is the unlimited ceiling; converting it directly to
a basket percentage produces astronomical expected allocations. The preview
instead transfers the available sell allocation into the buy token. Multiple
sellers accumulate; repeated approvals cannot spend the same allocation twice.
Finite limits retain their existing target calculation, and Raw shows the
original calldata. No builder, protocol, SDK or transaction changes are involved.

Allocation transfers use bigint D27 fractions (percentage strings have 25
decimals in those units), with conversion to numbers only for display. Inputs
are current rounded basket percentages, so this is a market-value estimate,
not a guarantee of auction proceeds or execution order. Do not infer general
mixed finite/unlimited trade simulation from this narrow rule.

The component regression fixture captures BDTF proposal `255795…1270` on Base:
six sells into USDC must display 100% USDC. Tests also cover partial sales,
repeated approvals, finite caps and retained sell allocation. Local browser
checks exercised the original live proposal on desktop and mobile. The strict
offline e2e registry does not yet include this legacy BDTF proposal.
