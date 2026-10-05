import { decodeFunctionData, getAddress, parseAbi, zeroAddress } from 'viem'
import { describe, expect, it } from 'vitest'
import {
  buildV6UpgradeProposal,
  getV6UpgradeEligibility,
  hasLiveV6Upgrade,
  nextV6UpgradeDescription,
} from '../v6-upgrade'

const FOLIO = getAddress('0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8')
const PROXY_ADMIN = getAddress('0x00000000000000000000000000000000000000Ad')
const SPELL = getAddress('0x4BCD4101729C25f4E65b29357387440E357d43C1')
const REGISTRY = getAddress('0x00000000000000000000000000000000000000Aa')
const GOVERNOR = getAddress('0x00000000000000000000000000000000000000Bb')
const LIVE = { implementation: '0x00000000000000000000000000000000000000Cc', deprecated: false }

const ready = {
  version: '5.0.0',
  spell: SPELL,
  deployment: LIVE,
  isOptimistic: true,
  selectorRegistry: REGISTRY,
  migrationPending: false,
} as const

describe('getV6UpgradeEligibility', () => {
  it('offers the optimistic upgrade with the governor selector registry', () => {
    expect(getV6UpgradeEligibility(ready)).toEqual({ status: 'ready', selectorRegistry: REGISTRY })
  })

  it('offers the legacy upgrade with a zero selector registry', () => {
    expect(
      getV6UpgradeEligibility({ ...ready, isOptimistic: false, selectorRegistry: undefined })
    ).toEqual({ status: 'ready', selectorRegistry: zeroAddress })
  })

  it.each([
    ['a non-5.0.0 Folio', { version: '4.0.0' }, 'hidden'],
    ['a 6.0.0 Folio', { version: '6.0.0' }, 'hidden'],
    ['no spell on this chain', { spell: undefined }, 'hidden'],
    ['6.0.0 not registered', { deployment: null }, 'hidden'],
    ['the registry read still loading', { deployment: undefined }, 'hidden'],
    ['6.0.0 deprecated', { deployment: { ...LIVE, deprecated: true } }, 'hidden'],
    ['a legacy DTF that still has to migrate governance', { isOptimistic: false, selectorRegistry: undefined, migrationPending: true }, 'hidden'],
  ])('hides it for %s', (_, change, status) => {
    expect(getV6UpgradeEligibility({ ...ready, ...change }).status).toBe(status)
  })

  it('blocks an optimistic governor whose selector registry is unresolved instead of falling back to zero', () => {
    for (const selectorRegistry of [undefined, zeroAddress]) {
      expect(getV6UpgradeEligibility({ ...ready, selectorRegistry })).toEqual({
        status: 'blocked',
        reason: 'selector-registry-unresolved',
      })
    }
  })
})

describe('buildV6UpgradeProposal', () => {
  const abi = parseAbi([
    'function registerSelectors((address target, bytes4[] selectors)[])',
    'function unregisterSelectors((address target, bytes4[] selectors)[])',
    'function transferOwnership(address)',
    'function cast(address folio, address proxyAdmin, address selectorRegistry)',
  ])
  const decode = (data: `0x${string}`) => decodeFunctionData({ abi, data })

  it('builds the exact four-call standard proposal for optimistic governance', () => {
    const proposal = buildV6UpgradeProposal({
      chainId: 8453,
      folio: FOLIO,
      proxyAdmin: PROXY_ADMIN,
      spell: SPELL,
      governor: GOVERNOR,
      selectorRegistry: REGISTRY,
      description: 'Release 6.0.0 upgrade #1',
    })

    expect(proposal.functionName).toBe('propose')
    expect(proposal.address).toBe(GOVERNOR)
    const [targets, values, calldatas, description] = proposal.args
    expect(targets).toEqual([REGISTRY, REGISTRY, PROXY_ADMIN, SPELL])
    expect(values).toEqual([0n, 0n, 0n, 0n])
    expect(calldatas.map(decode)).toEqual([
      { functionName: 'registerSelectors', args: [[{ target: FOLIO, selectors: ['0xc1e54b89'] }]] },
      { functionName: 'unregisterSelectors', args: [[{ target: FOLIO, selectors: ['0x207c8eed'] }]] },
      { functionName: 'transferOwnership', args: [SPELL] },
      { functionName: 'cast', args: [FOLIO, PROXY_ADMIN, REGISTRY] },
    ])
    expect(description).toBe('Release 6.0.0 upgrade #1')
  })

  it('builds the exact two-call standard proposal for legacy governance', () => {
    const proposal = buildV6UpgradeProposal({
      chainId: 8453,
      folio: FOLIO,
      proxyAdmin: PROXY_ADMIN,
      spell: SPELL,
      governor: GOVERNOR,
      selectorRegistry: zeroAddress,
      description: 'Release 6.0.0 upgrade #1',
    })

    const [targets, values, calldatas] = proposal.args
    expect(targets).toEqual([PROXY_ADMIN, SPELL])
    expect(values).toEqual([0n, 0n])
    expect(calldatas.map(decode)).toEqual([
      { functionName: 'transferOwnership', args: [SPELL] },
      { functionName: 'cast', args: [FOLIO, PROXY_ADMIN, zeroAddress] },
    ])
  })
})

describe('upgrade proposal retries', () => {
  const proposal = (description: string, state: string, governance = GOVERNOR) =>
    ({ description, governance, votingState: { state } }) as never

  it('hides the action while an equivalent proposal on this governor is live', () => {
    expect(hasLiveV6Upgrade([proposal('Release 6.0.0 upgrade #1', 'ACTIVE')], GOVERNOR)).toBe(true)
    expect(hasLiveV6Upgrade([proposal('Release 6.0.0 upgrade #1', 'DEFEATED')], GOVERNOR)).toBe(false)
    expect(
      hasLiveV6Upgrade([proposal('Release 6.0.0 upgrade #1', 'ACTIVE', '0x00000000000000000000000000000000000000ee')], GOVERNOR)
    ).toBe(false)
  })

  it('numbers the next attempt after any earlier one, live or not', () => {
    expect(nextV6UpgradeDescription([])).toBe('Release 6.0.0 upgrade #1')
    expect(
      nextV6UpgradeDescription([
        proposal('Release 6.0.0 upgrade #1', 'DEFEATED'),
        proposal('Release 6.0.0 upgrade #3', 'EXPIRED'),
      ])
    ).toBe('Release 6.0.0 upgrade #4')
  })
})
