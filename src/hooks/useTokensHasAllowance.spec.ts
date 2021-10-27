import useTokensHasAllowance from 'hooks/useTokensHasAllowance'
import { renderHook } from '@testing-library/react-hooks'
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

describe('Hooks: useTokensHasAllowance', () => {
  let tokens: string[]

  beforeEach(() => {
    mocked.useEthers.mockReturnValue({ account: 'test', chainId: 1 })
    mocked.useDebounce.mockReturnValue(1)
    tokens = []
  })
  it('It should return false if no tokens are send', () => {
    const { result } = renderHook(() =>
      useTokensHasAllowance(tokens, 'test', ethers.utils.parseEther('1'))
    )

    expect(result.current).toBeFalsy()
  })

  it('It should construct the calls correctly', () => {
    tokens = ['0xtoken1', '0xtoken2']

    renderHook(() =>
      useTokensHasAllowance(tokens, 'test', ethers.utils.parseEther('1'))
    )

    expect(mocked.useContractCalls).toHaveBeenLastCalledWith([
      {
        abi: 'test',
        address: '0xtoken1',
        args: ['test', 'test'],
        method: 'allowance',
      },
      {
        abi: 'test',
        address: '0xtoken2',
        args: ['test', 'test'],
        method: 'allowance',
      },
    ])
  })

  it('It should return false if one or more of the tokens does not have allowance', () => {
    mocked.useContractCalls.mockReturnValueOnce([
      [ethers.utils.parseEther('0')],
      [ethers.utils.parseEther('55')],
    ])

    tokens = ['0xtoken1', '0xtoken2']

    const { result } = renderHook(() =>
      useTokensHasAllowance(tokens, 'test', ethers.utils.parseEther('1'))
    )

    expect(result.current).toBeFalsy()
  })

  it('It should return "true" if all tokens has the given allowance', () => {
    mocked.useContractCalls.mockReturnValueOnce([
      [ethers.utils.parseEther('15')],
      [ethers.utils.parseEther('55')],
    ])

    tokens = ['0xtoken1', '0xtoken2']

    const { result } = renderHook(() =>
      useTokensHasAllowance(tokens, 'test', ethers.utils.parseEther('1'))
    )

    expect(result.current).toBeTruthy()
  })
})
