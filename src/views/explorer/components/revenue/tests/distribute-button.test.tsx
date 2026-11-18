import { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DistributeButton from '../distribute-button'

const BASE = 8453
const DTF_ADDRESS = '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8'

const openConnectModal = vi.fn()
const switchChainAsync = vi.fn()
const writeContract = vi.fn()
let account: { address?: string; chainId?: number } = {}

vi.mock('@/hooks/use-wallet-modal', () => ({
  useWalletModal: () => ({ openConnectModal }),
}))

vi.mock('wagmi', () => ({
  useAccount: () => account,
  useSwitchChain: () => ({ switchChainAsync }),
  useWriteContract: () => ({ data: undefined, writeContract, isPending: false }),
  useWaitForTransactionReceipt: (params: {
    onReplaced?: (replacement: { reason: string }) => void
  }) => {
    onReplaced = params.onReplaced
    return { data: receipt, isLoading: false }
  },
}))

let receipt: { status: string } | undefined
let onReplaced: ((replacement: { reason: string }) => void) | undefined

const dtf = { address: DTF_ADDRESS, chainId: BASE } as unknown as IndexDTFItem

const click = async () => {
  render(<DistributeButton dtf={dtf} />)
  const button = screen.getByTestId('explorer-distribute')
  expect(button).toHaveTextContent('Distribute')
  await userEvent.click(button)
  return button
}

describe('DistributeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    account = {}
    receipt = undefined
  })

  it('shows Distributed after the distribution is mined, also when the wallet repriced it', () => {
    receipt = { status: 'success' }
    render(<DistributeButton dtf={dtf} />)
    act(() => onReplaced?.({ reason: 'repriced' }))

    const button = screen.getByTestId('explorer-distribute')
    expect(button).toHaveTextContent('Distributed')
    expect(button).toBeDisabled()
  })

  it('stays on Distribute when the user cancelled the transaction in the wallet', () => {
    receipt = { status: 'success' }
    render(<DistributeButton dtf={dtf} />)
    act(() => onReplaced?.({ reason: 'cancelled' }))

    const button = screen.getByTestId('explorer-distribute')
    expect(button).toHaveTextContent(/^Distribute$/)
    expect(button).toBeEnabled()
  })

  it('opens the connect modal when no wallet is connected', async () => {
    await click()

    expect(openConnectModal).toHaveBeenCalledTimes(1)
    expect(switchChainAsync).not.toHaveBeenCalled()
    expect(writeContract).not.toHaveBeenCalled()
  })

  it('sends distributeFees to the DTF on its chain', async () => {
    account = { address: '0x1111111111111111111111111111111111111111', chainId: BASE }
    await click()

    expect(switchChainAsync).not.toHaveBeenCalled()
    expect(writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: DTF_ADDRESS,
        functionName: 'distributeFees',
        chainId: BASE,
      })
    )
  })

  it('switches to the DTF chain first, then sends, with the same label', async () => {
    account = { address: '0x1111111111111111111111111111111111111111', chainId: 1 }
    switchChainAsync.mockResolvedValue({ id: BASE })
    const button = await click()

    await waitFor(() => expect(writeContract).toHaveBeenCalledTimes(1))
    expect(switchChainAsync).toHaveBeenCalledWith({ chainId: BASE })
    expect(switchChainAsync.mock.invocationCallOrder[0]).toBeLessThan(
      writeContract.mock.invocationCallOrder[0]
    )
    expect(button).toHaveTextContent('Distribute')
  })

  it('does not send when the wallet refuses the chain switch', async () => {
    account = { address: '0x1111111111111111111111111111111111111111', chainId: 1 }
    switchChainAsync.mockRejectedValue(new Error('User rejected the request'))
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    const button = await click()

    await waitFor(() => expect(button).toBeEnabled())
    expect(writeContract).not.toHaveBeenCalled()
    expect(logged).toHaveBeenCalled()
    logged.mockRestore()
  })
})
