import { useEffect, useRef } from 'react'

export function useProjectionFocus() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = root.current
    if (!element) return
    let focused: HTMLElement | null = null
    const remember = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      focused = element.contains(target) ? target : null
    }
    const forget = (event: FocusEvent) => {
      if (event.target === focused && focused?.getClientRects().length)
        focused = null
    }
    const observer = new ResizeObserver(() => {
      if (
        !focused ||
        !element.contains(focused) ||
        focused.getClientRects().length
      )
        return
      const key =
        focused.closest<HTMLElement>('[data-table-focus]')?.dataset.tableFocus
      if (!key) return
      const candidates = [
        ...element.querySelectorAll<HTMLElement>('[data-table-focus]'),
      ].filter(
        (candidate) =>
          candidate.dataset.tableFocus === key &&
          candidate.getClientRects().length
      )
      const next =
        candidates.find((candidate) =>
          candidate.hasAttribute('aria-description')
        ) ?? candidates[0]
      const target = next?.matches('a,button,input,select,[tabindex]')
        ? next
        : next?.querySelector<HTMLElement>('button,a,input,select,[tabindex]')
      target?.focus({ preventScroll: true })
    })
    document.addEventListener('focusin', remember)
    document.addEventListener('focusout', forget)
    observer.observe(element)
    return () => {
      observer.disconnect()
      document.removeEventListener('focusin', remember)
      document.removeEventListener('focusout', forget)
    }
  }, [])
  return root
}
