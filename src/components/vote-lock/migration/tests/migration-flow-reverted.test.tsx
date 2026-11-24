import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { custom } from 'viem'
import { base } from 'viem/chains'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createConfig, WagmiProvider } from 'wagmi'
import { readMigrationRecord, writeMigrationRecord } from '../migration-record'
import { useMigrationFlow } from '../use-migration-flow'
import type { VoteLockMigration } from '../use-vote-lock-migrations'

const ACCOUNT = '0xDeF0000000000000000000000000000000000002' as const
const OLD_VAULT = '0xAbC0000000000000000000000000000000000001' as const
const NEW_VAULT = '0xAbC0000000000000000000000000000000000003' as const
const UNDERLYING = '0xAbC0000000000000000000000000000000000004' as const
const REDEEM_HASH = `0x${'a'.repeat(64)}` as const
const APPROVE_HASH = `0x${'b'.repeat(64)}` as const
const BLOCK_HASH = `0x${'c'.repeat(64)}` as const

const target = { chainId: base.id, oldVoteLock: OLD_VAULT, account: ACCOUNT }

const minedTransaction = {
  hash: APPROVE_HASH,
  blockHash: BLOCK_HASH,
  blockNumber: '0x10',
  transactionIndex: '0x0',
  from: ACCOUNT,
  to: UNDERLYING,
  input: '0x',
  value: '0x0',
  nonce: '0x1',
  gas: '0x5208',
  type: '0x2',
  maxFeePerGas: '0x1',
  maxPriorityFeePerGas: '0x1',
  chainId: '0x2105',
  accessList: [],
  v: '0x0',
  r: '0x1',
  s: '0x1',
}

const revertedReceipt = {
  transactionHash: APPROVE_HASH,
  blockHash: BLOCK_HASH,
  blockNumber: '0x10',
  transactionIndex: '0x0',
  from: ACCOUNT,
  to: UNDERLYING,
  contractAddress: null,
  cumulativeGasUsed: '0x5208',
  gasUsed: '0x5208',
  effectiveGasPrice: '0x1',
  logs: [],
  logsBloom: `0x${'0'.repeat(512)}`,
  status: '0x0',
  type: '0x2',
}

const rpc = async ({ method }: { method: string }) => {
  if (method === 'eth_chainId') return '0x2105'
  if (method === 'eth_blockNumber') return '0x11'
  if (method === 'eth_getTransactionReceipt') return revertedReceipt
  if (method === 'eth_getTransactionByHash') return minedTransaction
  return '0x'
}

const wrapper = ({ children }: { children: ReactNode }) => {
  const config = createConfig({
    chains: [base],
    transports: { [base.id]: custom({ request: rpc }, { retryCount: 0 }) },
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

const migration: VoteLockMigration = {
  chainId: base.id,
  account: ACCOUNT,
  oldVoteLock: OLD_VAULT,
  newVoteLock: NEW_VAULT,
  shared: true,
  oldSymbol: 'vlOLD',
  newSymbol: 'vlRSR',
  underlyingSymbol: 'RSR',
  shares: 0n,
  underlying: UNDERLYING,
  record: {},
  refetch: vi.fn(),
}

afterEach(() => localStorage.clear())

describe('migration flow with a reverted transaction', () => {
  it('frees the step for a retry once the pending transaction is mined as reverted', async () => {
    writeMigrationRecord(target, {
      redeem: { hash: REDEEM_HASH, assets: 1000n },
      pending: { step: 'approve', hash: APPROVE_HASH },
    })

    const { result } = renderHook(() => useMigrationFlow(migration), { wrapper })
    expect(result.current.isConfirming).toBe(true)

    await waitFor(() => expect(result.current.failed).toBe('approve'), { timeout: 4000 })
    expect(result.current.isConfirming).toBe(false)
    expect(readMigrationRecord(target)).toEqual({ redeem: { hash: REDEEM_HASH, assets: 1000n } })
  })
})
