import { mapCandles } from '@/views/index-dtf/overview/components/charts/use-candlestick-data'
import capture from '../fixtures/photon-candles-ytd-7d.json'

describe('chart lab candle source', () => {
  it('retains the captured request identity, interval, and raw OHLC oracle', () => {
    expect(capture.provenance).toMatchObject({
      chainId: 56,
      address: '0xa0fe4e0aeca5479705ce996615b2eacb6b6a10fb',
      from: 1767225600,
      to: 1789311670,
      interval: '7d',
      capturedAt: '2026-09-14T22:00:48Z',
    })
    expect(capture.response.candles).toHaveLength(37)
    expect(capture.response.candles[0]).toEqual({
      timestamp: 1767225600,
      open: 47.40637659819312,
      high: 50.531001594224485,
      low: 46.74850942330484,
      close: 49.826102697789935,
      count: 168,
    })
    expect(capture.response.candles.at(-1)).toEqual({
      timestamp: 1788998400,
      open: 85.96013955115295,
      high: 86.43238314602596,
      low: 82.2535902397341,
      close: 83.60053002322653,
      count: 1039,
    })
  })

  it('reuses production validity filtering without manufacturing replacement OHLC', () => {
    const mapped = mapCandles(capture.response)

    expect(mapped).toHaveLength(36)
    expect(mapped.some((candle) => candle.timestamp === 1786579200)).toBe(false)
    expect(mapped[0]).toEqual({
      timestamp: 1767225600,
      open: 47.40637659819312,
      high: 50.531001594224485,
      low: 46.74850942330484,
      close: 49.826102697789935,
      highLow: [46.74850942330484, 50.531001594224485],
    })
  })
})
