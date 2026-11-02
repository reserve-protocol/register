import { describe, expect, it } from 'vitest'
import { decodeFunctionData, getAddress, parseUnits, zeroAddress } from 'viem'
import RevenueRouter from '@/abis/RevenueRouter'
import { EUSD_ADDRESS, EUSD_REVENUE_ROUTER_ADDRESS } from '@/utils/addresses'
import {
  buildRevenueRouterCalls,
  getDestinationChanges,
  getDestinationErrors,
  parseDestinations,
  toDestinationInputs,
  type RevenueDestination,
} from '../utils/revenue-router'
import { isEusdRevenueRouter } from '../../../utils'

const a = '0x00000000000000000000000000000000000000AA'
const b = '0x00000000000000000000000000000000000000bb'
const c = '0x00000000000000000000000000000000000000cc'
const current: RevenueDestination[] = [
  { holder: a, recipient: b, multiplier: parseUnits('1', 18) },
  { holder: b, recipient: b, multiplier: parseUnits('2', 18) },
]

describe('eUSD revenue router destination proposals', () => {
  it('only enables the Ethereum eUSD deployment, not symbols or bridged eUSD', () => {
    expect(isEusdRevenueRouter({ chainId: 1, address: EUSD_ADDRESS[1] })).toBe(
      true
    )
    expect(
      isEusdRevenueRouter({ chainId: 8453, address: EUSD_ADDRESS[8453] })
    ).toBe(false)
    expect(
      isEusdRevenueRouter({ chainId: 8453, address: EUSD_ADDRESS[1] })
    ).toBe(false)
    expect(isEusdRevenueRouter({ chainId: 1, address: a })).toBe(false)
    expect(isEusdRevenueRouter()).toBe(false)
  })

  it('ignores row order, address casing and equivalent multiplier formatting', () => {
    const proposed = toDestinationInputs([...current].reverse()).map((d) => ({
      ...d,
      holder: d.holder.toLowerCase(),
      multiplier: `${d.multiplier}.00`,
    }))
    const parsed = parseDestinations(proposed)!
    expect(buildRevenueRouterCalls(current, parsed)).toEqual([])
  })

  it('encodes only the delta, removing edited/missing holders before additions', () => {
    const proposed: RevenueDestination[] = [
      { ...current[0], recipient: c, multiplier: parseUnits('1.25', 18) },
      { holder: c, recipient: c, multiplier: 1n },
    ]
    expect(getDestinationChanges(current, proposed)).toEqual({
      removed: current,
      added: proposed,
    })
    const calls = buildRevenueRouterCalls(current, proposed)
    expect(calls.map((call) => call.address)).toEqual([
      EUSD_REVENUE_ROUTER_ADDRESS,
      EUSD_REVENUE_ROUTER_ADDRESS,
    ])
    expect(
      calls.map((call) =>
        decodeFunctionData({ abi: RevenueRouter, data: call.calldata })
      )
    ).toEqual([
      { functionName: 'removeDestinations', args: [[a, b]] },
      { functionName: 'addDestinations', args: [proposed] },
    ])
  })

  it('supports add-only, remove-only, removing all, and leaves unchanged holders alone', () => {
    expect(buildRevenueRouterCalls([], current)).toHaveLength(1)
    expect(buildRevenueRouterCalls(current, [])).toHaveLength(1)
    expect(getDestinationChanges(current, [current[0]])).toEqual({
      removed: [current[1]],
      added: [],
    })
    expect(buildRevenueRouterCalls([], [])).toEqual([])
  })

  it('validates addresses, unique holders, exact D18 precision and nonzero uint96 bounds', () => {
    const valid = toDestinationInputs(current)
    for (const address of [
      zeroAddress,
      EUSD_ADDRESS[1],
      EUSD_REVENUE_ROUTER_ADDRESS,
      'bad',
    ]) {
      expect(parseDestinations([{ ...valid[0], holder: address }])).toBeNull()
      expect(
        parseDestinations([{ ...valid[0], recipient: address }])
      ).toBeNull()
    }
    for (const multiplier of [
      '',
      '0',
      '-1',
      'NaN',
      'Infinity',
      '1e3',
      '1.0000000000000000001',
      '79228162514.264337593543950336',
    ]) {
      expect(parseDestinations([{ ...valid[0], multiplier }])).toBeNull()
    }
    expect(
      parseDestinations([
        { ...valid[0], multiplier: '79228162514.264337593543950335' },
      ])?.[0].multiplier
    ).toBe((1n << 96n) - 1n)
    expect(
      parseDestinations([
        { ...valid[0], multiplier: '0.000000000000000001' },
      ])?.[0].multiplier
    ).toBe(1n)
    expect(
      parseDestinations([valid[0], { ...valid[0], holder: a.toLowerCase() }])
    ).toBeNull()
    expect(parseDestinations(valid)).not.toBeNull() // repeated recipients are allowed
    expect(parseDestinations([])).toEqual([])
    const hundred = Array.from({ length: 100 }, (_, i) => ({
      ...valid[0],
      holder: `0x${(i + 1000).toString(16).padStart(40, '0')}`,
    }))
    expect(parseDestinations(hundred)).toHaveLength(100)
    expect(parseDestinations([...hundred, valid[0]])).toBeNull()
  })

  it('rejects bad checksums instead of crashing the encoder, and checksums lowercase input', () => {
    const recipient = '0x00000000000000000000000000000000000000bb'
    for (const holder of [
      '0xA0D69E286B938E21CBF7E51D71F6A4C8918F482E',
      '0xa0D69E286B938e21CBF7E51D71F6A4c8918f482E',
    ]) {
      expect(
        parseDestinations([{ holder, recipient, multiplier: '1' }])
      ).toBeNull()
    }
    const parsed = parseDestinations([
      {
        holder: '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482e',
        recipient,
        multiplier: '1',
      },
    ])!
    expect(parsed[0].holder).toBe(
      getAddress('0xa0d69e286b938e21cbf7e51d71f6a4c8918f482e')
    )
    expect(() => buildRevenueRouterCalls([], parsed)).not.toThrow()
  })

  it('reports errors per row and field', () => {
    const errors = getDestinationErrors([
      { holder: a, recipient: b, multiplier: '1' },
      { holder: a.toLowerCase(), recipient: 'bad', multiplier: '0' },
    ])
    expect(errors.map((e) => [...e].sort())).toEqual([
      [],
      ['holder', 'multiplier', 'recipient'],
    ])
  })
})
