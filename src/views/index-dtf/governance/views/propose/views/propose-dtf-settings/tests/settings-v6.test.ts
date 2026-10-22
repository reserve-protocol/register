import { createStore } from 'jotai'
import {
  decodeFunctionData,
  parseAbi,
  parseEther,
  toFunctionSelector,
  type Address,
} from 'viem'
import { describe, expect, it } from 'vitest'
import { folioV6Abi, INDEX_DTF_START_REBALANCE_SELECTOR } from '@reserve-protocol/react-sdk'
import {
  indexDTFAtom,
  indexDTFFeeAtom,
  indexDTFVersionAtom,
} from '@/state/dtf/atoms'
import {
  auctionLengthChangeAtom,
  dtfSettingsProposalDataAtom,
  feeRecipientsAtom,
  immutableFeeRecipientsAtom,
  isProposalConfirmedAtom,
  mandateChangeAtom,
  optimisticActionsAtom,
  revenueDistributionChangesAtom,
  selfFeeChangeAtom,
  settingsWriteBlockAtom,
  tradeAllowlistChangesAtom,
} from '../atoms'

const DTF = '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8' as Address
const DEPLOYER = '0x1111111111111111111111111111111111111111' as Address
const VAULT = '0x2222222222222222222222222222222222222222' as Address
const PERMANENT = '0x9999999999999999999999999999999999999999' as Address
const TOKEN_A = '0x3333333333333333333333333333333333333333' as Address
const TOKEN_B = '0x4444444444444444444444444444444444444444' as Address

const makeStore = (version = '6.0.0') => {
  const store = createStore()
  store.set(indexDTFAtom, {
    id: DTF,
    chainId: 8453,
    deployer: DEPLOYER,
    // Mutable table only: 40% deployer + 40% vault next to a 20% permanent recipient.
    feeRecipients: [
      { address: DEPLOYER, percentage: '40' },
      { address: VAULT, percentage: '40' },
    ],
    stToken: { id: VAULT },
  } as any)
  store.set(indexDTFFeeAtom, 50)
  store.set(indexDTFVersionAtom, version)
  store.set(isProposalConfirmedAtom, true)
  return store
}

const decode = (data: `0x${string}`) =>
  decodeFunctionData({ abi: folioV6Abi, data })

describe('Folio 6.0 settings proposal', () => {
  it('is no longer write-blocked', () => {
    expect(makeStore().get(settingsWriteBlockAtom)).toBeUndefined()
  })

  it('encodes the auction length as setMaxAuctionLength in seconds', () => {
    const store = makeStore()
    store.set(mandateChangeAtom, 'new mandate')
    store.set(auctionLengthChangeAtom, 30)

    const data = store.get(dtfSettingsProposalDataAtom)!
    const calls = data.calldatas.map(decode)
    expect(calls.map((call) => call.functionName)).toEqual([
      'setMandate',
      'setMaxAuctionLength',
    ])
    expect(calls[1].args).toEqual([1800n])
    expect(data.targets).toEqual([DTF, DTF])
  })

  it('passes the immutable table back unchanged and fits the mutable split into what it leaves', () => {
    const store = makeStore()
    store.set(immutableFeeRecipientsAtom, [
      { recipient: PERMANENT, portion: parseEther('0.2') },
    ])
    store.set(revenueDistributionChangesAtom, {
      governanceShare: 30,
      deployerShare: 20,
    })

    const [call] = store.get(dtfSettingsProposalDataAtom)!.calldatas.map(decode)
    expect(call.functionName).toBe('setFeeRecipients')
    const [mutable, immutable] = call.args as unknown as [
      { recipient: Address; portion: bigint }[],
      { recipient: Address; portion: bigint }[],
    ]
    expect(immutable).toEqual([
      { recipient: PERMANENT, portion: parseEther('0.2') },
    ])
    expect(mutable).toEqual([
      { recipient: DEPLOYER, portion: parseEther('0.32') },
      { recipient: VAULT, portion: parseEther('0.48') },
    ])
  })

  it('builds no fee recipient call until the immutable table is read', () => {
    const store = makeStore()
    store.set(revenueDistributionChangesAtom, { governanceShare: 30, deployerShare: 20 })

    expect(store.get(dtfSettingsProposalDataAtom)).toBeUndefined()
  })

  it('shows the current mutable split relative to the share the immutable table leaves', () => {
    const store = makeStore()
    store.set(immutableFeeRecipientsAtom, [
      { recipient: PERMANENT, portion: parseEther('0.2') },
    ])

    expect(store.get(feeRecipientsAtom)).toMatchObject({
      deployerShare: 25,
      governanceShare: 25,
    })
  })

  it('still seeds the form when permanent recipients take the whole table', () => {
    const store = makeStore()
    store.set(immutableFeeRecipientsAtom, [
      { recipient: PERMANENT, portion: parseEther('1') },
    ])

    expect(store.get(feeRecipientsAtom)).toMatchObject({
      deployerShare: 0,
      governanceShare: 0,
      externalRecipients: [],
    })
  })

  it('encodes the self fee and trade allowlist changes', () => {
    const store = makeStore()
    store.set(selfFeeChangeAtom, 10)
    store.set(tradeAllowlistChangesAtom, {
      enabled: true,
      add: [TOKEN_A],
      remove: [TOKEN_B],
    })

    const calls = store.get(dtfSettingsProposalDataAtom)!.calldatas.map(decode)
    expect(calls.map((call) => [call.functionName, call.args])).toEqual([
      ['setFolioSelfFee', [parseEther('0.1')]],
      ['addToAllowlist', [[TOKEN_A]]],
      ['removeFromAllowlist', [[TOKEN_B]]],
      ['setTradeAllowlistEnabled', [true]],
    ])
  })

  it.each(['5.0.0', '6.0.0'])(
    '%s: a single recipient takes the whole table despite platform-fee rounding',
    (version) => {
      const store = makeStore(version)
      store.set(indexDTFFeeAtom, 100 / 3)
      store.set(immutableFeeRecipientsAtom, [])
      store.set(revenueDistributionChangesAtom, {
        governanceShare: 66.67,
        deployerShare: 0,
      })

      const [calldata] = store.get(dtfSettingsProposalDataAtom)!.calldatas
      const abi =
        version === '6.0.0'
          ? folioV6Abi
          : parseAbi(['function setFeeRecipients((address recipient, uint96 portion)[])'])
      const call = decodeFunctionData({ abi, data: calldata })
      expect((call.args as unknown as unknown[])[0]).toEqual([
        { recipient: VAULT, portion: parseEther('1') },
      ])
    }
  )

  it('builds no proposal (instead of throwing) when the SDK rejects a fee table', () => {
    const store = makeStore()
    store.set(immutableFeeRecipientsAtom, [])
    // The Folio itself can't be a recipient; the SDK table check rejects it.
    store.set(revenueDistributionChangesAtom, {
      governanceShare: 0,
      deployerShare: 0,
      additionalRecipients: [{ address: DTF, share: 50 }],
    })

    expect(() => store.get(dtfSettingsProposalDataAtom)).not.toThrow()
    expect(store.get(dtfSettingsProposalDataAtom)).toBeUndefined()
  })

  it('keeps Folio 5.0 fee recipients on the one-table setter', () => {
    const store = makeStore('5.0.0')
    store.set(revenueDistributionChangesAtom, { governanceShare: 30, deployerShare: 20 })

    const [calldata] = store.get(dtfSettingsProposalDataAtom)!.calldatas
    const call = decodeFunctionData({
      abi: parseAbi(['function setFeeRecipients((address recipient, uint96 portion)[])']),
      data: calldata,
    })
    expect(call.args[0]).toEqual([
      { recipient: DEPLOYER, portion: parseEther('0.4') },
      { recipient: VAULT, portion: parseEther('0.6') },
    ])
  })
})

describe('optimisticActionsAtom', () => {
  it('lists the Folio 6.0 selectors for the setters 6.0 changed', () => {
    const selectors = Object.fromEntries(
      makeStore().get(optimisticActionsAtom).map((action) => [action.id, action.selector])
    )
    expect(selectors.startRebalance).toBe(INDEX_DTF_START_REBALANCE_SELECTOR['6.0.0'])
    expect(selectors.setAuctionLength).toBe(toFunctionSelector('setMaxAuctionLength(uint256)'))
    expect(selectors.setFeeRecipients).toBe(
      toFunctionSelector('setFeeRecipients((address,uint96)[],(address,uint96)[])')
    )
    expect(selectors.setMandate).toBe(toFunctionSelector('setMandate(string)'))
  })

  it('keeps the Folio 5.0 selectors', () => {
    const selectors = Object.fromEntries(
      makeStore('5.0.0').get(optimisticActionsAtom).map((action) => [action.id, action.selector])
    )
    expect(selectors.startRebalance).toBe(INDEX_DTF_START_REBALANCE_SELECTOR['5.0.0'])
    expect(selectors.setAuctionLength).toBe(toFunctionSelector('setAuctionLength(uint256)'))
  })
})
