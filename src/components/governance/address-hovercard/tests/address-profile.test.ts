import { describe, expect, it } from 'vitest'
import {
  buildAddressProfile,
  getIndexAddressRoles,
  getYieldAddressRoles,
  needsFreshRead,
} from '../address-profile'
import {
  governanceAccountUrl,
  type GovernanceAccount,
} from '../use-governance-account'

const ADDRESS = '0xB209eed4d80fb47e5c16577e44dad1073c5c5015'
const DTF = '0x23418De10d422AD71C9D5713a2B8991a9c586443'
const EUSD = '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F'
const OWNER_GOV = '0x858c2c08b4984ad4f045f8bf6d85b916b723ed5b'
const OWNER_TIMELOCK = '0x1111111111111111111111111111111111111111'

const dtf = {
  roles: { admin: { all: [OWNER_TIMELOCK] } },
  ownerGovernance: {
    id: OWNER_GOV,
    timelock: { id: OWNER_TIMELOCK, guardians: [ADDRESS.toLowerCase(), OWNER_GOV] },
    optimistic: { proposers: [] },
  },
  tradingGovernance: null,
  auctionLaunchers: [ADDRESS],
  brandManagers: [],
  feeRecipients: [{ address: '0x2222222222222222222222222222222222222222' }],
}

const counts = { executed: 0, defeated: 0, vetoed: 0, canceled: 0 }

const account: GovernanceAccount = {
  address: ADDRESS,
  totals: { proposals: 31, executed: 28, defeated: 3, vetoed: 0, canceled: 0, votes: 96 },
  firstActionAt: 1741718929,
  lastActionAt: 1794600803,
  dtfs: [
    {
      chainId: 8453, address: DTF, symbol: 'BGCI', type: 'index',
      ...counts, proposals: 12, executed: 11, defeated: 1, votes: 41,
      votingPowerSince: 1743552000, delegators: 7,
    },
    {
      chainId: 1, address: DTF, symbol: 'SAME', type: 'index',
      ...counts, proposals: 99, votes: 0, votingPowerSince: null, delegators: null,
    },
    {
      chainId: 1, address: EUSD, symbol: 'eUSD', type: 'yield',
      ...counts, proposals: 1, executed: 1, votes: 52,
      votingPowerSince: 1722888059, delegators: 1,
    },
  ],
  truncated: false,
  degradedChains: [],
}

const voter = { ownPower: 200, votingPower: 1350, votingWeight: 3.4, isSelfDelegated: true }

describe('getIndexAddressRoles', () => {
  it('reads roles from the DTF contracts, case-insensitively', () => {
    expect(getIndexAddressRoles(dtf, ADDRESS)).toEqual(['guardian', 'auction-launcher'])
  })

  it('never labels the DTF governance contracts as guardians or admins', () => {
    expect(getIndexAddressRoles(dtf, OWNER_GOV)).toEqual([])
    expect(getIndexAddressRoles(dtf, OWNER_TIMELOCK)).toEqual([])
  })

  it('returns no roles before the DTF loads', () => {
    expect(getIndexAddressRoles(undefined, ADDRESS)).toEqual([])
  })
})

describe('getYieldAddressRoles', () => {
  const managers = {
    owners: [OWNER_TIMELOCK, ADDRESS.toLowerCase()],
    pausers: [ADDRESS],
    freezers: [],
    longFreezers: [ADDRESS],
    guardians: [ADDRESS],
    governor: OWNER_GOV,
    timelock: OWNER_TIMELOCK,
  }

  it('reads RToken Main roles and the governance guardians', () => {
    expect(getYieldAddressRoles(managers, ADDRESS)).toEqual([
      'admin',
      'guardian',
      'pauser',
      'long-freezer',
    ])
  })

  it('never labels the governor or its timelock', () => {
    expect(getYieldAddressRoles(managers, OWNER_TIMELOCK)).toEqual([])
    expect(getYieldAddressRoles(managers, OWNER_GOV)).toEqual([])
  })
})

describe('buildAddressProfile', () => {
  it('picks this DTF by type, chain and address and keeps the Reserve totals', () => {
    const profile = buildAddressProfile({
      roles: [], dtfType: 'index', chainId: 8453, dtfAddress: DTF.toLowerCase(), account, voter,
    })

    expect(profile.thisDtf).toMatchObject({ proposals: 12, executed: 11, votes: 41 })
    expect(profile.allReserve).toMatchObject({ proposals: 31, votes: 96 })
    expect(profile.votingPowerSince).toBe(1743552000)
    expect(profile.firstActionAt).toBe(1741718929)
  })

  it('picks a Yield DTF entry', () => {
    const profile = buildAddressProfile({
      roles: [], dtfType: 'yield', chainId: 1, dtfAddress: EUSD, account, voter: undefined,
    })

    expect(profile.thisDtf).toMatchObject({ proposals: 1, executed: 1, votes: 52 })
    expect(profile.votingPowerSince).toBe(1722888059)
  })

  it('splits voting power into own and delegated, and leaves the address out of its delegators', () => {
    const profile = buildAddressProfile({
      roles: [], dtfType: 'index', chainId: 8453, dtfAddress: DTF, account, voter,
    })

    expect(profile.delegatedPower).toBe(1150)
    expect(profile.delegators).toBe(6)
    expect(profile.votingWeight).toBe(3.4)
  })

  it('counts every delegator when the address delegates its own stake elsewhere', () => {
    const profile = buildAddressProfile({
      roles: [], dtfType: 'index', chainId: 8453, dtfAddress: DTF, account,
      voter: { ...voter, isSelfDelegated: false, votingPower: 900 },
    })

    expect(profile.delegatedPower).toBe(900)
    expect(profile.delegators).toBe(7)
  })

  it('shows empty counts while the API has not answered', () => {
    const profile = buildAddressProfile({
      roles: [], dtfType: 'index', chainId: 8453, dtfAddress: DTF, account: undefined, voter: undefined,
    })

    expect(profile.thisDtf.proposals).toBe(0)
    expect(profile.votingWeight).toBeNull()
    expect(profile.delegators).toBeNull()
    expect(profile.lastActionAt).toBeNull()
  })
})

describe('needsFreshRead', () => {
  const NOW = 1_800_000_000

  it('asks for a fresh read next to a proposal created in the last minutes', () => {
    expect(needsFreshRead(NOW - 30, NOW)).toBe(true)
    expect(needsFreshRead(NOW - 9 * 60, NOW)).toBe(true)
  })

  it('uses the cached profile for an older proposal or an address with no event', () => {
    expect(needsFreshRead(NOW - 11 * 60, NOW)).toBe(false)
    expect(needsFreshRead(undefined, NOW)).toBe(false)
  })
})

describe('governanceAccountUrl', () => {
  it('adds the fresh flag only for a fresh read', () => {
    expect(governanceAccountUrl(ADDRESS, false)).toMatch(/\/governance$/)
    expect(governanceAccountUrl(ADDRESS, true)).toMatch(/\/governance\?fresh=true$/)
  })
})
