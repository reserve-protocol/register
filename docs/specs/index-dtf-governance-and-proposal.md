# Spec: Index DTF Governance Hub & Proposals

**Related Route:** `.../:tokenId/governance` and its sub-routes
**Status:** Active

## 1. User Goal (JTBD)

When I interact with these pages, I am trying to **exercise my rights as a stakeholder** by understanding, voting on, and creating proposals that direct the future of the DTF.

## 2. Core Functional Requirements

- **Governance Hub:** Must provide a summary of my current voting power and delegation status. It must display a filterable list of all proposals.
- **Proposal Details:** Must allow me to analyze a single proposal's description, effects, and current vote tally. If a vote is active, it must allow me to cast my vote.
- **Proposal Creation:** Must provide a guided experience to create a new, valid on-chain proposal for a specific action (e.g., changing the asset basket, updating a fee parameter).

## 3. Acceptance Criteria (BDD)

- **GIVEN** I have not delegated my voting power
  - **WHEN** I view the governance hub
  - **THEN** I must see a prominent message instructing me to delegate before I can vote.
- **GIVEN** a proposal is "Active" and I have delegated voting power
  - **WHEN** I view that proposal's details page
  - **THEN** the "For", "Against", and "Abstain" voting buttons must be enabled.
- **GIVEN** a proposal has already "Passed"
  - **WHEN** I view its details page
  - **THEN** the voting buttons must be disabled.
