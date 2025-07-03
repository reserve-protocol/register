import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useZapperModal } from '../hooks/use-zapper-modal'

describe('useZapperModal Hook', () => {
  it('initializes with closed state by default', () => {
    const { result } = renderHook(() => useZapperModal())

    expect(result.current.isOpen).toBe(false)
  })

  it('initializes with provided initial state', () => {
    const { result } = renderHook(() => useZapperModal())

    expect(result.current.isOpen).toBe(true)
  })

  it('opens modal when open is called', () => {
    const { result } = renderHook(() => useZapperModal())

    act(() => {
      result.current.open()
    })

    expect(result.current.isOpen).toBe(true)
  })

  it('closes modal when close is called', () => {
    const { result } = renderHook(() => useZapperModal())

    act(() => {
      result.current.close()
    })

    expect(result.current.isOpen).toBe(false)
  })

  it('toggles modal state when toggle is called', () => {
    const { result } = renderHook(() => useZapperModal())

    // Initially closed, toggle should open
    act(() => {
      result.current.toggle()
    })
    expect(result.current.isOpen).toBe(true)

    // Now open, toggle should close
    act(() => {
      result.current.toggle()
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('provides stable function references', () => {
    const { result, rerender } = renderHook(() => useZapperModal())

    const initialOpen = result.current.open
    const initialClose = result.current.close
    const initialToggle = result.current.toggle

    rerender()

    expect(result.current.open).toBe(initialOpen)
    expect(result.current.close).toBe(initialClose)
    expect(result.current.toggle).toBe(initialToggle)
  })
})
