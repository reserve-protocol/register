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
  useWriteContract: () => ({ data: hash, writeContract, isPending: isSigning }),
  useWaitForTransactionReceipt: (params: {
    hash?: string
    onReplaced?: (replacement: Replacement) => void
  }) => {
    onReplaced = params.onReplaced
    return {
      data: params.hash ? receipts[params.hash] : undefined,
      isLoading: false,
    }
  },
}))

type Replacement = { reason: string; replacedTransaction: { hash: string } }

const FIRST = '0xaaa'
const SECOND = '0xbbb'
let hash: string | undefined
let isSigning = false
let receipts: Record<string, { status: string }> = {}
let onReplaced: ((replacement: Replacement) => void) | undefined

const replaced = (reason: string) =>
  act(() => onReplaced?.({ reason, replacedTransaction: { hash: FIRST } }))

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
    hash = undefined
    isSigning = false
    receipts = {}
  })

  it('shows Distributed after the distribution is mined, also when the wallet repriced it', () => {
    hash = FIRST
    receipts = { [FIRST]: { status: 'success' } }
    render(<DistributeButton dtf={dtf} />)
    replaced('repriced')

    const button = screen.getByTestId('explorer-distribute')
    expect(button).toHaveTextContent('Distributed')
    expect(button).toBeDisabled()
  })

  it('stays on Distribute when the user cancelled the transaction in the wallet', () => {
    hash = FIRST
    receipts = { [FIRST]: { status: 'success' } }
    render(<DistributeButton dtf={dtf} />)
    replaced('cancelled')

    const button = screen.getByTestId('explorer-distribute')
    expect(button).toHaveTextContent(/^Distribute$/)
    expect(button).toBeEnabled()
  })

  it('does not show Distributed for a cancelled attempt while the next one is in the wallet', async () => {
    account = { address: '0x1111111111111111111111111111111111111111', chainId: BASE }
    hash = FIRST
    receipts = { [FIRST]: { status: 'success' } }
    const { rerender } = render(<DistributeButton dtf={dtf} />)
    replaced('cancelled')
    const button = screen.getByTestId('explorer-distribute')

    await userEvent.click(button)
    expect(writeContract).toHaveBeenCalledTimes(1)
    isSigning = true
    rerender(<DistributeButton dtf={dtf} />)
    expect(button).toHaveTextContent(/^Distribute$/)
    expect(button).toBeDisabled()

    isSigning = false
    rerender(<DistributeButton dtf={dtf} />)
    expect(button).toHaveTextContent(/^Distribute$/)
    expect(button).toBeEnabled()

    hash = SECOND
    receipts = { ...receipts, [SECOND]: { status: 'success' } }
    rerender(<DistributeButton dtf={dtf} />)
    expect(button).toHaveTextContent('Distributed')
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
