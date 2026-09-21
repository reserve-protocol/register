import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'

export const TransactionContainedModal = ({
  children,
  isOpen,
  onOpenChange,
}: {
  children: ReactNode
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const layerRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      layerRef.current?.querySelector<HTMLElement>('[role="dialog"]')?.focus()
    }
    wasOpen.current = isOpen
  }, [isOpen])

  if (!isOpen) return null

  const dismiss = () => onOpenChange(false)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      dismiss()
      return
    }

    if (event.key !== 'Tab') return
    const dialog = layerRef.current?.querySelector('[role="dialog"]')
    const focusable = Array.from(
      dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
    ).filter(
      (element) => element.tabIndex >= 0 && element.getClientRects().length > 0
    )
    const first = focusable[0]
    const last = focusable.at(-1)
    if (!first || !last) {
      event.preventDefault()
      return
    }

    if (document.activeElement === dialog) {
      event.preventDefault()
      const target = event.shiftKey ? last : first
      target.focus()
      return
    }

    if (event.shiftKey && first.contains(document.activeElement)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && last.contains(document.activeElement)) {
      event.preventDefault()
      first.focus()
    }
  }

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) dismiss()
  }

  return (
    <div
      ref={layerRef}
      data-testid="transaction-contained-modal-layer"
      className="relative z-20 col-start-1 row-start-1 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
      onKeyDown={handleKeyDown}
      onMouseDown={handleBackdropMouseDown}
    >
      {children}
    </div>
  )
}
