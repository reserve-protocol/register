import { useEffect, useRef, useState } from 'react'

const SPEED = 30 // px/s
const RESUME_DELAY = 600
const DESKTOP_QUERY = '(min-width: 1024px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

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
      el.style.transform = ''
      return
    }

    let raf = 0
    let lastTs = 0
    let offset = 0
    let repeat = 0
    let dragging = false
    let dragStartX = 0
    let dragStartOffset = 0
    let resumeAt = 0
    let visible = true

    const measure = () => {
      const first = el.children[0] as HTMLElement | undefined
      const marker = el.children[itemsPerCopy] as HTMLElement | undefined
      if (!first || !marker) return
      repeat =
        marker.getBoundingClientRect().left -
        first.getBoundingClientRect().left
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure, { passive: true })

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
      },
      { threshold: 0 }
    )
    io.observe(el)

    const apply = () => {
      if (repeat > 0) {
        if (offset <= -repeat) offset += repeat
        else if (offset > 0) offset -= repeat
      }
      el.style.transform = `translate3d(${offset}px, 0, 0)`
    }

    const tick = (ts: number) => {
      const running = !dragging && visible && !document.hidden && ts >= resumeAt
      if (!running) {
        lastTs = 0 // reset so resume doesn't produce a big delta jump
      } else {
        if (repeat <= 0) measure() // late-layout catch-up
        const delta = lastTs ? (ts - lastTs) / 1000 : 0
        lastTs = ts
        offset -= SPEED * delta
        apply()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onDown = (e: PointerEvent) => {
      dragging = true
      dragStartX = e.clientX
      dragStartOffset = offset
      try {
        el.setPointerCapture(e.pointerId)
      } catch {}
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      offset = dragStartOffset + (e.clientX - dragStartX)
      apply()
    }
    const endDrag = () => {
      if (!dragging) return
      dragging = false
      resumeAt = performance.now() + RESUME_DELAY
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
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('resize', measure)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('lostpointercapture', endDrag)
      el.style.transform = ''
    }
  }, [disabled, itemsPerCopy])

  return { ref, disabled }
}
