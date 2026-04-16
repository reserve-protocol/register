# Changelog

## Unreleased

### Added
- Integrated Enso as an additional frontend quote provider in the index zap flow.
- Added provider-level retry logic (up to 3 attempts per provider request).
- Added provider comparison metadata to zap quote analytics (`selectedProvider`, provider counts).

### Changed
- Refactored zap quote aggregation into `src/hooks/zap-quote-providers.ts` to isolate provider-specific normalization and best-quote selection.
- Kept response handling aligned to the existing standard `ZapResponse` shape used by current providers.
