# Spec: Index DTF Container

**Related Route:** `/:chain/index-dtf/:tokenId`
**Status:** Active

## 1. User Goal (JTBD)

When I navigate to any page for a specific DTF, I need a **consistent and reliable context** for that asset, so I can seamlessly move between different views like "Overview" and "Governance" without redundant loading or loss of context.

## 2. Core Functional Requirements

- Must fetch and establish the context for a single DTF based on the URL.
- Must provide a consistent layout shell (e.g., header, navigation) for all nested views.
- Must render the appropriate nested view based on the specific URL path.

## 3. Acceptance Criteria (BDD)

- **GIVEN** a user navigates to any valid sub-route of `.../:tokenId/`
  - **WHEN** the page begins to load
  - **THEN** a request to fetch the data for the specified `:tokenId` must be initiated.
  - **AND** a shared layout containing the DTF's name and primary navigation must be rendered.
- **GIVEN** the data for the `:tokenId` is being fetched
  - **WHEN** the user is waiting
  - **THEN** a loading state must be visible within the main content area.
- **GIVEN** a user navigates to a URL with an invalid `:tokenId`
  - **WHEN** the data fetch fails
  - **THEN** the main content area must display a "Product not found" error state, and no child view should be rendered.
