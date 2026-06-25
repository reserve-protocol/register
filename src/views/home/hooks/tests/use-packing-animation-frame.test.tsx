import { act, render } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePackingAnimationFrame } from '../use-packing-animation-state'

// ---------- matchMedia mock (prefers-reduced-motion) ----------

let reduceMatches = false

// ---------- Clock + rAF mock ----------

let clock = 0
let rafQueue: Map<number, FrameRequestCallback>
let rafSeq = 0

const advance = (to: number) => {
  clock = to
  const entries = Array.from(rafQueue.entries())
  rafQueue.clear()
  for (const [, cb] of entries) cb(clock)
}

// ---------- IntersectionObserver mock ----------

let ioInstances: MockIO[]

class MockIO {
  cb: IntersectionObserverCallback
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb
    ioInstances.push(this)
  }
  observe(el: Element) {
    this.cb([{ isIntersecting: true, target: el } as any], this as any)
  }
  disconnect = vi.fn()
  unobserve() {}
  takeRecords() {
    return []
  }
  _fire(el: Element, isIntersecting: boolean) {
    this.cb([{ isIntersecting, target: el } as any], this as any)
  }
}

// ---------- document.hidden helper ----------

const setHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => hidden,
  })
}

// ---------- Setup ----------

beforeEach(() => {
  reduceMatches = false
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce') ? reduceMatches : false,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  })) as any

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

  ioInstances = []
  ;(window as any).IntersectionObserver = MockIO
  setHidden(false)
})

afterEach(() => {
  vi.restoreAllMocks()
  setHidden(false)
})

// ---------- Harness ----------

const Host = ({ onFrame }: { onFrame: (t: number) => void }) => {
  const ref = useRef<HTMLDivElement>(null)
  usePackingAnimationFrame(onFrame, ref)
  return <div ref={ref} data-testid="container" />
}

describe('usePackingAnimationFrame', () => {
  it('calls onFrame each frame with the elapsed time since the first frame', () => {
    const onFrame = vi.fn()
    render(<Host onFrame={onFrame} />)

    act(() => advance(16)) // first frame anchors start → elapsed 0
    expect(onFrame).toHaveBeenLastCalledWith(0)

    act(() => advance(1016)) // 1s later → elapsed 1000
    expect(onFrame).toHaveBeenLastCalledWith(1000)
  })

  it('keeps scheduling frames over time', () => {
    const onFrame = vi.fn()
    render(<Host onFrame={onFrame} />)
    act(() => advance(16))
    act(() => advance(32))
    act(() => advance(48))
    expect(onFrame.mock.calls.length).toBeGreaterThanOrEqual(3)
  })

  it('renders a single static frame and schedules nothing under reduced motion', () => {
    reduceMatches = true
    const onFrame = vi.fn()
    render(<Host onFrame={onFrame} />)

    expect(onFrame).toHaveBeenCalledTimes(1)
    expect(onFrame).toHaveBeenCalledWith(0)
    expect(rafQueue.size).toBe(0)
  })

  it('skips frame work while the document is hidden, resumes when visible', () => {
    const onFrame = vi.fn()
    render(<Host onFrame={onFrame} />)
    act(() => advance(16))
    onFrame.mockClear()

    setHidden(true)
    act(() => advance(1016))
    expect(onFrame).not.toHaveBeenCalled()

    setHidden(false)
    act(() => advance(2016))
    expect(onFrame).toHaveBeenCalledTimes(1)
  })

  it('pauses while the container is out of the viewport, resumes on re-entry', () => {
    const onFrame = vi.fn()
    const { getByTestId } = render(<Host onFrame={onFrame} />)
    const el = getByTestId('container')
    act(() => advance(16))
    onFrame.mockClear()

    act(() => ioInstances[0]._fire(el, false))
    act(() => advance(1016))
    expect(onFrame).not.toHaveBeenCalled()

    act(() => ioInstances[0]._fire(el, true))
    act(() => advance(2016))
    expect(onFrame).toHaveBeenCalledTimes(1)
  })

  it('cancels the loop and disconnects the observer on unmount', () => {
    const onFrame = vi.fn()
    const { unmount } = render(<Host onFrame={onFrame} />)
    act(() => advance(16))
    expect(rafQueue.size).toBeGreaterThan(0)
    const observer = ioInstances[0]

    unmount()
    expect(observer.disconnect).toHaveBeenCalled()
    act(() => advance(32))
    expect(rafQueue.size).toBe(0)
  })
})
