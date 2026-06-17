# Improvements Plan

Temporary cleanup plan for `feature/split-discover-home-highlight-dtfs` after the merge.

## Goals

- Keep the homepage/discover split, but make the new highlighted DTF experience easier to maintain.
- Preserve intentional upcoming-DTF scaffolding while moving prototype mechanics behind typed boundaries.
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

2. Move animation and scroll side effects into focused hooks:
   - `useHomepageHeroScroll` for sticky desktop scroll offset, mobile scroll state, and stats visibility.
   - `useHighlightedCardVisibility` for transcript/ticker activation with `IntersectionObserver`.
   - `useAssetTickerTransition` for chain-version backing transitions.
   - `useTranscriptPlayback` for word highlighting and transcript scroll offset.
   - `useMeasuredMarquee` or similar for hover-card exposure scrolling with `ResizeObserver` and `requestAnimationFrame`.
   - Keep animation state updates requestAnimationFrame-batched, passive for scroll listeners, and disabled where `prefers-reduced-motion` applies.

3. Move shared performance helpers out of table/card files:
   - `getPerformanceDirection`
   - `getPaddedValueDomain`
   - seven-day historical query setup
   - percentage/chart color mapping

4. Rename designer/prototype components to product-facing names:
   - `DTFPackingAnimation` -> a clearer homepage-specific name.
   - `IndexDTFFeatureCard` -> a name that distinguishes homepage highlight cards from discover mobile cards.
   - `HighlightedDTFEndCard` -> a discover CTA name.

5. Isolate the CMC20 chain-version placeholder for upcoming DTFs:
   - Keep the current CMC20 chain-version behavior as intentional scaffolding for upcoming multi-chain DTFs.
   - Move the placeholder construction into a clearly named adapter/fixture module instead of inline UI logic.
   - Add a typed adapter so the UI does not mutate `IndexDTFItem` shape inline.
   - Replace the placeholder source with API/product metadata once upcoming DTF data is available.

6. Decide ownership for the transcript placeholder:
   - Keep the current placeholder text untouched until real token descriptions/transcripts are available.
   - Replace it with a data-backed field once product copy exists.

7. Consolidate discover table and highlighted-card chart fetching:
   - Avoid each card/table cell issuing duplicated historical requests.
   - Prefer a shared hook with stable cache keys and explicit enabled states.

8. Tighten accessibility:
   - Audit animated cards for keyboard states and focus order.
   - Add meaningful labels for chart-only information.
   - Respect reduced-motion behavior across ticker, transcript, and packing animations.

9. Add focused tests:
   - Home renders homepage hero without discover list.
   - Discover route renders filters and DTF sections.
   - Highlighted card handles no performance, inactive status, and chain-version tabs.
   - Chain filters preserve selected state and translated labels.
   - Animation hooks clean up observers, timers, animation frames, and scroll listeners.

10. Review CSS complexity and animation smoothness:
    - Extract repeated class groups into local constants only where they reduce noise.
    - Remove hover-only layout dependencies that make mobile behavior hard to reason about.
    - Verify responsive behavior for mobile, tablet, desktop, and wide desktop.
    - Verify animations avoid layout thrash by measuring in observers and animating with transforms/opacity where possible.
    - Keep scroll and ticker work off the critical render path.

11. Re-run i18n extraction after cleanup:
    - Confirm new messages land in `src/locales/*.po`.
    - Remove obsolete messages from deleted prototype copy when cleanup is complete.
