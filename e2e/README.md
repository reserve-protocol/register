# Playwright E2E

This suite is intentionally narrow and deterministic.

- Scope: Index DTF flows first, starting with governance.
- Runtime model: one Chromium project, mocked RPC/API/subgraph traffic, no forked chain.
- Reliability goal: validate page composition, routing, proposal state rendering, and detail views without depending on live services.

## Structure

- `fixtures/`: shared Playwright fixtures.
- `helpers/`: mock servers and test data.
- `mocks/`: static API payloads.
- `tests/`: governance-first specs.

## Design Rules

- Prefer route-level mocks over brittle UI setup flows.
- Keep tests focused on user-visible outcomes, not implementation details.
- Add non-visual selectors only when semantic queries are not stable enough.
- Keep the default suite fast enough to run locally during feature work.

## Next Expansion

- Governance actions with wallet-connected flows.
- Proposal creation flows.
- Overview and issuance smoke coverage.
- Broader Index DTF navigation and critical transaction paths.
