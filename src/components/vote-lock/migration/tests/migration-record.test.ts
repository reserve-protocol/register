import { afterEach, describe, expect, it } from 'vitest'
import {
  clearMigrationRecord,
  listMigrationTargets,
  migrationRecordKey,
  readMigrationRecord,
  writeMigrationRecord,
} from '../migration-record'

const target = {
  chainId: 8453,
  oldVoteLock: '0xAbC0000000000000000000000000000000000001' as const,
  account: '0xDeF0000000000000000000000000000000000002' as const,
}
const HASH = `0x${'a'.repeat(64)}` as const

afterEach(() => localStorage.clear())

describe('migration record', () => {
  it('is keyed by chain, old vault and account, case-insensitively', () => {
    expect(migrationRecordKey(target)).toBe(
      migrationRecordKey({
        ...target,
        oldVoteLock: target.oldVoteLock.toLowerCase() as `0x${string}`,
        account: target.account.toLowerCase() as `0x${string}`,
      })
    )
    expect(migrationRecordKey(target)).not.toBe(migrationRecordKey({ ...target, chainId: 1 }))
  })

  it('round-trips hashes and the received RSR as a bigint', () => {
    writeMigrationRecord(target, {
      redeem: { hash: HASH, assets: 1250n },
      delegate: target.account,
      locked: 1200n,
    })
    expect(readMigrationRecord(target)).toEqual({
      redeem: { hash: HASH, assets: 1250n },
      delegate: target.account,
      locked: 1200n,
    })
  })

  it('round-trips a pending Safe step with its pre-send baseline', () => {
    writeMigrationRecord(target, {
      pending: { step: 'redeem', hash: HASH, viaSafe: true, baseline: 40n },
      viaSafe: true,
    })
    expect(readMigrationRecord(target)).toEqual({
      pending: { step: 'redeem', hash: HASH, viaSafe: true, baseline: 40n },
      viaSafe: true,
    })
  })

  it('ignores a malformed or foreign value instead of throwing', () => {
    localStorage.setItem(migrationRecordKey(target), '{not json')
    expect(readMigrationRecord(target)).toEqual({})
    localStorage.setItem(migrationRecordKey(target), JSON.stringify({ redeem: { hash: 'nope' } }))
    expect(readMigrationRecord(target)).toEqual({})
  })

  it('clears a record', () => {
    writeMigrationRecord(target, { completed: true })
    clearMigrationRecord(target)
    expect(readMigrationRecord(target)).toEqual({})
  })

  it('lists the vaults this account has a record for, on every chain', () => {
    writeMigrationRecord(target, { completed: true })
    writeMigrationRecord({ ...target, chainId: 56 }, { completed: true })
    writeMigrationRecord(
      { ...target, account: '0x9990000000000000000000000000000000000009' },
      { completed: true }
    )
    localStorage.setItem('unrelated', '1')

    expect(listMigrationTargets(target.account)).toEqual(
      expect.arrayContaining([
        { chainId: 8453, oldVoteLock: target.oldVoteLock.toLowerCase() },
        { chainId: 56, oldVoteLock: target.oldVoteLock.toLowerCase() },
      ])
    )
    expect(listMigrationTargets(target.account)).toHaveLength(2)
  })
})
