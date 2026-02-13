import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Lingui before importing components
vi.mock('@lingui/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  t: (strings: TemplateStringsArray) => strings[0],
}))

// Mock external dependencies
const mockOpenConnectModal = vi.fn()
const mockSwitchChain = vi.fn()

vi.mock('@rainbow-me/rainbowkit', () => ({
  useConnectModal: () => ({ openConnectModal: mockOpenConnectModal }),
}))

vi.mock('wagmi', () => ({
  useSwitchChain: () => ({ switchChain: mockSwitchChain }),
}))

vi.mock('hooks/useGasEstimate', () => ({
  useGasAmount: () => ({ usd: 1.5 }),
}))

vi.mock('components/transaction-error/TransactionError', () => ({
  default: ({ error }: { error: Error }) => (
    <div data-testid="transaction-error">{error.message}</div>
  ),
}))

// Stateful mocks for jotai atoms
let mockWallet: string | null = '0x1234567890abcdef'
let mockWalletChain = 1
let mockChainId = 1

vi.mock('jotai', () => ({
  useAtomValue: (atom: unknown) => {
    const atomStr = String(atom)
    if (atomStr.includes('wallet') && atomStr.includes('Chain')) return mockWalletChain
    if (atomStr.includes('chainId')) return mockChainId
    if (atomStr.includes('wallet')) return mockWallet
    return mockWallet
  },
}))

vi.mock('state/atoms', () => ({
  walletAtom: Symbol('walletAtom'),
  walletChainAtom: Symbol('walletChainAtom'),
  chainIdAtom: Symbol('chainIdAtom'),
}))

vi.mock('utils/constants', () => ({
  CHAIN_TAGS: { 1: 'Ethereum', 8453: 'Base' },
}))

// Import components after all mocks are set up
import TransactionButton, {
  ConnectWalletButton,
  TransactionButtonContainer,
  GasEstimateLabel,
} from '../transaction-button'

describe('ConnectWalletButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Connect Wallet text', () => {
    render(<ConnectWalletButton />)
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
  })

  it('calls openConnectModal when clicked', async () => {
    const user = userEvent.setup()
    render(<ConnectWalletButton />)

    await user.click(screen.getByRole('button'))

    expect(mockOpenConnectModal).toHaveBeenCalledTimes(1)
  })

  it('applies custom className alongside default styles', () => {
    render(<ConnectWalletButton className="custom-class" />)
    const button = screen.getByRole('button')

    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('rounded-xl')
  })
})

describe('GasEstimateLabel', () => {
  it('renders formatted gas cost in USD', () => {
    render(<GasEstimateLabel gas={BigInt(100000)} />)

    expect(screen.getByText('Estimated gas cost:')).toBeInTheDocument()
    // formatCurrency adds appropriate decimal places
    expect(screen.getByText(/\$1\.50?/)).toBeInTheDocument()
  })
})

describe('TransactionButtonContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWallet = '0x1234567890abcdef'
    mockWalletChain = 1
    mockChainId = 1
  })

  it('renders children when wallet connected and on correct chain', () => {
    render(
      <TransactionButtonContainer>
        <button>Child Button</button>
      </TransactionButtonContainer>
    )

    expect(screen.getByText('Child Button')).toBeInTheDocument()
  })

  it('shows ConnectWalletButton when no wallet connected', () => {
    mockWallet = null
    render(
      <TransactionButtonContainer>
        <button>Child Button</button>
      </TransactionButtonContainer>
    )

    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
    expect(screen.queryByText('Child Button')).not.toBeInTheDocument()
  })

  it('shows switch chain button when on wrong chain', () => {
    mockWalletChain = 8453
    mockChainId = 1
    render(
      <TransactionButtonContainer>
        <button>Child Button</button>
      </TransactionButtonContainer>
    )

    expect(screen.getByText('Switch to Ethereum')).toBeInTheDocument()
  })

  it('calls switchChain with correct chainId when clicked', async () => {
    const user = userEvent.setup()
    mockWalletChain = 8453
    mockChainId = 1
    render(
      <TransactionButtonContainer>
        <button>Child Button</button>
      </TransactionButtonContainer>
    )

    await user.click(screen.getByText('Switch to Ethereum'))

    expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: 1 })
  })

  it('uses explicit chain prop over chainId atom', () => {
    mockWalletChain = 1
    mockChainId = 1
    render(
      <TransactionButtonContainer chain={8453}>
        <button>Child Button</button>
      </TransactionButtonContainer>
    )

    expect(screen.getByText('Switch to Base')).toBeInTheDocument()
  })
})

describe('TransactionButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWallet = '0x1234567890abcdef'
    mockWalletChain = 1
    mockChainId = 1
  })

  describe('wallet states', () => {
    it('shows button text when wallet connected and on correct chain', () => {
      render(<TransactionButton text="Submit Transaction" />)

      expect(screen.getByText('Submit Transaction')).toBeInTheDocument()
    })

    it('shows ConnectWalletButton when no wallet', () => {
      mockWallet = null
      render(<TransactionButton text="Submit" />)

      expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
      expect(screen.queryByText('Submit')).not.toBeInTheDocument()
    })

    it('shows switch chain button when on wrong chain', () => {
      mockWalletChain = 8453
      render(<TransactionButton text="Submit" />)

      expect(screen.getByText('Switch to Ethereum')).toBeInTheDocument()
    })
  })

  describe('loading states', () => {
    it('shows loading text and spinner when loading=true', () => {
      render(<TransactionButton text="Submit" loading loadingText="Processing..." />)

      expect(screen.getByText('Processing...')).toBeInTheDocument()
      expect(screen.getByRole('button').querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('shows mining text when mining=true', () => {
      render(<TransactionButton text="Submit" mining />)

      expect(screen.getByText('Tx in process...')).toBeInTheDocument()
    })

    it('prioritizes mining state over loading state', () => {
      render(
        <TransactionButton
          text="Submit"
          loading
          loadingText="Loading..."
          mining
        />
      )

      expect(screen.getByText('Tx in process...')).toBeInTheDocument()
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    it('disables button when loading', () => {
      render(<TransactionButton text="Submit" loading />)

      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('disables button when mining', () => {
      render(<TransactionButton text="Submit" mining />)

      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('disabled state', () => {
    it('disables button when disabled prop is true', () => {
      render(<TransactionButton text="Submit" disabled />)

      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('does not trigger onClick when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(<TransactionButton text="Submit" onClick={handleClick} disabled />)

      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('gas estimate', () => {
    it('shows gas estimate when gas prop provided', () => {
      render(<TransactionButton text="Submit" gas={BigInt(100000)} />)

      expect(screen.getByText('Estimated gas cost:')).toBeInTheDocument()
      expect(screen.getByText(/\$1\.50?/)).toBeInTheDocument()
    })

    it('does not show gas estimate when gas is not provided', () => {
      render(<TransactionButton text="Submit" />)

      expect(screen.queryByText('Estimated gas cost:')).not.toBeInTheDocument()
    })
  })

  describe('error display', () => {
    it('shows error when error prop provided', () => {
      const error = new Error('Transaction reverted')
      render(<TransactionButton text="Submit" error={error} />)

      expect(screen.getByTestId('transaction-error')).toBeInTheDocument()
      expect(screen.getByText('Transaction reverted')).toBeInTheDocument()
    })

    it('does not show error when error is null', () => {
      render(<TransactionButton text="Submit" error={null} />)

      expect(screen.queryByTestId('transaction-error')).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(<TransactionButton text="Submit" onClick={handleClick} />)

      await user.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('className', () => {
    it('applies custom className', () => {
      render(<TransactionButton text="Submit" className="w-full custom" />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-full')
      expect(button).toHaveClass('custom')
    })
  })

  describe('combined states', () => {
    it('shows both gas and error when both provided', () => {
      const error = new Error('Failed')
      render(
        <TransactionButton text="Submit" gas={BigInt(100000)} error={error} />
      )

      expect(screen.getByText('Estimated gas cost:')).toBeInTheDocument()
      expect(screen.getByTestId('transaction-error')).toBeInTheDocument()
    })
  })
})
