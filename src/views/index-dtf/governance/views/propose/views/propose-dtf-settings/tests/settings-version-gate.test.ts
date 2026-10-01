import { createStore } from 'jotai'
import { decodeFunctionData, parseAbi } from 'viem'
import { describe, expect, it } from 'vitest'
import { indexDTFAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import {
  auctionLengthChangeAtom,
  dtfSettingsProposalDataAtom,
  isProposalConfirmedAtom,
  mandateChangeAtom,
} from '../atoms'

const DTF = '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8'
const LEGACY_SETTERS = parseAbi([
  'function setAuctionLength(uint256)',
  'function setMandate(string)',
])

const makeStore = (version: string | undefined) => {
  const store = createStore()
  store.set(indexDTFAtom, { id: DTF, chainId: 8453 } as any)
  store.set(indexDTFVersionAtom, version)
  store.set(auctionLengthChangeAtom, 30)
  store.set(mandateChangeAtom, 'new mandate')
  store.set(isProposalConfirmedAtom, true)
  return store
}

describe('dtfSettingsProposalDataAtom version gate', () => {
  it('builds the legacy setter calldata for a Folio 5.0 DTF', () => {
    const data = makeStore('5.0.0').get(dtfSettingsProposalDataAtom)

    const names = data?.calldatas.map(
      (calldata) =>
        decodeFunctionData({ abi: LEGACY_SETTERS, data: calldata }).functionName
    )
    expect(names).toEqual(['setMandate', 'setAuctionLength'])
    expect(data?.targets).toEqual([DTF, DTF])
  })

  it('builds no calldata for a Folio 6.0 DTF (setAuctionLength does not exist there)', () => {
    expect(makeStore('6.0.0').get(dtfSettingsProposalDataAtom)).toBeUndefined()
  })

  it('builds no calldata while the version is pending', () => {
    expect(makeStore(undefined).get(dtfSettingsProposalDataAtom)).toBeUndefined()
  })

  it('builds no calldata for an unknown version', () => {
    expect(makeStore('7.0.0').get(dtfSettingsProposalDataAtom)).toBeUndefined()
  })
})
