import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  APP_CHAIN_ID,
  VAULT_CHAIN_ID,
  mockIndexDtf,
  indexDtfAtom,
  chainIdAtom,
  walletAtom,
} = vi.hoisted(() => {
  const APP_CHAIN_ID = 1
  const VAULT_CHAIN_ID = 56

  return {
    APP_CHAIN_ID,
    VAULT_CHAIN_ID,
    mockIndexDtf: {
      id: '0x1111111111111111111111111111111111111111',
      chainId: APP_CHAIN_ID,
      token: { symbol: 'PHOTON' },
      stToken: {
        id: '0x2222222222222222222222222222222222222222',
        chainId: VAULT_CHAIN_ID,
        token: { symbol: 'vlRSR', decimals: 18 },
        underlying: {
          address: '0x3333333333333333333333333333333333333333',
          symbol: 'RSR',
          decimals: 18,
        },
        rewardTokens: [
          {
            address: '0x4444444444444444444444444444444444444444',
            name: 'Reward One',
            symbol: 'ONE',
          },
          {
            address: '0x5555555555555555555555555555555555555555',
            name: 'Reward Two',
            symbol: 'TWO',
          },
        ],
      },
    },
    indexDtfAtom: Symbol('indexDtfAtom'),
    chainIdAtom: Symbol('chainIdAtom'),
    walletAtom: Symbol('walletAtom'),
  }
})

vi.mock('@/state/dtf/atoms', () => ({ indexDTFAtom: indexDtfAtom }))
vi.mock('@/state/atoms', () => ({ chainIdAtom, walletAtom }))
vi.mock('jotai', async (importOriginal) => {
  const original = await importOriginal<typeof import('jotai')>()
  return {
    ...original,
    useAtomValue: (atom: symbol) => {
      if (atom === indexDtfAtom) return mockIndexDtf
      if (atom === chainIdAtom) return APP_CHAIN_ID
      if (atom === walletAtom) return null
      return undefined
    },
  }
})

vi.mock('@/components/token-logo', () => ({
  default: ({ symbol, chain }: { symbol?: string; chain?: number }) => (
    <span data-testid={`token-logo-${symbol}`} data-chain={chain} />
  ),
}))
vi.mock('@/components/vote-lock', () => ({
  CurrentDtfVoteLock: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}))
vi.mock('@/components/vote-lock/hooks/use-vote-lock-exchange-rate', () => ({
  useVoteLockExchangeRate: () => ({ rate: undefined, isError: false }),
}))
vi.mock('@/hooks/useIndexDTFList', () => ({
  default: () => ({ data: [] }),
}))
vi.mock('@/views/index-dtf/overview/hooks/use-staking-vault-apy', () => ({
  useVoteLockAPR: () => undefined,
}))
vi.mock('@/views/index-dtf/governance/hooks/use-governed-dtfs', () => ({
  default: () => ({ data: [] }),
}))
vi.mock('@/views/index-dtf/governance/components/rsr-bnb-help', () => ({
  default: () => null,
}))
vi.mock('@reserve-protocol/react-sdk', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@reserve-protocol/react-sdk')>()
  return {
    ...original,
    useIndexDtfVoteLockState: () => ({ data: undefined }),
  }
})

import GovernanceVoteLock from '../governance-vote-lock'

describe('GovernanceVoteLock chain identity', () => {
  beforeEach(() => vi.clearAllMocks())

  it('resolves vote-lock and reward-token logos on the vault chain', () => {
    render(<GovernanceVoteLock />)

    for (const symbol of ['vlRSR', 'RSR', 'ONE', 'TWO']) {
      expect(screen.getByTestId(`token-logo-${symbol}`)).toHaveAttribute(
        'data-chain',
        String(VAULT_CHAIN_ID)
      )
    }
  })
})
