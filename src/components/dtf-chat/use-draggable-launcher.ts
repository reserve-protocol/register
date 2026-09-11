import { type RefObject, useEffect } from 'react'

const DRAG_THRESHOLD = 4
const KEYBOARD_STEP = 24

export function useDraggableLauncher(
  containerRef: RefObject<HTMLElement>,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    const launcher = container?.querySelector<HTMLElement>('.rc-launcher')
    if (!container || !launcher) return

    let activePointerId: number | null = null
    let startX = 0
    let startY = 0
    let startLeft = 0
    let startTop = 0
    let moved = false
    let suppressClick = false

    const place = (left: number, top: number) => {
      const maxLeft = Math.max(0, window.innerWidth - launcher.offsetWidth)
      const maxTop = Math.max(0, window.innerHeight - launcher.offsetHeight)
      launcher.style.left = `${Math.min(Math.max(0, left), maxLeft)}px`
      launcher.style.top = `${Math.min(Math.max(0, top), maxTop)}px`
      launcher.style.right = 'auto'
      launcher.style.bottom = 'auto'
    }

    const keepInBounds = () => {
      if (
        !launcher.style.left ||
        !launcher.offsetWidth ||
        !launcher.offsetHeight
      )
        return
      const rect = launcher.getBoundingClientRect()
      place(rect.left, rect.top)
    }

    const endDrag = () => {
      if (activePointerId === null) return
      activePointerId = null
      launcher.classList.remove('rc-launcher-dragging')
      if (!moved) return
      suppressClick = true
      window.setTimeout(() => {
        suppressClick = false
      })
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || activePointerId !== null) return
      const rect = launcher.getBoundingClientRect()
      activePointerId = event.pointerId
      startX = event.clientX
      startY = event.clientY
      startLeft = rect.left
      startTop = rect.top
      moved = false
      launcher.setPointerCapture(event.pointerId)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return
      const deltaX = event.clientX - startX
      const deltaY = event.clientY - startY
      if (!moved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return
      moved = true
      launcher.classList.add('rc-launcher-dragged')
      launcher.classList.add('rc-launcher-dragging')
      place(startLeft + deltaX, startTop + deltaY)
    }

    const onPointerEnd = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return
      endDrag()
    }

    const onClick = (event: MouseEvent) => {
      if (!suppressClick) return
      event.preventDefault()
      event.stopPropagation()
      suppressClick = false
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const directions: Record<string, [number, number]> = {
        ArrowDown: [0, KEYBOARD_STEP],
        ArrowLeft: [-KEYBOARD_STEP, 0],
        ArrowRight: [KEYBOARD_STEP, 0],
        ArrowUp: [0, -KEYBOARD_STEP],
      }
      const direction = directions[event.key]
      if (!direction) return
      event.preventDefault()
      const rect = launcher.getBoundingClientRect()
      launcher.classList.add('rc-launcher-dragged')
      place(rect.left + direction[0], rect.top + direction[1])
    }

    const resizeObserver = new ResizeObserver(keepInBounds)
    resizeObserver.observe(launcher)
    launcher.setAttribute(
      'aria-keyshortcuts',
      'ArrowUp ArrowDown ArrowLeft ArrowRight'
    )
    launcher.addEventListener('pointerdown', onPointerDown)
    launcher.addEventListener('pointermove', onPointerMove)
    launcher.addEventListener('pointerup', onPointerEnd)
    launcher.addEventListener('pointercancel', onPointerEnd)
    launcher.addEventListener('lostpointercapture', endDrag)
    launcher.addEventListener('click', onClick, true)
    launcher.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', keepInBounds)

    return () => {
      resizeObserver.disconnect()
      launcher.removeEventListener('pointerdown', onPointerDown)
      launcher.removeEventListener('pointermove', onPointerMove)
      launcher.removeEventListener('pointerup', onPointerEnd)
      launcher.removeEventListener('pointercancel', onPointerEnd)
      launcher.removeEventListener('lostpointercapture', endDrag)
      launcher.removeEventListener('click', onClick, true)
      launcher.removeEventListener('keydown', onKeyDown)
      launcher.removeAttribute('aria-keyshortcuts')
      window.removeEventListener('resize', keepInBounds)
    }
  }, [containerRef, enabled])
}
