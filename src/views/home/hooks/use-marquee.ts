import { useEffect, useRef, useState } from 'react'

const SPEED = 30 // px/s
const RESUME_DELAY = 600
const FRICTION = 0.92
const MIN_VELOCITY = 0.05 // px/ms
const VELOCITY_WINDOW = 100 // ms
const DESKTOP_QUERY = '(min-width: 1024px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const addMQL = (mql: MediaQueryList, cb: () => void) => {
  if (mql.addEventListener) mql.addEventListener('change', cb)
  else (mql as MediaQueryList & { addListener: (cb: () => void) => void }).addListener(cb)
}

const removeMQL = (mql: MediaQueryList, cb: () => void) => {
  if (mql.removeEventListener) mql.removeEventListener('change', cb)
  else (mql as MediaQueryList & { removeListener: (cb: () => void) => void }).removeListener(cb)
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
    addMQL(desktop, update)
    addMQL(motion, update)
    return () => {
      removeMQL(desktop, update)
      removeMQL(motion, update)
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (disabled) {
      el.style.transform = ''
      return
    }

    let raf = 0
    let lastTs = 0
    let pauseUntil = 0
    let repeat = 0
    let visible = true
    let dragging = false
    let activePointerId: number | null = null
    let dragStartX = 0
    let dragStartOffset = 0
    let offset = 0
    let inertialVelocity = 0
    const samples: { t: number; x: number }[] = []

    const normalize = (nextOffset: number) => {
      if (repeat <= 0) return 0
      let normalized = nextOffset % repeat
      if (normalized > 0) normalized -= repeat
      return normalized
    }

    const measure = () => {
      const first = el.children[0] as HTMLElement | undefined
      const marker = el.children[itemsPerCopy] as HTMLElement | undefined
      if (!first || !marker) return
      const nextRepeat =
        marker.getBoundingClientRect().left -
        first.getBoundingClientRect().left
      if (nextRepeat <= 0 || nextRepeat === repeat) return
      repeat = nextRepeat
      offset = normalize(offset)
      el.style.transform = `translate3d(${offset}px, 0, 0)`
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure, { passive: true })

    const viewportEl = el.parentElement ?? el
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        lastTs = 0
      },
      { threshold: 0 }
    )
    io.observe(viewportEl)

    const syncVisibility = () => {
      lastTs = 0
    }
    document.addEventListener('visibilitychange', syncVisibility)

    const pushSample = (x: number) => {
      const now = performance.now()
      samples.push({ t: now, x })
      while (samples.length && now - samples[0].t > VELOCITY_WINDOW) {
        samples.shift()
      }
    }

    const computeVelocity = () => {
      if (samples.length < 2) return 0
      const first = samples[0]
      const last = samples[samples.length - 1]
      const dt = last.t - first.t
      if (dt <= 0) return 0
      return (last.x - first.x) / dt
    }

    const tick = (ts: number) => {
      if (repeat <= 0) {
        measure()
      }

      if (dragging || !visible || document.hidden) {
        lastTs = ts
      } else if (Math.abs(inertialVelocity) > 0) {
        if (!lastTs) {
          lastTs = ts
        } else {
          const dt = ts - lastTs
          offset = normalize(offset + inertialVelocity * dt)
          inertialVelocity *= Math.pow(FRICTION, dt / 16.67)
          if (Math.abs(inertialVelocity) <= MIN_VELOCITY) {
            inertialVelocity = 0
            pauseUntil = ts + RESUME_DELAY
            lastTs = 0
          } else {
            lastTs = ts
          }
          el.style.transform = `translate3d(${offset}px, 0, 0)`
        }
      } else if (ts < pauseUntil) {
        lastTs = 0
      } else if (!lastTs) {
        lastTs = ts
      } else {
        offset = normalize(offset - SPEED * ((ts - lastTs) / 1000))
        el.style.transform = `translate3d(${offset}px, 0, 0)`
        lastTs = ts
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onDown = (e: PointerEvent) => {
      if (dragging) return
      dragging = true
      inertialVelocity = 0
      activePointerId = e.pointerId
      dragStartX = e.clientX
      dragStartOffset = offset
      lastTs = 0
      samples.length = 0
      pushSample(e.clientX)
    }

    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== activePointerId) return
      offset = normalize(dragStartOffset + (e.clientX - dragStartX))
      el.style.transform = `translate3d(${offset}px, 0, 0)`
      pushSample(e.clientX)
    }

    const endDrag = () => {
      if (!dragging) return
      dragging = false
      activePointerId = null
      const velocity = computeVelocity()
      inertialVelocity = Math.abs(velocity) > MIN_VELOCITY ? velocity : 0
      if (!inertialVelocity) {
        pauseUntil = performance.now() + RESUME_DELAY
      }
      lastTs = 0
    }

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId) return
      endDrag()
    }

    el.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    el.addEventListener('lostpointercapture', endDrag, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('resize', measure)
      document.removeEventListener('visibilitychange', syncVisibility)
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      el.removeEventListener('lostpointercapture', endDrag)
      el.style.transform = ''
    }
  }, [disabled, itemsPerCopy])

  return { ref, disabled }
}
