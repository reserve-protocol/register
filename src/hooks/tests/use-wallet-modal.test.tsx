import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWalletModal, useWalletModalOpen } from '../use-wallet-modal'

const kit = vi.hoisted(() => ({
  openConnectModal: undefined as (() => void) | undefined,
  openAccountModal: undefined as (() => void) | undefined,
  connectModalOpen: false,
  accountModalOpen: false,
}))

vi.mock('solariskit', () => ({
  useConnectModal: () => ({
    openConnectModal: kit.openConnectModal,
    connectModalOpen: kit.connectModalOpen,
  }),
  useAccountModal: () => ({
    openAccountModal: kit.openAccountModal,
    accountModalOpen: kit.accountModalOpen,
  }),
}))

describe('useWalletModal', () => {
  beforeEach(() => {
    kit.openConnectModal = undefined
    kit.openAccountModal = undefined
    kit.connectModalOpen = false
    kit.accountModalOpen = false
  })

  it('opens the connect modal while disconnected', () => {
    kit.openConnectModal = vi.fn()
    const { result } = renderHook(() => useWalletModal())

    act(() => result.current.openConnectModal())

    expect(kit.openConnectModal).toHaveBeenCalledOnce()
  })

  it('does nothing when asked to connect while a wallet is connected', () => {
    kit.openAccountModal = vi.fn()
    const { result } = renderHook(() => useWalletModal())

    expect(() => act(() => result.current.openConnectModal())).not.toThrow()
    expect(kit.openAccountModal).not.toHaveBeenCalled()
  })

  it('opens the account modal while connected', () => {
    kit.openAccountModal = vi.fn()
    const { result } = renderHook(() => useWalletModal())

    act(() => result.current.openAccountModal())

    expect(kit.openAccountModal).toHaveBeenCalledOnce()
  })
})

describe('useWalletModalOpen', () => {
  beforeEach(() => {
    kit.connectModalOpen = false
    kit.accountModalOpen = false
  })

  it('is false while both modals are closed', () => {
    expect(renderHook(() => useWalletModalOpen()).result.current).toBe(false)
  })

  it('is true while the connect modal is open', () => {
    kit.connectModalOpen = true

    expect(renderHook(() => useWalletModalOpen()).result.current).toBe(true)
  })

  it('is true while the account modal is open', () => {
    kit.accountModalOpen = true

    expect(renderHook(() => useWalletModalOpen()).result.current).toBe(true)
  })
})
