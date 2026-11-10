import { renderHook } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { indexDTFAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { governanceProposalsAtom } from '../../../../governance/atoms'
import { currentProposalIdAtom, rebalancesAtom } from '../../../atoms'
import type { RebalanceParams } from '../hooks/use-rebalance-params'
import getRebalanceOpenAuction from '../utils/get-rebalance-open-auction'
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

// RPC boundaries: the rebalance reads (params), the Ondo liquidity API, and the SDK's maxAuctionLength read.
const boundary = vi.hoisted(() => ({
  params: undefined as unknown,
  ondoLimits: {} as Record<string, unknown>,
  maxAuctionLength: undefined as bigint | undefined,
}))

vi.mock('../hooks/use-rebalance-params', () => ({
  default: () => boundary.params,
}))
vi.mock('../hooks/use-ondo-limits', () => ({
  default: () => boundary.ondoLimits,
}))
vi.mock('@reserve-protocol/react-sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reserve-protocol/react-sdk')>()
  return {
    ...actual,
    useIndexDtfIdentity: () => ({ address: CMC20, chainId: 56 }),
    useIndexDtfMaxAuctionLength: (params: unknown) => ({
      data: params ? boundary.maxAuctionLength : undefined,
      isError: false,
    }),
  }
})

import useOndoLimitStatus from '../hooks/use-ondo-limit-status'

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
    } as any,
  ])
  store.set(governanceProposalsAtom, [
    { id: 'P', executionBlock: Number(capturedRebalance.blockNumber) } as any,
  ])
  store.set(currentProposalIdAtom, 'P')
  return store
}

const render = (version: string) => {
  const store = storeFor(version)
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return renderHook(() => useOndoLimitStatus(), { wrapper }).result.current
}

// Binds the first surplus leg at half its full-percent size so the cap lands strictly between 1 and 100.
const bindingLimit = () => {
  const [, metrics] = getRebalanceOpenAuction(
    FOLIO_VERSION_V5,
    tokens,
    rebalance,
    supply,
    supply,
    currentAssets,
    currentAssets,
    initialPrices,
    initialWeights,
    priceMap,
    false,
    tokenPriceVolatility,
    100
  )
  const token = metrics.surplusTokens[0].toLowerCase()
  return {
    [token]: {
      symbol: 'ONDO-TEST',
      capacityUsd: metrics.surplusTokenSizes[0] / 2,
      tradingOpen: true,
    },
  }
}

beforeEach(() => {
  boundary.ondoLimits = bindingLimit()
  boundary.maxAuctionLength = undefined
})

describe('useOndoLimitStatus on Folio 6.0', () => {
  it('sizes v6 legs with the RPC max auction length, exactly like v5', () => {
    boundary.params = paramsFor(FOLIO_VERSION_V5)
    const v5 = render('5.0.0').maxSafePercent

    boundary.params = paramsFor(FOLIO_VERSION_V6)
    boundary.maxAuctionLength = 1_800n
    const v6 = render('6.0.0').maxSafePercent

    expect(v5).toBeGreaterThan(1)
    expect(v5).toBeLessThan(100)
    expect(v6).toBe(v5)
  })

  it('reports the cap as unavailable while the v6 auction length has not loaded', () => {
    boundary.params = paramsFor(FOLIO_VERSION_V6)
    expect(render('6.0.0').maxSafePercent).toBeUndefined()
  })
})
