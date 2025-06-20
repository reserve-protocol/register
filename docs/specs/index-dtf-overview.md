# Spec: Index DTF Overview

**Related Route:** `.../:tokenId/overview`
**Status:** Active

## 1. User Goal (JTBD)

When I visit this page, I am trying to **quickly assess the viability and composition of this DTF** to decide if it's a trustworthy and interesting asset.

## 2. Core Functional Requirements

- Must display the DTF's essential summary statistics (e.g., Price/NAV, TVL).
- Must visualize the DTF's historical performance over selectable time ranges.
- Must detail the underlying assets that compose the DTF and their respective weights.
- Must provide descriptive information about the DTF's purpose and strategy.

## 3. Acceptance Criteria (BDD)

- **GIVEN** I am a user on the overview page
  - **WHEN** the page has finished loading
  - **THEN** I must see a chart displaying the DTF's price history.
  - **AND** I must see a list or graphic showing the assets inside the DTF and their percentages.
- **GIVEN** I am viewing the performance chart
  - **WHEN** I select a different time range (e.g., "7D", "1M")
  - **THEN** the chart must update to reflect the data for that selected range.
