import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import type { Address } from 'viem'
import {
  portfolioActiveProposalsAtom,
  portfolioDataAtom,
  portfolioNowAtom,
} from '../atoms'
import type { PortfolioResponse } from '../types'

const ADDRESS = '0x1111111111111111111111111111111111111111' as Address
const DGI = '0x9a1741e151233a82cf69209a2f1bc7442b1fb29c' as Address
const proposal = {
  id: '1',
  description: '# Governance proposal',
  state: 'ACTIVE',
  isOptimistic: false,
  proposer: ADDRESS,
  creationTime: '100',
  voteStart: '100',
  voteEnd: '500',
  forWeightedVotes: '0',
  againstWeightedVotes: '0',
  abstainWeightedVotes: '0',
  totalWeightedVotes: '0',
  quorumVotes: '100',
  queueTime: null,
  executionETA: null,
}
const position = {
  address: ADDRESS,
  name: 'First DTF',
  symbol: 'FIRST',
  chainId: 1,
  amount: '0',
  votingPower: '10',
  activeProposals: [proposal],
  dtfs: [
    { address: ADDRESS, name: 'First DTF', symbol: 'FIRST' },
    { address: DGI, name: 'DGI', symbol: 'DGI' },
  ],
}
const rowsFor = (data: Partial<PortfolioResponse>) => {
  const store = createStore()
  store.set(portfolioNowAtom, 200)
  store.set(portfolioDataAtom, {
    totalHoldingsUSD: 0,
    indexDTFs: [],
    yieldDTFs: [],
    stakedRSR: [],
    voteLocks: [],
    rsrBalances: [],
    ...data,
  })
  return store.get(portfolioActiveProposalsAtom)
}

describe('Portfolio governance coverage', () => {
  it('keeps the owning DTF on proposals from a shared vote-lock vault', () => {
    const rows = rowsFor({
      voteLocks: [
        {
          ...position,
          amount: '10',
          activeProposals: [
            {
              ...proposal,
              dtfAddress: DGI,
              dtfName: 'DGI',
              dtfSymbol: 'DGI',
            },
          ],
        },
      ],
    } as unknown as Partial<PortfolioResponse>)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      dtfAddress: DGI,
      dtfName: 'DGI',
      dtfSymbol: 'DGI',
    })
  })

  it('matches proposal DTF addresses case-insensitively', () => {
    const rows = rowsFor({
      voteLocks: [
        {
          ...position,
          activeProposals: [
            { ...proposal, dtfAddress: `0x${DGI.slice(2).toUpperCase()}` },
          ],
        },
      ],
    } as unknown as Partial<PortfolioResponse>)
    expect(rows[0]?.dtfAddress).toBe(DGI)
  })

  it('does not relabel a hidden DTF proposal as another visible DTF', () => {
    const rows = rowsFor({
      voteLocks: [
        {
          ...position,
          dtfs: [position.dtfs[0], { ...position.dtfs[1], symbol: 'COMPUTE' }],
          activeProposals: [{ ...proposal, dtfAddress: DGI }],
        },
      ],
    } as unknown as Partial<PortfolioResponse>)
    expect(rows).toEqual([])
  })

  it('does not surface proposals for an empty position without voting power', () => {
    const rows = rowsFor({
      voteLocks: [{ ...position, votingPower: '0' }],
    } as unknown as Partial<PortfolioResponse>)
    expect(rows).toEqual([])
  })

  it('keeps index proposals for a delegate with voting power but no owned shares', () => {
    const rows = rowsFor({
      voteLocks: [position],
    } as unknown as Partial<PortfolioResponse>)
    expect(rows.map((row) => row.id)).toEqual(['1'])
  })
})
