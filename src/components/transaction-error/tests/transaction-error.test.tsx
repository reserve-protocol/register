import { render, screen } from '@testing-library/react'
import { createWalletClient, custom, parseAbi } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import TransactionError from '../TransactionError'

const account = '0x1111111111111111111111111111111111111111'
const abi = parseAbi([
  'function redeem(uint256,address,address) returns (uint256)',
])

// Real viem error for a wallet that answers eth_sendTransaction with rpcError.
const getWriteError = async (rpcError: object) => {
  const client = createWalletClient({
    chain: mainnet,
    account,
    transport: custom({
      request: async ({ method }) => {
        if (method === 'eth_chainId') return '0x1'
        throw rpcError
      },
    }),
  })

  try {
    await client.writeContract({
      address: '0x2222222222222222222222222222222222222222',
      abi,
      functionName: 'redeem',
      args: [1n, account, account],
    })
  } catch (error) {
    return error as Error
  }
  throw new Error('writeContract did not fail')
}

const BURN_EXCEEDS_BALANCE_REVERT =
  '0x08c379a0' +
  '0000000000000000000000000000000000000000000000000000000000000020' +
  '0000000000000000000000000000000000000000000000000000000000000022' +
  '45524332303a206275726e20616d6f756e7420657863656564732062616c616e' +
  '6365000000000000000000000000000000000000000000000000000000000000'

describe('TransactionError', () => {
  it('explains a generic wallet failure instead of calling it a revert', async () => {
    const error = await getWriteError({
      code: -32603,
      message: 'Unexpected error',
    })

    const { container } = render(<TransactionError error={error} />)

    expect(container.textContent).not.toMatch(/reverted/i)
    expect(container.textContent).not.toContain('ContractFunctionExecutionError')
    expect(
      screen.getByText(/Your wallet couldn't send this transaction/)
    ).toBeTruthy()
    expect(container.textContent).not.toContain('Unexpected error')
    expect(screen.getByText(/enough funds to pay for gas/)).toBeTruthy()
  })

  it('explains a generic wallet failure that carries empty data', async () => {
    const error = await getWriteError({
      code: -32603,
      message: 'Unexpected error',
      data: '0x',
    })

    render(<TransactionError error={error} />)

    expect(
      screen.getByText(/Your wallet couldn't send this transaction/)
    ).toBeTruthy()
  })

  it('keeps showing an execution-reverted error whose reason does not say revert', async () => {
    const error = await getWriteError({ code: 3, message: 'Not authorized' })

    const { container } = render(<TransactionError error={error} />)

    expect(container.textContent).toContain('ContractFunctionExecutionError')
    expect(container.textContent).toContain('Not authorized')
  })

  it('explains insufficient gas funds', async () => {
    const error = await getWriteError({
      code: -32000,
      message: 'insufficient funds for gas * price + value',
    })

    render(<TransactionError error={error} />)

    expect(
      screen.getByText(/Your wallet doesn't have enough funds to pay for gas/)
    ).toBeTruthy()
  })

  it('keeps showing real contract reverts', async () => {
    const error = await getWriteError({
      code: 3,
      message: 'execution reverted: ERC20: burn amount exceeds balance',
      data: BURN_EXCEEDS_BALANCE_REVERT,
    })

    const { container } = render(<TransactionError error={error} />)

    expect(container.textContent).toContain('ContractFunctionExecutionError')
    expect(container.textContent).toContain('reverted with the following reason')
    expect(container.textContent).toContain('ERC20: burn amount exceeds balance')
  })

  it('keeps showing reverts without a reason', async () => {
    const error = await getWriteError({
      code: 3,
      message: 'execution reverted',
      data: '0x',
    })

    const { container } = render(<TransactionError error={error} />)

    expect(container.textContent).toContain('The contract function "redeem" reverted')
  })
})
