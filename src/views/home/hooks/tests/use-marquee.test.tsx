import { act, render, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMarquee } from '../use-marquee'

// ---------- matchMedia mock ----------

type MqlMock = {
  matches: boolean
  listeners: Set<(e: { matches: boolean }) => void>
  addEventListener: (ev: string, cb: any) => void
  removeEventListener: (ev: string, cb: any) => void
}

const makeMql = (matches: boolean): MqlMock => {
  const listeners = new Set<(e: { matches: boolean }) => void>()
  return {
    matches,
    listeners,
    addEventListener: (_ev, cb) => {
      listeners.add(cb)
    },
    removeEventListener: (_ev, cb) => {
      listeners.delete(cb)
    },
  }
}

const fireMql = (mql: MqlMock, matches: boolean) => {
  mql.matches = matches
  mql.listeners.forEach((cb) => cb({ matches }))
}

let desktopMql: MqlMock
let motionMql: MqlMock

// ---------- Clock + rAF mock ----------
// Single clock drives both performance.now() and rAF timestamps, so
// `resumeAt` (set via performance.now()) lines up with `tick(ts)`.

let clock = 0
let rafQueue: Map<number, FrameRequestCallback>
let rafSeq = 0

const advance = (to: number) => {
  clock = to
  const entries = Array.from(rafQueue.entries())
  rafQueue.clear()
  for (const [, cb] of entries) cb(clock)
}

const setClock = (to: number) => {
  clock = to
}

// ---------- IntersectionObserver mock ----------

let ioInstances: MockIO[]

class MockIO {
  cb: IntersectionObserverCallback
  root = null
  rootMargin = ''
  thresholds = []
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb
    ioInstances.push(this)
  }
  observe(el: Element) {
    this.cb(
      [{ isIntersecting: true, target: el } as any],
      this as any
    )
  }
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return []
  }
  _fire(el: Element, isIntersecting: boolean) {
    this.cb(
      [{ isIntersecting, target: el } as any],
      this as any
    )
  }
}

// ---------- Setup ----------

beforeEach(() => {
  desktopMql = makeMql(false)
  motionMql = makeMql(false)
  window.matchMedia = ((query: string) => {
    if (query.includes('1024')) return desktopMql as any
    if (query.includes('reduce')) return motionMql as any
    return makeMql(false) as any
  }) as any

  clock = 0
  rafQueue = new Map()
  rafSeq = 0
  window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    const id = ++rafSeq
    rafQueue.set(id, cb)
    return id
  }) as any
  window.cancelAnimationFrame = ((id: number) => {
    rafQueue.delete(id)
  }) as any

  vi.spyOn(performance, 'now').mockImplementation(() => clock)

  ioInstances = []
  ;(window as any).IntersectionObserver = MockIO

  HTMLElement.prototype.setPointerCapture = vi.fn()
  HTMLElement.prototype.releasePointerCapture = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------- Component harness ----------

const BOX_WIDTH = 100
const GAP = 8
const ITEMS_PER_COPY = 5
const REPEAT = ITEMS_PER_COPY * (BOX_WIDTH + GAP) // 540

const stubBoxGeometry = (track: HTMLElement) => {
  Array.from(track.children).forEach((child, i) => {
    const x = i * (BOX_WIDTH + GAP)
    ;(child as HTMLElement).getBoundingClientRect = () =>
      ({
        left: x,
        right: x + BOX_WIDTH,
        top: 0,
        bottom: BOX_WIDTH,
        width: BOX_WIDTH,
        height: BOX_WIDTH,
        x,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect
  })
}

const Host = ({
  items = ITEMS_PER_COPY,
  copies = 3,
}: {
  items?: number
  copies?: number
}) => {
  const { ref, disabled } = useMarquee<HTMLDivElement>(items)
  const total = items * copies
  return (
    <>
      <div ref={ref} data-testid="track">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} data-testid={`box-${i}`} />
        ))}
      </div>
      <span data-testid="disabled">{String(disabled)}</span>
    </>
  )
}

const renderHost = (props?: { items?: number; copies?: number }) => {
  const result = render(<Host {...props} />)
  const track = result.getByTestId('track') as HTMLDivElement
  stubBoxGeometry(track)
  return { ...result, track }
}

const pointer = (el: Element, type: string, clientX = 0) => {
  const ev: any = new Event(type, { bubbles: true, cancelable: true })
  ev.clientX = clientX
  ev.clientY = 0
  ev.pointerId = 1
  el.dispatchEvent(ev)
}

const parseTranslateX = (el: HTMLElement): number => {
  const m = el.style.transform.match(/translate3d\((-?\d+(?:\.\d+)?)px/)
  return m ? parseFloat(m[1]) : 0
}

// ---------- Gating ----------

describe('useMarquee — gating', () => {
  it('is disabled on desktop breakpoint', () => {
    desktopMql.matches = true
    const { result } = renderHook(() => useMarquee<HTMLDivElement>(5))
    expect(result.current.disabled).toBe(true)
  })

  it('is disabled with prefers-reduced-motion', () => {
    motionMql.matches = true
    const { result } = renderHook(() => useMarquee<HTMLDivElement>(5))
    expect(result.current.disabled).toBe(true)
  })

  it('is enabled on mobile with normal motion', () => {
    const { result } = renderHook(() => useMarquee<HTMLDivElement>(5))
    expect(result.current.disabled).toBe(false)
  })

  it('flips to disabled when viewport crosses lg breakpoint', () => {
    const { result } = renderHook(() => useMarquee<HTMLDivElement>(5))
    expect(result.current.disabled).toBe(false)
    act(() => fireMql(desktopMql, true))
    expect(result.current.disabled).toBe(true)
  })

  it('flips to enabled when viewport drops below lg breakpoint', () => {
    desktopMql.matches = true
    const { result } = renderHook(() => useMarquee<HTMLDivElement>(5))
    expect(result.current.disabled).toBe(true)
    act(() => fireMql(desktopMql, false))
    expect(result.current.disabled).toBe(false)
  })

  it('flips to disabled when user enables reduced motion', () => {
    const { result } = renderHook(() => useMarquee<HTMLDivElement>(5))
    act(() => fireMql(motionMql, true))
    expect(result.current.disabled).toBe(true)
  })
})

// ---------- Motion ----------

describe('useMarquee — motion', () => {
  it('does not apply transform when disabled', () => {
    desktopMql.matches = true
    const { track } = renderHost()
    act(() => advance(16))
    expect(track.style.transform).toBe('')
  })

  it('advances offset to the left over time when enabled', () => {
    const { track } = renderHost()
    act(() => advance(16)) // first frame: establishes lastTs, no motion
    expect(parseTranslateX(track)).toBe(0)
    act(() => advance(1016)) // 1s delta → -30 px
    expect(parseTranslateX(track)).toBeCloseTo(-30, 1)
  })

  it('wraps seamlessly when offset exceeds one repeat distance', () => {
    const { track } = renderHost({ items: ITEMS_PER_COPY, copies: 3 })
    act(() => advance(16))
    // After ~20s at 30 px/s, offset accumulates past -REPEAT and wraps
    act(() => advance(20_016))
    const x = parseTranslateX(track)
    expect(x).toBeLessThanOrEqual(0)
    expect(x).toBeGreaterThan(-REPEAT)
  })

  it('clears transform when transitioning enabled → disabled', () => {
    const { track } = renderHost()
    act(() => advance(16))
    act(() => advance(1016))
    expect(parseTranslateX(track)).not.toBe(0)
    act(() => fireMql(desktopMql, true))
    expect(track.style.transform).toBe('')
  })

  it('pauses motion when the section leaves the viewport', () => {
    const { track } = renderHost()
    act(() => advance(16))
    act(() => advance(1016))
    const before = parseTranslateX(track)
    expect(before).toBeLessThan(0)
    act(() => ioInstances[0]._fire(track, false))
    act(() => advance(11_016))
    expect(parseTranslateX(track)).toBeCloseTo(before, 1)
  })

  it('resumes motion when the section re-enters the viewport', () => {
    const { track } = renderHost()
    act(() => advance(16))
    act(() => advance(1016))
    act(() => ioInstances[0]._fire(track, false))
    act(() => advance(2016))
    const paused = parseTranslateX(track)
    act(() => ioInstances[0]._fire(track, true))
    act(() => advance(3016)) // first frame after resume: delta=0 (lastTs reset)
    act(() => advance(4016)) // 1s → -30 more
    expect(parseTranslateX(track)).toBeCloseTo(paused - 30, 1)
  })
})

// ---------- Drag ----------

describe('useMarquee — drag', () => {
  it('pauses auto-scroll during drag', () => {
    const { track } = renderHost()
    act(() => advance(16))
    act(() => advance(1016))
    const before = parseTranslateX(track)
    setClock(1016)
    act(() => pointer(track, 'pointerdown', 200))
    // Time passes with no pointermove → offset must not change
    act(() => advance(4016))
    expect(parseTranslateX(track)).toBeCloseTo(before, 1)
  })

  it('updates transform based on pointer delta while dragging', () => {
    const { track } = renderHost()
    act(() => advance(16))
    act(() => advance(1016))
    const startOffset = parseTranslateX(track)
    act(() => pointer(track, 'pointerdown', 200))
    act(() => pointer(track, 'pointermove', 150)) // -50
    expect(parseTranslateX(track)).toBeCloseTo(startOffset - 50, 1)
    act(() => pointer(track, 'pointermove', 100)) // -100 from start
    expect(parseTranslateX(track)).toBeCloseTo(startOffset - 100, 1)
  })

  it('respects RESUME_DELAY after pointerup', () => {
    const { track } = renderHost()
    act(() => advance(16))
    act(() => advance(1016))
    setClock(1016)
    act(() => pointer(track, 'pointerdown', 200))
    act(() => pointer(track, 'pointerup', 200))
    // resumeAt = 1016 + 600 = 1616
    const afterRelease = parseTranslateX(track)
    act(() => advance(1500)) // still within delay window
    expect(parseTranslateX(track)).toBeCloseTo(afterRelease, 1)
    act(() => advance(2000)) // past delay — first post-resume frame (delta=0)
    act(() => advance(3000)) // 1s of real motion → -30
    expect(parseTranslateX(track)).toBeCloseTo(afterRelease - 30, 1)
  })

  it('ends drag when lostpointercapture fires', () => {
    const { track } = renderHost()
    act(() => advance(16))
    act(() => advance(1016))
    act(() => pointer(track, 'pointerdown', 200))
    act(() => pointer(track, 'pointermove', 150))
    const held = parseTranslateX(track)
    act(() => pointer(track, 'lostpointercapture'))
    // Subsequent pointermoves are ignored (drag ended)
    act(() => pointer(track, 'pointermove', 50))
    expect(parseTranslateX(track)).toBeCloseTo(held, 1)
  })

  it('ends drag when pointercancel fires', () => {
    const { track } = renderHost()
    act(() => advance(16))
    act(() => advance(1016))
    act(() => pointer(track, 'pointerdown', 200))
    act(() => pointer(track, 'pointermove', 150))
    const held = parseTranslateX(track)
    act(() => pointer(track, 'pointercancel', 150))
    act(() => pointer(track, 'pointermove', 50))
    expect(parseTranslateX(track)).toBeCloseTo(held, 1)
  })
})

// ---------- Cleanup ----------

describe('useMarquee — cleanup', () => {
  it('clears transform on unmount', () => {
    const { track, unmount } = renderHost()
    act(() => advance(16))
    act(() => advance(1016))
    expect(parseTranslateX(track)).not.toBe(0)
    unmount()
    expect(track.style.transform).toBe('')
  })

  it('stops scheduling frames after unmount', () => {
    const { unmount } = renderHost()
    act(() => advance(16))
    act(() => advance(100))
    expect(rafQueue.size).toBeGreaterThan(0)
    unmount()
    act(() => advance(200))
    expect(rafQueue.size).toBe(0)
  })
})
