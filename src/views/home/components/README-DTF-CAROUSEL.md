# DTF Carousel Component

## Overview

The DTF Carousel is a smooth-scrolling, interactive carousel component for displaying Decentralized Token Folios (DTFs) with Lenis-powered smooth scrolling and spring animations.

**Version 2.0** - Fully refactored with modular architecture and custom hooks.

## Architecture

### File Structure

```
components/
├── dtf-carousel.tsx           # Main carousel component
├── dtf-home-card-fixed.tsx    # Card component
└── hooks/
    ├── use-carousel-state.ts       # State management & navigation
    ├── use-lenis-scroll.ts         # Lenis smooth scroll integration
    ├── use-carousel-activation.ts  # Entry/exit detection logic
    └── use-scrollbar-detection.ts  # Scrollbar drag handling
```

### Key Features

- **Smooth Scrolling**: Lenis library for cross-browser consistency
- **Smart Activation**: Automatic entry when carousel approaches viewport
- **Natural Exit**: Smooth exit at boundaries without pull-back
- **Directional Memory**: Prevents re-engagement from same exit direction
- **Index Preservation**: Maintains position across sessions
- **Scrollbar Support**: Handles scrollbar dragging gracefully
- **Spring Animations**: Framer Motion for fluid transitions

## Configuration

All configuration is centralized in `CONFIG` object:

```typescript
const CONFIG = {
  // Layout
  HEADER_HEIGHT: 72,
  CARD_HEIGHT: 720,
  CARD_OFFSET: 20,          // Vertical spacing between stacked cards
  SCALE_FACTOR: 0.05,        // Scale reduction per card
  MAX_STACK_DEPTH: 3,        // Maximum visible cards

  // Interaction
  SCROLL_THRESHOLD: 50,      // Scroll amount to trigger navigation
  TRANSITION_DURATION: 500,  // Card animation duration

  // Activation zones
  TOP_THRESHOLD: 200,        // Distance from top to activate
  BOTTOM_THRESHOLD: 100,     // Distance from bottom to activate
  EXIT_DEAD_ZONE: 200,       // Dead zone after exit
}
```

## Custom Hooks

### `useCarouselState`

Manages carousel state and navigation logic:
- Tracks current index and active state
- Handles scroll accumulation
- Manages card transitions
- Provides navigation methods

### `useLenisScroll`

Integrates Lenis smooth scroll:
- Initializes Lenis instance
- Manages RAF loop
- Provides stop/start control
- Handles cleanup

### `useCarouselActivation`

Controls entry/exit behavior:
- Detects approach from top/bottom
- Manages exit direction tracking
- Prevents unwanted re-engagement
- Handles dead zones

### `useScrollbarDetection`

Handles scrollbar interactions:
- Detects scrollbar dragging
- Deactivates carousel during drag
- Preserves index for re-engagement
- Manages Lenis state

## Behavioral Flow

### Entry Flow

1. User scrolls near carousel (within threshold)
2. Carousel detects approach direction
3. Smooth scroll to locked position
4. Lenis stops for carousel control
5. Initial index set based on approach

### Navigation Flow

1. User scrolls/swipes while active
2. Scroll accumulates until threshold
3. Card transition triggers
4. Animation completes
5. Ready for next input

### Exit Flow

1. User scrolls at boundary (first/last card)
2. Exit detection triggers
3. Exit direction saved
4. Lenis restarts for normal scroll
5. Dead zone prevents immediate re-entry

## Performance Optimizations

- **Memoized Cards**: Prevents unnecessary re-renders
- **RAF Management**: Proper cleanup prevents memory leaks
- **Ref-based State**: Avoids stale closures in event handlers
- **Passive Events**: Where appropriate for better scroll performance
- **Configuration Constants**: Centralized for easy tuning

## Browser Compatibility

- ✅ Chrome/Edge: Excellent
- ✅ Firefox: Good
- ⚠️ Safari: Functional (reduced performance)
- ✅ Mobile: Touch-optimized

## Known Limitations

### Safari Performance
Safari has inherent limitations with complex scroll animations. The current implementation prioritizes correct behavior over maximum performance.

### Optimization Trade-offs
Several optimizations were attempted but rejected due to behavioral issues:
- Passive wheel listeners (broke scroll interception)
- CSS-only transforms (broke position calculations)
- Debounced updates (caused janky animations)

## Usage

```tsx
import DTFCarousel from './components/dtf-carousel'
import { IndexDTFItem } from '@/hooks/useIndexDTFList'

function HomePage() {
  const { data: dtfs, isLoading } = useIndexDTFList()

  return (
    <DTFCarousel
      dtfs={dtfs}
      isLoading={isLoading}
    />
  )
}
```

## Testing Checklist

- [ ] Initial entry locks to appropriate card
- [ ] Smooth navigation between cards
- [ ] Exit at boundaries without pull-back
- [ ] Dead zone prevents immediate re-entry
- [ ] Re-engagement from opposite direction works
- [ ] Index preserved across sessions
- [ ] Scrollbar dragging handled correctly
- [ ] Keyboard navigation (arrow keys)
- [ ] Touch/trackpad scrolling smooth
- [ ] No memory leaks on unmount

## Maintenance Notes

The refactored architecture makes the carousel much more maintainable:

1. **Modular hooks** - Each concern is isolated
2. **Clear configuration** - Easy to tune behavior
3. **Separation of concerns** - UI, state, and effects are separate
4. **Type safety** - Full TypeScript coverage
5. **Human-readable** - Clear variable names and comments

When modifying:
- Test all entry/exit scenarios
- Verify Safari compatibility
- Check scrollbar interaction
- Ensure smooth animations
- Validate memory cleanup

## Version History

- **v1.0** - Initial implementation with inline logic
- **v2.0** - Full refactor with modular architecture and custom hooks