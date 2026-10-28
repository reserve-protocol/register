import { describe, expect, it } from 'vitest'
import { RSR_ADDRESS } from '@/utils/addresses'
import { ChainId } from '@/utils/chains'
import { getAddress, zeroAddress } from 'viem'
import {
  getGovernanceUpgradeTarget,
  getMigrationVault,
} from '@/components/vote-lock/migration/migration-targets'
import {
  getOldVoteLocks,
  isOptimisticGovernanceUpgradeEligible,
} from '../governance-migration'

const LCAP = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8'
const OPEN = '0x323c03c48660fE31186fa82c289b0766d331Ce21'
const ABX = '0xEbcDa5b80F62dD4DD2A96357b42BB6Facbf30267'

const legacy = {
  chainId: ChainId.Base,
  dtfAddress: LCAP,
  status: 'active' as const,
  folioVersion: '5.0.0',
  ownerGovernor: '0x719eded05c7a6468e44acfbbd19b2df2eed7759e',
  tradingGovernor: '0xf9edb4491fbd5e1185e05ecba2d69251dd869096',
  stakingVaultVersion: '1.1.0',
  ownerTimelock: '0x98e702320f055c1073f9cee2b93f46c9715bc32d',
  tradingTimelock: '0xb785a1dac3724ea73a1368d6e0085b6a930e2ccd',
  oldVoteLock: '0x45a96cd0e4d89a41eebf3cc4204b00b1cf1582fa',
  oldVoteLockUnderlying: '0xaB36452DbAC151bE02b16Ca17d8919826072f64a',
  admins: ['0x98e702320f055c1073f9cee2b93f46c9715bc32d'],
  auctionApprovers: ['0xb785a1dac3724ea73a1368d6e0085b6a930e2ccd'],
  auctionLaunchers: ['0x00000000000000000000000000000000000000aa'],
  brandManagers: [] as string[],
  feeRecipients: [
    '0x718841c68eab4038ef389c154f8e91f9923b2fda',
    '0x45a96cd0e4d89a41eebf3cc4204b00b1cf1582fa',
  ],
}
const TOKEN_JAR = '0xEAfA84184BEb90891cb5c4942ebD59C18dda0bfE'
const SQUILL = '0x7ebAB7190d3d574ce82D29F2FA1422f18E29969C'
const VL_SQUILL = '0x60e71dd36Fa5Bf92bcd9320e85cF0040ffe437Bc'
const OPEN_SPELL = '0xaf029ad44Cc44fB2AefFF84029dd0c29D5Ea8D87'
const OPEN_OLD_VAULT = getAddress('0x2aea77c4757d897aae2710b8a60280777f504e8c')
const SHARED_BASE_SPELL = '0x24a4B37F9c40fB0E80ec436Df2e9989FBAFa8bB7'
const ALTT = getAddress('0x1b5ce2a593a840e3ad3549a34d7b3dec697c114d')
const VL_ALTT = getAddress('0xcb99d380302220E9896776d559AC98D552357a00')
const ABX_OLD_VAULT = getAddress('0x6f1fe54c2275dc64ce1ce9cbf2007ef7bd53c117')
const open = {
  ...legacy,
  chainId: ChainId.Mainnet,
  dtfAddress: OPEN,
  folioVersion: '4.0.0',
  oldVoteLock: '0x2aea77c4757d897aae2710b8a60280777f504e8c',
  oldVoteLockUnderlying: SQUILL,
  feeRecipients: [
    '0x2aea77c4757d897aae2710b8a60280777f504e8c',
    '0xde3b1a502a6f25b92434a00c4169b195b2f1528c',
  ],
}

describe('getGovernanceUpgradeTarget', () => {
  it('routes OPEN through its own spell into vlSQUILL, which also takes the fee share', () => {
    expect(getGovernanceUpgradeTarget(ChainId.Mainnet, OPEN)).toMatchObject({
      spell: OPEN_SPELL,
      stakingVault: VL_SQUILL,
      stakingVaultUnderlying: SQUILL,
      feeRecipient: zeroAddress,
    })
  })

  it('uses the shared spell, vlRSR singleton and token jar for everyone else', () => {
    expect(getGovernanceUpgradeTarget(ChainId.Base, LCAP)).toEqual({
      spell: '0x24a4B37F9c40fB0E80ec436Df2e9989FBAFa8bB7',
      stakingVault: '0x2F0D6538807a77d4AdDCd4b4DAf214Ea2E818E3D',
      stakingVaultUnderlying: RSR_ADDRESS[ChainId.Base],
      feeRecipient: TOKEN_JAR,
    })
  })

  it('routes ABX through the shared spell into vlALTT, which also takes the fee share', () => {
    expect(getGovernanceUpgradeTarget(ChainId.Base, ABX)).toMatchObject({
      spell: SHARED_BASE_SPELL,
      stakingVault: VL_ALTT,
      stakingVaultUnderlying: ALTT,
      feeRecipient: zeroAddress,
    })
  })

  it('has no target on a chain without the spell', () => {
    expect(getGovernanceUpgradeTarget(42161, LCAP)).toBeUndefined()
  })
})

describe('getMigrationVault', () => {
  it('moves OPEN and ABX holders into their own vaults', () => {
    expect(getMigrationVault(ChainId.Mainnet, OPEN_OLD_VAULT)).toEqual({ address: VL_SQUILL, shared: false })
    expect(getMigrationVault(ChainId.Base, ABX_OLD_VAULT)).toEqual({ address: VL_ALTT, shared: false })
  })

  it('moves every other old vault into the shared vlRSR', () => {
    expect(getMigrationVault(ChainId.Base, '0x45A96cD0E4D89a41eebF3cC4204B00B1cf1582FA')).toEqual({
      address: '0x2F0D6538807a77d4AdDCd4b4DAf214Ea2E818E3D',
      shared: true,
    })
    expect(getMigrationVault(42161, ABX_OLD_VAULT)).toBeUndefined()
  })
})

describe('isOptimisticGovernanceUpgradeEligible', () => {
  it('accepts a legacy 5.0.0 Folio once the singleton vault runs 1.1.0', () => {
    expect(isOptimisticGovernanceUpgradeEligible(legacy)).toBe(true)
  })

  it('accepts a legacy 4.0.0 Folio', () => {
    expect(
      isOptimisticGovernanceUpgradeEligible({ ...legacy, folioVersion: '4.0.0' })
    ).toBe(true)
  })

  it.each(['4.0.1', '6.0.0', undefined])(
    'rejects Folio version %s (the spell only takes exactly 4.0.0 or 5.0.0)',
    (folioVersion) => {
      expect(
        isOptimisticGovernanceUpgradeEligible({ ...legacy, folioVersion })
      ).toBe(false)
    }
  )

  it.each(['1.0.0', undefined])(
    'rejects while the singleton vault is still on %s',
    (stakingVaultVersion) => {
      expect(
        isOptimisticGovernanceUpgradeEligible({ ...legacy, stakingVaultVersion })
      ).toBe(false)
    }
  )

  it('rejects a DTF already on a single (optimistic) governor', () => {
    expect(
      isOptimisticGovernanceUpgradeEligible({
        ...legacy,
        tradingGovernor: legacy.ownerGovernor.toUpperCase().replace('0X', '0x'),
      })
    ).toBe(false)
  })

  it('rejects a DTF without a trading governor', () => {
    expect(
      isOptimisticGovernanceUpgradeEligible({ ...legacy, tradingGovernor: undefined })
    ).toBe(false)
  })

  it('accepts ABX on its ALTT vault and rejects it with an RSR vault', () => {
    const abx = {
      ...legacy,
      dtfAddress: ABX,
      oldVoteLock: ABX_OLD_VAULT,
      oldVoteLockUnderlying: ALTT,
      feeRecipients: [ABX_OLD_VAULT],
    }
    expect(isOptimisticGovernanceUpgradeEligible(abx)).toBe(true)
    expect(
      isOptimisticGovernanceUpgradeEligible({ ...abx, oldVoteLockUnderlying: legacy.oldVoteLockUnderlying })
    ).toBe(false)
  })

  it.each(['deprecated', 'unsupported'] as const)('rejects a %s DTF', (status) => {
    expect(isOptimisticGovernanceUpgradeEligible({ ...legacy, status })).toBe(false)
  })

  it('accepts OPEN on its SQUILL vault', () => {
    expect(isOptimisticGovernanceUpgradeEligible(open)).toBe(true)
  })

  it.each([
    ['an RSR vault, which vlSQUILL cannot take', { oldVoteLockUnderlying: legacy.oldVoteLockUnderlying }],
    ['vlSQUILL already a fee recipient', { feeRecipients: [...open.feeRecipients, VL_SQUILL] }],
  ])('rejects OPEN with %s', (_, change) => {
    expect(isOptimisticGovernanceUpgradeEligible({ ...open, ...change })).toBe(false)
  })

  it('rejects a DTF whose vote-lock vault is not an RSR vault', () => {
    expect(
      isOptimisticGovernanceUpgradeEligible({
        ...legacy,
        oldVoteLockUnderlying: '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b',
      })
    ).toBe(false)
  })

  // Each case mirrors an upgradeFolio require that would otherwise revert after a full vote.
  it.each([
    ['a second Folio admin', { admins: [legacy.ownerTimelock, '0x00000000000000000000000000000000000000bb'] }],
    ['the owner timelock as brand manager', { brandManagers: [legacy.ownerTimelock] }],
    ['the trading timelock as auction launcher', { auctionLaunchers: [legacy.tradingTimelock] }],
    ['a rebalance manager other than the trading timelock', { auctionApprovers: ['0x00000000000000000000000000000000000000cc'] }],
    ['the old vault missing from fee recipients', { feeRecipients: [legacy.feeRecipients[0]] }],
    ['the old vault listed twice', { feeRecipients: [legacy.oldVoteLock, legacy.oldVoteLock.toUpperCase().replace('0X', '0x')] }],
    ['the token jar already a recipient', { feeRecipients: [...legacy.feeRecipients, TOKEN_JAR] }],
    ['a governor as fee recipient', { feeRecipients: [...legacy.feeRecipients, legacy.ownerGovernor] }],
    ['a timelock as fee recipient', { feeRecipients: [...legacy.feeRecipients, legacy.tradingTimelock] }],
  ])('rejects a Folio with %s', (_, change) => {
    expect(isOptimisticGovernanceUpgradeEligible({ ...legacy, ...change })).toBe(false)
  })

  it('rejects a chain without a deployed spell', () => {
    expect(
      isOptimisticGovernanceUpgradeEligible({ ...legacy, chainId: 42161 })
    ).toBe(false)
  })
})

describe('getOldVoteLocks', () => {
  const OLD_VAULT = '0x45A96cD0E4D89a41eebF3cC4204B00B1cf1582FA'
  const OLD_DAO = '0x2DEE428BD8131FAa4288750d707De6F3901AfE3c'
  const SINGLETON = '0x2F0D6538807a77d4AdDCd4b4DAf214Ea2E818E3D'
  const SINGLETON_DAO = '0x00000000000000000000000000000000000000d1'

  const dtf = (
    stToken: { id: string; governance?: { id: string } } | undefined,
    legacyGovernances: { governance: string; voteLock: string; voteLockGovernance?: string }[] = []
  ) =>
    ({
      id: LCAP,
      stToken,
      roles: { admin: { legacyGovernances } },
    }) as unknown as Parameters<typeof getOldVoteLocks>[0]

  it('treats the current vault of a not-yet-migrated DTF as the old vote lock', () => {
    expect(
      getOldVoteLocks(dtf({ id: OLD_VAULT, governance: { id: OLD_DAO } }), ChainId.Base)
    ).toEqual([{ address: OLD_VAULT, governance: OLD_DAO }])
  })

  it('finds the old vault of a migrated DTF through its replaced admin governor', () => {
    expect(
      getOldVoteLocks(
        dtf({ id: SINGLETON, governance: { id: SINGLETON_DAO } }, [
          { governance: legacy.ownerGovernor, voteLock: OLD_VAULT, voteLockGovernance: OLD_DAO },
        ]),
        ChainId.Base
      )
    ).toEqual([{ address: OLD_VAULT, governance: OLD_DAO }])
  })

  it('never returns the singleton and dedupes repeated vaults', () => {
    expect(
      getOldVoteLocks(
        dtf({ id: OLD_VAULT.toLowerCase(), governance: { id: OLD_DAO } }, [
          { governance: legacy.ownerGovernor, voteLock: OLD_VAULT, voteLockGovernance: OLD_DAO },
          { governance: legacy.tradingGovernor, voteLock: SINGLETON },
        ]),
        ChainId.Base
      )
    ).toEqual([{ address: OLD_VAULT, governance: OLD_DAO }])
  })

  it("never returns OPEN's or ABX's own successor vault", () => {
    const migrated = (id: string, successor: string, oldVault: string) =>
      ({ ...dtf({ id: successor }, [{ governance: OLD_DAO, voteLock: oldVault, voteLockGovernance: OLD_DAO }]), id })
    expect(getOldVoteLocks(migrated(OPEN, VL_SQUILL, OPEN_OLD_VAULT), ChainId.Mainnet)).toEqual([
      { address: OPEN_OLD_VAULT, governance: OLD_DAO },
    ])
    expect(getOldVoteLocks(migrated(ABX, VL_ALTT, ABX_OLD_VAULT), ChainId.Base)).toEqual([
      { address: ABX_OLD_VAULT, governance: OLD_DAO },
    ])
  })

  it('returns nothing on a chain without the spell', () => {
    expect(getOldVoteLocks(dtf({ id: OLD_VAULT, governance: { id: OLD_DAO } }), 42161)).toEqual([])
  })
})
