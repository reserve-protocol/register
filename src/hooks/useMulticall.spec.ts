import { renderHook, act } from '@testing-library/react-hooks/dom'
import { useEthers, useMulticallAddress } from '@usedapp/core'
import { Multicall } from 'ethereum-multicall'

import useMulticall from './useMulticall'

jest.mock('@usedapp/core', () => ({
  useEthers: jest.fn().mockReturnValue(jest.fn()),
  useMulticallAddress: jest.fn().mockReturnValue('test'),
}))

jest.mock('ethereum-multicall', () => ({
  Multicall: jest.fn(),
}))

const mockAddress = 'test'
let mockLibrary: jest.Mock

describe('Hook: useMulticall', () => {
  beforeEach(() => {
    mockLibrary = jest.fn()
    ;(useEthers as jest.Mock).mockReturnValue({ library: mockLibrary })
    ;(useMulticallAddress as jest.Mock).mockReturnValue(mockAddress)
  })
  it('It should call the multicall library with the proper params', () => {
    renderHook(() => useMulticall())

    expect(Multicall).toHaveBeenCalledWith({
      ethersProvider: mockLibrary,
      multicallCustomContractAddress: mockAddress,
    })
  })

  it('It should return undefined if either the library or the address is not present', () => {
    ;(useMulticallAddress as jest.Mock).mockReturnValueOnce(undefined)

    const { result, rerender } = renderHook(() => useMulticall())
    expect(result.current).toBeUndefined()
    ;(useEthers as jest.Mock).mockReturnValueOnce({ library: undefined })

    rerender()
    expect(result.current).toBeUndefined()
  })
})
