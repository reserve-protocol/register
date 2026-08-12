import { MouseEvent, PointerEvent } from 'react'
import { useRef } from 'react'

/**
 * Radix opens a NavigationMenu on hover but treats a trigger click as a toggle,
 * so a mouse user who hovers and then clicks closes the menu that just opened.
 * The first click after a hover-open is swallowed; a second click still closes.
 */
export const useHoverOpenTrigger = () => {
  const openedByHoverRef = useRef(false)

  return {
    onPointerEnter: (event: PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse') openedByHoverRef.current = true
    },
    onPointerLeave: (event: PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse') openedByHoverRef.current = false
    },
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      if (
        openedByHoverRef.current &&
        event.currentTarget.dataset.state === 'open'
      ) {
        openedByHoverRef.current = false
        event.preventDefault()
      }
    },
  }
}
