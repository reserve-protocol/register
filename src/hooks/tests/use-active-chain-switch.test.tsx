import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useActiveChainSwitch from '../use-active-chain-switch'

const mocks = vi.hoisted(() => ({
  switchChain: vi.fn(),
  walletChain: 56 as number | undefined,
}))

vi.mock('jotai', () => ({
  useAtomValue: () => mocks.walletChain,
}))

vi.mock('@/state/atoms', () => ({
  walletChainAtom: Symbol('walletChainAtom'),
}))

vi.mock('wagmi', () => ({
  useSwitchChain: () => ({ switchChain: mocks.switchChain }),
}))

describe('useActiveChainSwitch', () => {
  let hasFocus = true
  let visibilityState: DocumentVisibilityState = 'visible'

  beforeEach(() => {
    mocks.switchChain.mockReset()
    mocks.walletChain = 56
    hasFocus = true
    visibilityState = 'visible'
    vi.spyOn(document, 'hasFocus').mockImplementation(() => hasFocus)
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(
      () => visibilityState
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('switches to the target chain when the document is focused and visible', () => {
    renderHook(() => useActiveChainSwitch(1))

    expect(mocks.switchChain).toHaveBeenCalledOnce()
    expect(mocks.switchChain).toHaveBeenCalledWith({ chainId: 1 })
  })

  it('does not switch from a background tab', () => {
    hasFocus = false

    renderHook(() => useActiveChainSwitch(1))

    expect(mocks.switchChain).not.toHaveBeenCalled()
  })

  it('does not switch from a hidden document that still reports focus', () => {
    visibilityState = 'hidden'

    renderHook(() => useActiveChainSwitch(1))

    expect(mocks.switchChain).not.toHaveBeenCalled()
  })

  it('claims the target chain when a background tab becomes active', () => {
    hasFocus = false
    const { rerender } = renderHook(() => useActiveChainSwitch(1))
    expect(mocks.switchChain).not.toHaveBeenCalled()

    hasFocus = true
    act(() => {
      window.dispatchEvent(new Event('focus'))
    })
    rerender()

    expect(mocks.switchChain).toHaveBeenCalledOnce()
    expect(mocks.switchChain).toHaveBeenCalledWith({ chainId: 1 })
  })

  it('claims the target chain when a focused document becomes visible', () => {
    visibilityState = 'hidden'
    renderHook(() => useActiveChainSwitch(1))
    expect(mocks.switchChain).not.toHaveBeenCalled()

    visibilityState = 'visible'
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(mocks.switchChain).toHaveBeenCalledOnce()
    expect(mocks.switchChain).toHaveBeenCalledWith({ chainId: 1 })
  })

  it('ignores wallet-chain changes after the tab moves to the background', () => {
    mocks.walletChain = 1
    const { rerender } = renderHook(() => useActiveChainSwitch(1))

    hasFocus = false
    act(() => {
      window.dispatchEvent(new Event('blur'))
    })

    mocks.walletChain = 56
    rerender()

    expect(mocks.switchChain).not.toHaveBeenCalled()
  })

  it('rechecks focus before switching when the cached active state is stale', () => {
    mocks.walletChain = 1
    const { rerender } = renderHook(() => useActiveChainSwitch(1))

    hasFocus = false
    mocks.walletChain = 56
    rerender()

    expect(mocks.switchChain).not.toHaveBeenCalled()
  })

  it('does not switch when disabled', () => {
    renderHook(() => useActiveChainSwitch(1, false))

    expect(mocks.switchChain).not.toHaveBeenCalled()
  })
})
