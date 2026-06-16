# Improvements Plan

Temporary cleanup plan for `feature/split-discover-home-highlight-dtfs` after the merge.

## Goals

- Keep the homepage/discover split, but make the new highlighted DTF experience easier to maintain.
- Replace designer-prototype shortcuts with product data, typed boundaries, and smaller components.
- Preserve the current i18n conventions for all visible UI copy.

## Cleanup Tasks

1. Split `src/views/home/components/highlighted-dtfs.tsx` into focused modules:
   - `highlighted-dtfs/index.tsx`
   - `highlighted-dtfs/feature-card.tsx`
   - `highlighted-dtfs/performance-chart.tsx`
   - `highlighted-dtfs/collateral-ticker.tsx`
   - `highlighted-dtfs/chain-version-tabs.tsx`
   - `highlighted-dtfs/end-card.tsx`
   - `highlighted-dtfs/hooks.ts`
   - `highlighted-dtfs/types.ts`

2. Move shared performance helpers out of table/card files:
   - `getPerformanceDirection`
   - `getPaddedValueDomain`
   - seven-day historical query setup
   - percentage/chart color mapping

3. Rename designer/prototype components to product-facing names:
   - `DTFPackingAnimation` -> a clearer homepage-specific name.
   - `IndexDTFFeatureCard` -> a name that distinguishes homepage highlight cards from discover mobile cards.
   - `HighlightedDTFEndCard` -> a discover CTA name.

4. Replace temporary chain-version fixture data:
   - Remove the hard-coded CMC20 Ethereum dummy address.
   - Source chain versions from API/product metadata.
   - Add a typed adapter so the UI does not mutate `IndexDTFItem` shape inline.

5. Decide ownership for the transcript placeholder:
   - Keep the current placeholder text untouched until real token descriptions/transcripts are available.
   - Replace it with a data-backed field once product copy exists.

6. Consolidate discover table and highlighted-card chart fetching:
   - Avoid each card/table cell issuing duplicated historical requests.
   - Prefer a shared hook with stable cache keys and explicit enabled states.

7. Tighten accessibility:
   - Audit animated cards for keyboard states and focus order.
   - Add meaningful labels for chart-only information.
   - Respect reduced-motion behavior across ticker, transcript, and packing animations.

8. Add focused tests:
   - Home renders homepage hero without discover list.
   - Discover route renders filters and DTF sections.
   - Highlighted card handles no performance, inactive status, and chain-version tabs.
   - Chain filters preserve selected state and translated labels.

9. Review CSS complexity:
   - Extract repeated class groups into local constants only where they reduce noise.
   - Remove hover-only layout dependencies that make mobile behavior hard to reason about.
   - Verify responsive behavior for mobile, tablet, desktop, and wide desktop.

10. Re-run i18n extraction after cleanup:
    - Confirm new messages land in `src/locales/*.po`.
    - Remove obsolete messages from deleted prototype copy when cleanup is complete.
