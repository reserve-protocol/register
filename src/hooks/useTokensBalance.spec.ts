import { renderHook } from '@testing-library/react-hooks'
import useTokensBalance from 'hooks/useTokensBalance'
import { ethers } from 'ethers'
import {
  useContractCalls,
  useEthers,
  ERC20Interface,
  useDebounce,
  useBlockNumber,
} from '@usedapp/core'

jest.mock('@usedapp/core', () => ({
  useContractCalls: jest.fn(),
  useEthers: jest.fn(),
  ERC20Interface: 'test',
  useDebounce: jest.fn(),
  useBlockNumber: jest.fn(),
}))

const mocked = {
  useContractCalls: useContractCalls as jest.Mock,
  useEthers: useEthers as jest.Mock,
  useBlockNumber: useBlockNumber as jest.Mock,
  useDebounce: useDebounce as jest.Mock,
}

describe('Hooks: useTokensBalance', () => {
  let tokens: [string, number][]

  beforeEach(() => {
    mocked.useEthers.mockReturnValue({ account: 'test', chainId: 1 })
    mocked.useDebounce.mockReturnValue(1)
    tokens = []
  })
  it('It should return an empty object', () => {
    const { result } = renderHook(() => useTokensBalance(tokens))

    expect(result.current).toStrictEqual({})
  })

  it('It should construct the calls correctly', () => {
    tokens = [
      ['0xtoken1', 18],
      ['0xtoken2', 18],
    ]

    renderHook(() => useTokensBalance(tokens))

    expect(mocked.useContractCalls).toHaveBeenLastCalledWith([
      { abi: 'test', address: '0xtoken1', args: ['test'], method: 'balanceOf' },
      { abi: 'test', address: '0xtoken2', args: ['test'], method: 'balanceOf' },
    ])
  })

  it('It should format the result properly', () => {
    mocked.useContractCalls.mockReturnValueOnce([
      [ethers.utils.parseEther('1')],
      [ethers.utils.parseEther('55')],
    ])

    tokens = [
      ['0xtoken1', 18],
      ['0xtoken2', 18],
    ]

    const { result } = renderHook(() => useTokensBalance(tokens))

    expect(result.current).toStrictEqual({
      [tokens[0][0]]: 1,
      [tokens[1][0]]: 55,
    })
  })
})
