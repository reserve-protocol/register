import { render } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { indexDTFAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { governanceProposalsAtom } from '../../../../governance/atoms'
import { currentProposalIdAtom, rebalancesAtom } from '../../../atoms'
import { rebalanceErrorAtom, rebalanceMetricsAtom } from '../atoms'
import type { RebalanceParams } from '../hooks/use-rebalance-params'
import { FOLIO_VERSION_V5, FOLIO_VERSION_V6 } from '../utils/transforms'
import {
  CMC20,
  capturedRebalance,
  currentAssets,
  initialPrices,
  initialWeights,
  priceMap,
  rebalance,
  supply,
  tokenPriceVolatility,
  tokens,
} from './fixtures/cmc20-rebalance'

// Mocked: the RPC/API-backed rebalance read hooks and the SDK's maxAuctionLength read.
const boundary = vi.hoisted(() => ({
  maxAuctionLength: undefined as bigint | undefined,
  maxAuctionLengthError: false,
  params: undefined as unknown,
}))

const paramsFor = (folioVersion: RebalanceParams['folioVersion']): RebalanceParams => ({
  supply,
  initialSupply: supply,
  rebalance,
  currentAssets,
  initialAssets: currentAssets,
  initialPrices,
  initialWeights,
  prices: priceMap,
  tokenPriceVolatility,
  isTrackingDTF: false,
  folioVersion,
  bidsEnabled: true,
})

vi.mock('../hooks/use-rebalance-params', () => ({
  default: () => boundary.params,
  useRebalancePrices: () => ({ isError: false }),
}))
vi.mock('@reserve-protocol/react-sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reserve-protocol/react-sdk')>()
  return {
    ...actual,
    useIndexDtfIdentity: () => ({ address: CMC20, chainId: 56 }),
    useIndexDtfMaxAuctionLength: (identity: unknown) => ({
      data: identity ? boundary.maxAuctionLength : undefined,
      isError: !!identity && boundary.maxAuctionLengthError,
    }),
  }
})

import RebalanceMetricsUpdater from '../updaters/rebalance-metrics-updater'

const storeFor = (version: string) => {
  const store = createStore()
  store.set(indexDTFVersionAtom, version)
  store.set(indexDTFAtom, { id: CMC20.toLowerCase(), chainId: 56 } as any)
  store.set(rebalancesAtom, [
    {
      id: capturedRebalance.id,
      nonce: capturedRebalance.nonce,
      blockNumber: capturedRebalance.blockNumber,
      availableUntil: capturedRebalance.availableUntil,
      restrictedUntil: capturedRebalance.restrictedUntil,
      tokens,
      priceLowLimit: [],
    } as any,
  ])
  store.set(governanceProposalsAtom, [
    { id: 'P', executionBlock: Number(capturedRebalance.blockNumber) } as any,
  ])
  store.set(currentProposalIdAtom, 'P')
  return store
}

const renderUpdater = (version: string) => {
  const store = storeFor(version)
  render(
    <Provider store={store}>
      <RebalanceMetricsUpdater />
    </Provider>
  )
  return store
}

beforeEach(() => {
  boundary.maxAuctionLength = undefined
  boundary.maxAuctionLengthError = false
  boundary.params = paramsFor(FOLIO_VERSION_V6)
})

describe('RebalanceMetricsUpdater on Folio 6.0', () => {
  it('shows no error while the max auction length is still loading', () => {
    const store = renderUpdater('6.0.0')

    expect(store.get(rebalanceErrorAtom)).toBe('')
    expect(store.get(rebalanceMetricsAtom)).toBeUndefined()
  })

  it('says the live state is unavailable when the max auction length read fails', () => {
    boundary.maxAuctionLengthError = true
    const store = renderUpdater('6.0.0')

    expect(store.get(rebalanceErrorAtom)).toBe(
      'Live auction state unavailable — retrying before launch'
    )
    expect(store.get(rebalanceMetricsAtom)).toBeUndefined()
  })

  it('computes the same metrics as v5 once the max auction length has loaded', () => {
    boundary.params = paramsFor(FOLIO_VERSION_V5)
    const v5 = renderUpdater('5.0.0').get(rebalanceMetricsAtom)

    boundary.params = paramsFor(FOLIO_VERSION_V6)
    boundary.maxAuctionLength = 1_800n
    const store = renderUpdater('6.0.0')

    expect(store.get(rebalanceErrorAtom)).toBe('')
    expect(v5?.auctionSize).toBeGreaterThan(0)
    expect(store.get(rebalanceMetricsAtom)).toEqual(v5)
  })
})
