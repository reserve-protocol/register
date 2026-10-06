import { decodeFunctionData, getAddress, type Address } from 'viem'
import { describe, expect, it } from 'vitest'
import {
  VOTE_LOCK_UPGRADE_MESSAGE,
  buildVoteLockUpgradeProposal,
  decodeVoteLockUpgradeCall,
  getVoteLockUpgradeEligibility,
  hasLiveVoteLockUpgrade,
  nextVoteLockUpgradeDescription,
  voteLockUpgradeAbi,
} from '../vote-lock-upgrade'

const VAULT = getAddress('0x2F0D6538807a77d4AdDCd4b4DAf214Ea2E818E3D')
const GOVERNOR = getAddress('0x1f01c742c8dd65e33cec1abd6dd049aa245e3453')
const TIMELOCK = getAddress('0xf9D78078CB30f0073A0010193bDB3Df8083bA721')
const REGISTRY = getAddress('0x0692eCddFe6ad18dBD4BBD7D1ea506e461Eb87aA')
const IMPLS = {
  vault: getAddress('0x35051BBE8CC9c47643132fE328a3F0C71819f83a'),
  governor: getAddress('0x69c6597690B8Df61D15F201519C03725bdec40c1'),
  timelock: getAddress('0x5688198927870968E57e332c77bce33fa0c1B9e1'),
}

const ready = {
  versions: { vault: '1.0.0', governor: '1.0.0', timelock: '1.0.0' },
  latest: { version: '1.1.0', deprecated: false },
  implementations: IMPLS,
  governorTimelock: TIMELOCK,
  timelock: TIMELOCK,
}

const proposal = (description: string, state: string) =>
  ({ description, votingState: { state } }) as never

describe('getVoteLockUpgradeEligibility', () => {
  it('is ready when vault, governor and timelock are on 1.0.0 and 1.1.0 is the live latest', () => {
    expect(getVoteLockUpgradeEligibility(ready)).toBe(true)
  })

  it.each([
    ['the vault is already upgraded', { versions: { ...ready.versions, vault: '1.1.0' } }],
    ['a component read is missing', { versions: { ...ready.versions, governor: undefined } }],
    ['the latest version is not 1.1.0', { latest: { version: '1.2.0', deprecated: false } }],
    ['the latest version is deprecated', { latest: { version: '1.1.0', deprecated: true } }],
    ['an implementation is unset', { implementations: { ...IMPLS, timelock: undefined } }],
    ['the governor points at another timelock', { governorTimelock: VAULT }],
  ])('is hidden when %s', (_, patch) => {
    expect(getVoteLockUpgradeEligibility({ ...ready, ...patch } as never)).toBe(false)
  })
})

describe('buildVoteLockUpgradeProposal', () => {
  it('upgrades vault, governor and timelock through the DAO governor with their 1.1.0 initializers', () => {
    const tx = buildVoteLockUpgradeProposal({
      chainId: 8453,
      governor: GOVERNOR,
      vault: VAULT,
      timelock: TIMELOCK,
      registry: REGISTRY,
      implementations: IMPLS,
      description: `${VOTE_LOCK_UPGRADE_MESSAGE} #1`,
    })

    expect(tx.address).toBe(GOVERNOR)
    expect(tx.functionName).toBe('propose')
    const [targets, values, calldatas, description] = tx.args
    expect(targets).toEqual([VAULT, GOVERNOR, TIMELOCK])
    expect(values).toEqual([0n, 0n, 0n])
    expect(description).toBe(`${VOTE_LOCK_UPGRADE_MESSAGE} #1`)

    const upgrades = calldatas.map((data) => decodeFunctionData({ abi: voteLockUpgradeAbi, data }))
    expect(upgrades.map((u) => [u.functionName, (u.args as [Address])[0]])).toEqual([
      ['upgradeToAndCall', IMPLS.vault],
      ['upgradeToAndCall', IMPLS.governor],
      ['upgradeToAndCall', IMPLS.timelock],
    ])
    const inits = upgrades.map((u) =>
      decodeFunctionData({ abi: voteLockUpgradeAbi, data: (u.args as [Address, `0x${string}`])[1] })
    )
    expect(inits[0]).toEqual({ functionName: 'initializeAverageVotes', args: undefined })
    expect(inits[1]).toEqual({ functionName: 'initializeVersionRegistry', args: [REGISTRY] })
    expect(inits[2]).toEqual({ functionName: 'initializeVersionRegistry', args: [REGISTRY] })
  })
})

describe('proposal bookkeeping', () => {
  it('treats pending, active, succeeded, queued and executed upgrades as live', () => {
    for (const state of ['PENDING', 'ACTIVE', 'SUCCEEDED', 'QUEUED', 'EXECUTED']) {
      expect(hasLiveVoteLockUpgrade([proposal(`${VOTE_LOCK_UPGRADE_MESSAGE} #1`, state)])).toBe(true)
    }
    expect(hasLiveVoteLockUpgrade([proposal(`${VOTE_LOCK_UPGRADE_MESSAGE} #1`, 'DEFEATED')])).toBe(false)
    expect(hasLiveVoteLockUpgrade([proposal('Something else', 'ACTIVE')])).toBe(false)
  })

  it('numbers the next attempt after the highest previous one', () => {
    expect(nextVoteLockUpgradeDescription([])).toBe(`${VOTE_LOCK_UPGRADE_MESSAGE} #1`)
    expect(
      nextVoteLockUpgradeDescription([
        proposal(`${VOTE_LOCK_UPGRADE_MESSAGE} #2`, 'DEFEATED'),
        proposal('Release 5.0.0 upgrade #7', 'EXECUTED'),
      ])
    ).toBe(`${VOTE_LOCK_UPGRADE_MESSAGE} #3`)
  })
})

describe('decodeVoteLockUpgradeCall', () => {
  const [, , calldatas] = buildVoteLockUpgradeProposal({
    chainId: 8453,
    governor: GOVERNOR,
    vault: VAULT,
    timelock: TIMELOCK,
    registry: REGISTRY,
    implementations: IMPLS,
    description: 'x',
  }).args

  it('reads the implementation and initializer from each upgrade call', () => {
    expect(calldatas.map(decodeVoteLockUpgradeCall)).toEqual([
      { implementation: IMPLS.vault, initializer: 'initializeAverageVotes' },
      { implementation: IMPLS.governor, initializer: 'initializeVersionRegistry', registry: REGISTRY },
      { implementation: IMPLS.timelock, initializer: 'initializeVersionRegistry', registry: REGISTRY },
    ])
  })

  it('ignores anything that is not upgradeToAndCall', () => {
    expect(decodeVoteLockUpgradeCall('0x12345678')).toBeUndefined()
    expect(decodeVoteLockUpgradeCall('0x')).toBeUndefined()
  })
})
