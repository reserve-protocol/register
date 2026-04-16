# Demo notes: Zap quote aggregation (Reserve + Enso)

This demo flow is implemented in the frontend zap quote query logic:

- Reserve quote endpoint is requested in parallel with Enso quote endpoint.
- Each provider request retries up to 3 times on transient failures.
- Enso responses are normalized into the app's existing `ZapResponse` contract.
- The best successful quote is selected by highest output score (`amountOutValue` first, fallback to `amountOut`).

## Files

- `src/hooks/zap-quote-providers.ts` — provider integration, normalization, retries, selection.
- `src/hooks/useZapSwapQuery.ts` — hook orchestration + analytics tracking.
