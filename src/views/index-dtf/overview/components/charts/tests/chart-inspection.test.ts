import { describe, expect, it } from 'vitest'
import { inspectionFromPayload } from '../chart-inspection'

describe('optional chart inspection payload', () => {
  it('preserves finite zero instead of treating it as missing', () => {
    expect(
      inspectionFromPayload([{ payload: { timestamp: 0, price: 0 } }], 'price')
    ).toEqual({ timestamp: 0, value: 0 })
  })

  it('uses the selected metric without deriving a financial value', () => {
    const payload = [{ payload: { timestamp: 123, price: 2, totalAPY: 7 } }]
    expect(inspectionFromPayload(payload, 'totalAPY')).toEqual({
      timestamp: 123,
      value: 7,
    })
    expect(inspectionFromPayload(payload, 'priceBTC')).toBeUndefined()
  })

  it('rejects absent and non-finite samples', () => {
    expect(inspectionFromPayload(undefined, 'price')).toBeUndefined()
    expect(inspectionFromPayload([], 'price')).toBeUndefined()
    for (const price of [undefined, null, NaN, Infinity]) {
      expect(
        inspectionFromPayload([{ payload: { timestamp: 123, price } }], 'price')
      ).toBeUndefined()
    }
    expect(
      inspectionFromPayload(
        [{ payload: { timestamp: NaN, price: 2 } }],
        'price'
      )
    ).toBeUndefined()
  })
})
