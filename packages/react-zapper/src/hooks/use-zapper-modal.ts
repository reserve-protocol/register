import { useState, useCallback } from 'react'
import { UseZapperModalReturn } from '../types'

export function useZapperModal(initialOpen = false): UseZapperModalReturn {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}