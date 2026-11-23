import { indexDTFAtom } from '@/state/dtf/atoms'
import { IndexDTF } from '@/types'
import { ChainId } from '@/utils/chains'
import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import { dtfContractAliasAtom } from '../atoms'

const governance = (id: string, timelock: string) => ({
  id,
  timelock: { id: timelock },
})

const getAliases = (dtf: Record<string, unknown>) => {
  const store = createStore()
  store.set(indexDTFAtom, {
    id: '0xf0',
    proxyAdmin: '0xa0',
    chainId: ChainId.Base,
    ...dtf,
  } as unknown as IndexDTF)
  return store.get(dtfContractAliasAtom)!
}

describe('dtfContractAliasAtom', () => {
  it('labels a shared owner/trading governor as DTF Governance', () => {
    const shared = governance('0xAA', '0xbb')
    const aliases = getAliases({
      ownerGovernance: shared,
      tradingGovernance: { ...shared, id: '0xaa' },
    })

    expect(aliases['0xaa']).toBe('DTF Governance')
    expect(aliases['0xbb']).toBe('DTF Governance Timelock')
  })

  it('keeps separate labels when governors differ', () => {
    const aliases = getAliases({
      ownerGovernance: governance('0x01', '0x02'),
      tradingGovernance: governance('0x03', '0x04'),
    })

    expect(aliases['0x01']).toBe('Owner Governance')
    expect(aliases['0x02']).toBe('Owner Governance Timelock')
    expect(aliases['0x03']).toBe('Basket Governance')
    expect(aliases['0x04']).toBe('Basket Governance Timelock')
  })
})
