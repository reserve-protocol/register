import { describe, expect, it } from 'vitest'
import type {
  IndexDtfAuction,
  IndexDtfRebalance,
} from '@reserve-protocol/react-sdk'
import { toAuction, toRebalance } from '../sdk-mappers'

const USDC = '0x55d398326f99059fF775485246999027B3197955' as const
const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' as const
const usdc = { address: USDC, name: 'Tether', symbol: 'USDT', decimals: 18 }
const wbnb = { address: WBNB, name: 'Wrapped BNB', symbol: 'WBNB', decimals: 18 }

// Expected values are hand-written literals in the view's string shape, not
// derived from the mapper, so a lossy or reordered field fails here.
describe('toRebalance', () => {
  it('maps the SDK rebalance to the view shape without losing precision', () => {
    const sdk: IndexDtfRebalance = {
      id: '0xdtf-7',
      nonce: '7',
      tokens: [usdc, wbnb],
      priceControl: 'PARTIAL',
      weightLowLimit: [10n ** 27n, 2n ** 64n],
      weightSpotLimit: [11n * 10n ** 26n, 2n ** 64n + 1n],
      weightHighLimit: [12n * 10n ** 26n, 2n ** 64n + 2n],
      rebalanceLimits: { low: 95n * 10n ** 16n, spot: 10n ** 18n, high: 105n * 10n ** 16n },
      priceLowLimit: [9n * 10n ** 29n, 1n],
      priceHighLimit: [11n * 10n ** 29n, 2n],
      restrictedUntil: 1_700_003_600,
      availableUntil: 1_700_007_200,
      transactionHash: '0xabc',
      blockNumber: 122_310_900n,
      timestamp: 1_700_000_000,
    }

    expect(toRebalance(sdk)).toEqual({
      id: '0xdtf-7',
      nonce: '7',
      tokens: [usdc, wbnb],
      priceControl: 'PARTIAL',
      weightLowLimit: ['1000000000000000000000000000', '18446744073709551616'],
      weightSpotLimit: ['1100000000000000000000000000', '18446744073709551617'],
      weightHighLimit: ['1200000000000000000000000000', '18446744073709551618'],
      rebalanceLowLimit: '950000000000000000',
      rebalanceSpotLimit: '1000000000000000000',
      rebalanceHighLimit: '1050000000000000000',
      priceLowLimit: ['900000000000000000000000000000', '1'],
      priceHighLimit: ['1100000000000000000000000000000', '2'],
      restrictedUntil: '1700003600',
      availableUntil: '1700007200',
      transactionHash: '0xabc',
      blockNumber: '122310900',
      timestamp: '1700000000',
    })
  })
})

describe('toAuction', () => {
  it('maps the SDK auction and its bids to the view shape', () => {
    const sdk: IndexDtfAuction = {
      id: '0xdtf-7-0',
      tokens: [usdc, wbnb],
      weightLowLimit: [1n],
      weightSpotLimit: [2n],
      weightHighLimit: [3n],
      rebalanceLimits: { low: 4n, spot: 5n, high: 6n },
      priceLowLimit: [7n],
      priceHighLimit: [8n],
      startTime: 1_700_000_030,
      endTime: 1_700_001_830,
      blockNumber: 122_310_901n,
      timestamp: 1_700_000_000,
      transactionHash: '0xdef',
      bids: [
        {
          id: 'bid-1',
          bidder: '0x000000000000000000000000000000000000dEaD',
          sellToken: usdc,
          buyToken: wbnb,
          sellAmount: 2n ** 80n,
          buyAmount: 3n,
          blockNumber: 122_310_950n,
          timestamp: 1_700_000_600,
          transactionHash: '0xbid',
        },
      ],
    }

    expect(toAuction(sdk)).toEqual({
      id: '0xdtf-7-0',
      tokens: [usdc, wbnb],
      weightLowLimit: ['1'],
      weightSpotLimit: ['2'],
      weightHighLimit: ['3'],
      rebalanceLowLimit: '4',
      rebalanceSpotLimit: '5',
      rebalanceHighLimit: '6',
      priceLowLimit: ['7'],
      priceHighLimit: ['8'],
      startTime: '1700000030',
      endTime: '1700001830',
      blockNumber: '122310901',
      timestamp: '1700000000',
      transactionHash: '0xdef',
      bids: [
        {
          id: 'bid-1',
          bidder: '0x000000000000000000000000000000000000dEaD',
          sellToken: usdc,
          buyToken: wbnb,
          sellAmount: '1208925819614629174706176',
          buyAmount: '3',
          blockNumber: '122310950',
          timestamp: '1700000600',
          transactionHash: '0xbid',
        },
      ],
    })
  })
})
