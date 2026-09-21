import { useLayoutEffect, useRef, useState } from 'react'

export function useDiscoverPresentation() {
  const root = useRef<HTMLDivElement>(null)
  const [cards, setCards] = useState<boolean | null>(null)
  const pendingFocus = useRef<string | null>(null)
  useLayoutEffect(() => {
    const element = root.current
    if (!element) return
    let previous: boolean | null = null
    let lastFocused: string | null = null
    const remember = (event: Event) => {
      const target = event.target as HTMLElement
      if (element.contains(target)) {
        lastFocused =
          target.closest<HTMLElement>('[data-table-focus]')?.dataset
            .tableFocus ?? null
      } else {
        const portal = target.closest<HTMLElement>(
          '[role="dialog"],[role="menu"]'
        )
        const owned =
          portal?.id &&
          [...element.querySelectorAll('[aria-controls]')].some((trigger) =>
            trigger
              .getAttribute('aria-controls')
              ?.split(/\s+/)
              .includes(portal.id)
          )
        if (!owned) lastFocused = null
      }
    }
    const update = () => {
      const next = element.getBoundingClientRect().width < 1152
      if (next === previous) return
      pendingFocus.current = lastFocused
      previous = next
      setCards(next)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    document.addEventListener('focusin', remember)
    document.addEventListener('pointerdown', remember, true)
    return () => {
      observer.disconnect()
      document.removeEventListener('focusin', remember)
      document.removeEventListener('pointerdown', remember, true)
    }
  }, [])
  useLayoutEffect(() => {
    const key = pendingFocus.current
    pendingFocus.current = null
    if (!key) return
    const targetKey = cards ? key.replace(/^basket-/, 'name-') : key
    const candidates = [
      ...(root.current?.querySelectorAll<HTMLElement>('[data-table-focus]') ??
        []),
    ]
    const target = candidates.find(
      (element) =>
        element.dataset.tableFocus === targetKey &&
        element.getClientRects().length
    )
    target?.focus({ preventScroll: true })
  }, [cards])
  return { root, cards }
}
