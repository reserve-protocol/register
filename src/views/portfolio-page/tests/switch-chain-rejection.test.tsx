import { walletAtom, walletChainAtom } from '@/state/atoms'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider, createStore } from 'jotai'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ClaimButton } from '../components/available-rewards'
import { WithdrawButton } from '../components/pending-withdrawals'
import type { PortfolioRewardRow } from '../atoms'

const BASE = 8453
const WALLET = '0x1111111111111111111111111111111111111111'

const openConnectModal = vi.fn()
const switchChainAsync = vi.fn()
const writeContract = vi.fn()

vi.mock('@/hooks/use-wallet-modal', () => ({
  useWalletModal: () => ({ openConnectModal }),
}))

vi.mock('wagmi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('wagmi')>()),
  useAccount: () => ({ address: WALLET, chainId: 1 }),
  useReadContract: () => ({ data: undefined }),
  useSwitchChain: () => ({ switchChainAsync }),
  useWriteContract: () => ({ data: undefined, writeContract, isPending: false }),
  useWaitForTransactionReceipt: () => ({ data: undefined }),
}))

const renderOnMainnet = (ui: ReactNode) => {
  const store = createStore()
  store.set(walletAtom, WALLET)
  store.set(walletChainAtom, 1)
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  )
}

const reward = {
  address: '0x2222222222222222222222222222222222222222',
  chainId: BASE,
  source: 'staking',
  stTokenAddress: '0x3333333333333333333333333333333333333333',
} as unknown as PortfolioRewardRow

describe('portfolio actions when the wallet refuses the chain switch', () => {
  const unhandled = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    switchChainAsync.mockRejectedValue(new Error('User rejected the request.'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    process.removeAllListeners('unhandledRejection')
    process.on('unhandledRejection', unhandled)
  })

  const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

  it('does not claim and does not leave an unhandled rejection', async () => {
    renderOnMainnet(<ClaimButton reward={reward} />)
    await userEvent.click(screen.getByRole('button', { name: 'Claim' }))
    await settle()

    expect(switchChainAsync).toHaveBeenCalledWith({ chainId: BASE })
    expect(writeContract).not.toHaveBeenCalled()
    expect(unhandled).not.toHaveBeenCalled()
  })

  it('does not withdraw and does not leave an unhandled rejection', async () => {
    const getWriteConfig = vi.fn(() => null)
    renderOnMainnet(
      <WithdrawButton chainId={BASE} isReady getWriteConfig={getWriteConfig} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Withdraw' }))
    await settle()

    expect(switchChainAsync).toHaveBeenCalledWith({ chainId: BASE })
    expect(getWriteConfig).not.toHaveBeenCalled()
    expect(writeContract).not.toHaveBeenCalled()
    expect(unhandled).not.toHaveBeenCalled()
  })
})
