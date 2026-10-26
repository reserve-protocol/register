import { describe, expect, it } from 'vitest'
import { decodeFunctionData, encodeFunctionData } from 'viem'
import RToken from '@/abis/RToken'
import {
  hasMandate,
  supportsMandateUpdates,
} from '../components/mandate-proposal'

describe('Yield DTF mandate proposal calldata', () => {
  it('encodes the governance-only RToken mandate setter', () => {
    const calldata = encodeFunctionData({
      abi: RToken,
      functionName: 'setMandate',
      args: ['Preserve capital while earning sustainable yield.'],
    })

    expect(decodeFunctionData({ abi: RToken, data: calldata })).toEqual({
      functionName: 'setMandate',
      args: ['Preserve capital while earning sustainable yield.'],
    })
  })

  it('only exposes mandate updates for RToken 4.2 and newer', () => {
    expect(supportsMandateUpdates()).toBe(false)
    expect(supportsMandateUpdates('4.1.0')).toBe(false)
    expect(supportsMandateUpdates('4.2.0')).toBe(true)
    expect(supportsMandateUpdates('4.10.0')).toBe(true)
  })

  it('rejects empty and whitespace-only mandates', () => {
    expect(hasMandate('')).toBe(false)
    expect(hasMandate('   \n')).toBe(false)
    expect(hasMandate('Preserve the USD peg.')).toBe(true)
  })
})
