# Spec: Index DTF Issuance & Redemption

**Related Route:** `.../:tokenId/issuance` and `.../issuance/manual`
**Status:** Active

## 1. User Goal (JTBD)

When I visit this page, I am trying to **transact with the DTF's primary market** by creating new shares (minting) or breaking down my existing shares (redeeming).

## 2. Core Functional Requirements

- Must allow a user to switch between "Mint" and "Redeem" intentions.
- Must provide an input for the desired transaction amount.
- Must clearly display the exchange rate, including the required assets for a mint or the expected assets from a redeem.
- Must allow the user to submit the transaction to their connected wallet.
- Must provide a "manual" flow for advanced users who want to specify exact input amounts of each underlying asset.

## 3. Acceptance Criteria (BDD)

- **GIVEN** I am in "Mint" mode and want to mint 1 DTF share
  - **WHEN** I enter "1" into the amount field
  - **THEN** the UI must show me the exact amounts of collateral (e.g., 0.5 WETH, 1000 USDC) required for the transaction.
- **GIVEN** I am in "Redeem" mode and have a balance of 5 DTF shares
  - **WHEN** I try to enter "10" in the amount field
  - **THEN** the UI must show a validation error for insufficient balance.
  - **AND** the primary action button must be disabled.
