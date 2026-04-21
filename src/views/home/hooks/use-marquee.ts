import { useEffect, useRef, useState } from 'react'

const SPEED = 30 // px/s cruise speed
const FRICTION = 0.92 // per-frame (16.67ms) velocity decay during inertia
const MIN_VELOCITY = 0.05 // px/ms — below this, inertia stops and cruise resumes
const VELOCITY_WINDOW = 100 // ms — samples kept for pointerup velocity calc
const KEYFRAME_NAME = 'marquee-cruise-x'
const DESKTOP_QUERY = '(min-width: 1024px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

// Inject the cruise keyframes once per document.
let keyframesInjected = false
const injectKeyframes = () => {
  if (keyframesInjected || typeof document === 'undefined') return
  const style = document.createElement('style')
  style.textContent = `@keyframes ${KEYFRAME_NAME} { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(var(--marquee-repeat), 0, 0); } }`
  document.head.appendChild(style)
  keyframesInjected = true
}

export function useMarquee<T extends HTMLElement>(itemsPerCopy: number) {
  const ref = useRef<T>(null)
  const [disabled, setDisabled] = useState(
    () =>
      typeof window === 'undefined' ||
      window.matchMedia(DESKTOP_QUERY).matches ||
      window.matchMedia(REDUCED_MOTION_QUERY).matches
  )

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY)
    const motion = window.matchMedia(REDUCED_MOTION_QUERY)
    const update = () => setDisabled(desktop.matches || motion.matches)
    desktop.addEventListener('change', update)
    motion.addEventListener('change', update)
    return () => {
      desktop.removeEventListener('change', update)
      motion.removeEventListener('change', update)
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (disabled) {
      el.style.animation = ''
      el.style.transform = ''
      el.style.removeProperty('--marquee-repeat')
      return
    }

    injectKeyframes()

    let repeat = 0
    let visible = true
    let dragging = false
    let inertiaRaf = 0
    let dragStartX = 0
    let dragStartOffset = 0
    let currentOffset = 0
    const samples: { t: number; x: number }[] = []

    const readOffset = () => {
      const transform = getComputedStyle(el).transform
      if (!transform || transform === 'none') return 0
      try {
        return new DOMMatrixReadOnly(transform).m41
      } catch {
        return 0
      }
    }

    // Fold offset into the (-repeat, 0] range so we can map it back into animation progress.
    const normalize = (offset: number) => {
      if (repeat <= 0) return 0
      let n = offset % repeat
      if (n > 0) n -= repeat
      return n
    }

    const startCruise = (offset = 0) => {
      if (repeat <= 0) return
      const duration = repeat / SPEED
      const normalized = normalize(offset)
      // Keyframe runs 0 → -repeat; at progress p, transform = -repeat * p.
      // p = -normalized / repeat, so animation-delay = -p * duration = (normalized / repeat) * duration.
      const delay = (normalized / repeat) * duration
      el.style.setProperty('--marquee-repeat', `${-repeat}px`)
      el.style.transform = ''
      el.style.animation = `${KEYFRAME_NAME} ${duration}s linear ${delay}s infinite`
      el.style.animationPlayState =
        visible && !document.hidden ? 'running' : 'paused'
    }

    const stopCruise = () => {
      // Order matters: read computed transform first, pin it inline, THEN clear the animation —
      // same synchronous tick means no paint-flicker between animation-driven and inline transform.
      const offset = readOffset()
      el.style.transform = `translate3d(${offset}px, 0, 0)`
      el.style.animation = ''
      return offset
    }

    const measure = () => {
      const first = el.children[0] as HTMLElement | undefined
      const marker = el.children[itemsPerCopy] as HTMLElement | undefined
      if (!first || !marker) return
      const next =
        marker.getBoundingClientRect().left -
        first.getBoundingClientRect().left
      if (next === repeat) return
      repeat = next
      if (!dragging && !inertiaRaf) startCruise(readOffset())
    }

    measure()
    if (repeat > 0) startCruise(0)

    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure, { passive: true })

    const syncPlayState = () => {
      if (dragging || inertiaRaf) return
      el.style.animationPlayState =
        visible && !document.hidden ? 'running' : 'paused'
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        syncPlayState()
      },
      { threshold: 0 }
    )
    io.observe(el)

    document.addEventListener('visibilitychange', syncPlayState)

    const pushSample = (x: number) => {
      const t = performance.now()
      samples.push({ t, x })
      while (samples.length && t - samples[0].t > VELOCITY_WINDOW) {
        samples.shift()
      }
    }

    const computeVelocity = () => {
      if (samples.length < 2) return 0
      const first = samples[0]
      const last = samples[samples.length - 1]
      const dt = last.t - first.t
      if (dt <= 0) return 0
      return (last.x - first.x) / dt // px/ms
    }

    const runInertia = (initial: number, startOffset: number) => {
      let velocity = initial
      let offset = startOffset
      let last = performance.now()
      const step = (ts: number) => {
        const dt = ts - last
        last = ts
        offset += velocity * dt
        velocity *= Math.pow(FRICTION, dt / 16.67)
        // Keep offset wrapped so a fast flick never runs past the 3-copy strip.
        offset = normalize(offset)
        el.style.transform = `translate3d(${offset}px, 0, 0)`
        if (Math.abs(velocity) > MIN_VELOCITY) {
          inertiaRaf = requestAnimationFrame(step)
        } else {
          inertiaRaf = 0
          startCruise(offset)
        }
      }
      inertiaRaf = requestAnimationFrame(step)
    }

    const onDown = (e: PointerEvent) => {
      if (inertiaRaf) {
        cancelAnimationFrame(inertiaRaf)
        inertiaRaf = 0
      }
      dragging = true
      currentOffset = stopCruise()
      dragStartX = e.clientX
      dragStartOffset = currentOffset
      samples.length = 0
      pushSample(e.clientX)
      try {
        el.setPointerCapture(e.pointerId)
      } catch {}
    }

    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      // Wrap during drag so a long swipe can't expose the end of the 3-copy strip.
      currentOffset = normalize(dragStartOffset + (e.clientX - dragStartX))
      el.style.transform = `translate3d(${currentOffset}px, 0, 0)`
      pushSample(e.clientX)
    }

    const endDrag = () => {
      if (!dragging) return
      dragging = false
      const velocity = computeVelocity()
      if (Math.abs(velocity) > MIN_VELOCITY) {
        runInertia(velocity, currentOffset)
      } else {
        startCruise(currentOffset)
      }
    }

    const onUp = (e: PointerEvent) => {
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {}
      endDrag()
    }

    el.addEventListener('pointerdown', onDown, { passive: true })
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerup', onUp, { passive: true })
    el.addEventListener('pointercancel', onUp, { passive: true })
    el.addEventListener('lostpointercapture', endDrag, { passive: true })

    return () => {
      if (inertiaRaf) cancelAnimationFrame(inertiaRaf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('resize', measure)
      document.removeEventListener('visibilitychange', syncPlayState)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('lostpointercapture', endDrag)
      el.style.animation = ''
      el.style.transform = ''
      el.style.removeProperty('--marquee-repeat')
    }
  }, [disabled, itemsPerCopy])

  return { ref, disabled }
}
