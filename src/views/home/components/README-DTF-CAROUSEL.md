# DTF Carousel Component

## Overview

The DTF Carousel is a smooth-scrolling, interactive carousel component for displaying Decentralized Token Folios (DTFs) with Lenis-powered smooth scrolling and spring animations. It provides a sophisticated scroll-hijacking experience with natural entry/exit behavior at boundaries.

## Key Features

- **Smooth Scrolling**: Uses Lenis library for buttery-smooth cross-browser scrolling
- **Directional Memory**: Tracks exit direction to prevent pull-back when re-engaging
- **Index Preservation**: Maintains card position when exiting and re-entering carousel
- **Natural Boundaries**: Allows users to exit naturally at first/last cards
- **Spring Animations**: Framer Motion springs for fluid card transitions
- **Performance Optimized**: Memoized cards and proper RAF cleanup
- **Scrollbar Support**: Detects and handles scrollbar dragging correctly

## Component Structure

```typescript
interface DTFCarouselProps {
  dtfs: IndexDTFItem[]  // Array of DTF items to display
  isLoading?: boolean   // Loading state
}
```

## Behavioral Requirements

### Entry Behavior
1. **Initial Lock-in**: When user scrolls into carousel area, immediately capture scroll and move to first card
2. **Activation Zone**: Carousel activates when top edge is within 80% of viewport height
3. **Smooth Transition**: Use Lenis smooth scroll to position first card

### Exit Behavior
1. **Natural Exit at Boundaries**:
   - First card: Allow scroll up to exit
   - Last card: Allow scroll down to exit
2. **No Pull-back**: Once exited, don't pull user back from the same direction
3. **Directional Memory**: Track which direction user exited (top/bottom)

### Re-engagement Behavior
1. **Opposite Direction**: Can re-enter from opposite exit direction
2. **Same Direction Block**: Prevent re-engagement from same exit direction until fully out of viewport
3. **Index Preservation**: Return to last viewed card when re-entering

## Technical Implementation

### Core Dependencies
- **Lenis**: Smooth scroll library (v1.1.18+)
- **Framer Motion**: Animation library for spring physics
- **React**: 18+ with hooks

### Key State Management

```typescript
// Carousel active state
const [isActive, setIsActive] = useState(false)

// Current card index
const [currentIndex, setCurrentIndex] = useState(0)

// Track interaction for scroll hints
const [hasInteracted, setHasInteracted] = useState(false)

// Directional exit tracking (mutable refs for event handlers)
const exitDirection = useRef<'top' | 'bottom' | null>(null)
const lastExitIndex = useRef<number | null>(null)
```

### Lenis Integration

The component creates a Lenis instance with specific configuration:

```typescript
const lenis = new Lenis({
  wrapper: wrapperRef.current,
  content: contentRef.current,
  touchInertiaMultiplier: 0.5,  // Slower touch scrolling
  duration: 1.2,                 // Smooth animation duration
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  syncTouch: true,
  syncTouchLerp: 0.04,          // Touch response speed
  touchMultiplier: 1.5,
  wheelMultiplier: 0.8,          // Slower wheel scrolling
  infinite: false,
  autoResize: true,
})
```

### Performance Optimizations

1. **Memoized Card Component**: Prevents unnecessary re-renders
```typescript
const MemoizedCard = memo(({ dtf }: { dtf: IndexDTFItem }) => (
  <DTFHomeCardFixed dtf={dtf} />
))
```

2. **RAF Cleanup**: Proper cleanup prevents memory leaks
```typescript
let rafId: number
function raf(time: number) {
  lenis.raf(time)
  rafId = requestAnimationFrame(raf)
}
rafId = requestAnimationFrame(raf)

// Cleanup
return () => {
  cancelAnimationFrame(rafId)
  lenis.destroy()
}
```

## Known Issues & Pitfalls

### Safari Performance
- Safari has inherent performance limitations with complex scroll animations
- Current implementation prioritizes correct behavior over maximum performance
- Attempted optimizations that broke behavior:
  - Passive event listeners (broke scroll interception)
  - Will-change CSS (caused visual artifacts)
  - Transform3d optimizations (broke positioning)
  - Debounced updates (caused janky animations)

### Failed Optimization Attempts

1. **CSS-only Transforms**: Broke scroll position calculations
2. **Virtual Scrolling**: Incompatible with Lenis smooth scrolling
3. **Intersection Observer**: Too laggy for smooth transitions
4. **Passive Wheel Events**: Prevented proper scroll hijacking
5. **RequestIdleCallback**: Caused visible animation delays
6. **Web Workers**: Can't access DOM for scroll calculations

### Critical Implementation Details

1. **Never use passive wheel listeners** - Breaks scroll interception
2. **Always stop/start Lenis** - Don't try to override while running
3. **Use mutable refs in event handlers** - Avoid stale closures
4. **Track exit direction** - Essential for proper re-engagement
5. **Preserve last index** - Users expect position memory

## Testing Checklist

- [ ] Initial scroll into carousel locks to first card
- [ ] Can scroll through all cards smoothly
- [ ] Exit from first card by scrolling up works
- [ ] Exit from last card by scrolling down works
- [ ] No pull-back when exiting at boundaries
- [ ] Re-engagement from opposite direction works
- [ ] Re-engagement preserves last viewed card
- [ ] Scrollbar dragging works correctly
- [ ] Touch/trackpad scrolling works smoothly
- [ ] Spring animations are fluid
- [ ] No memory leaks on unmount

## Browser Compatibility

- ✅ Chrome/Edge: Excellent performance
- ✅ Firefox: Good performance
- ⚠️ Safari: Functional but reduced performance
- ✅ Mobile Safari: Acceptable touch performance
- ✅ Android Chrome: Good touch performance

## Future Improvements

If performance becomes critical, consider:
1. **Native CSS Scroll Snap**: Simpler but less control
2. **Reduced Motion Mode**: Disable animations for accessibility
3. **Progressive Enhancement**: Simpler carousel for older browsers
4. **GPU-accelerated Transforms**: Careful implementation required

## Maintenance Notes

This component went through extensive iteration to achieve the precise behavior requirements. Any changes should be carefully tested against the behavioral requirements above. The current implementation represents a careful balance between:

- Smooth user experience
- Predictable scroll behavior
- Cross-browser compatibility
- Code maintainability

When modifying, remember:
- Behavior correctness > Performance optimization
- Simple, working code > Complex optimizations
- Test all entry/exit scenarios
- Verify Safari compatibility