import { describe, expect, it } from 'vitest'
import {
  chooseDeposit,
  getLockAmount,
  getMigrationStep,
  isRetiredWithBalance,
} from '../migration-state'

const ZERO = '0x0000000000000000000000000000000000000000'
const OWNER = '0xf9D78078CB30f0073A0010193bDB3Df8083bA721'

describe('isRetiredWithBalance', () => {
  it('offers the migration for a retired vault the account still holds', () => {
    expect(isRetiredWithBalance({ owner: ZERO, unstakingDelay: 0n, shares: 1n })).toBe(true)
  })

  it.each([
    ['the vault still has an owner', { owner: OWNER, unstakingDelay: 0n, shares: 1n }],
    ['unstaking is still delayed', { owner: ZERO, unstakingDelay: 604_800n, shares: 1n }],
    ['the account holds no shares', { owner: ZERO, unstakingDelay: 0n, shares: 0n }],
    ['a read is missing', { owner: undefined, unstakingDelay: 0n, shares: 1n }],
  ])('hides it when %s', (_, state) => {
    expect(isRetiredWithBalance(state)).toBe(false)
  })
})

describe('getMigrationStep', () => {
  it('starts by redeeming the old shares', () => {
    expect(getMigrationStep({ redeemedAssets: undefined, allowance: undefined, deposited: false })).toBe('redeem')
  })

  it('asks for approval when the allowance does not cover the redeemed RSR', () => {
    expect(getMigrationStep({ redeemedAssets: 100n, allowance: 99n, deposited: false })).toBe('approve')
  })

  it('skips the approval when the allowance already covers the redeemed RSR', () => {
    expect(getMigrationStep({ redeemedAssets: 100n, allowance: 100n, deposited: false })).toBe('deposit')
  })

  it('waits for the allowance read before choosing between approve and deposit', () => {
    expect(getMigrationStep({ redeemedAssets: 100n, allowance: undefined, deposited: false })).toBe('approve')
  })

  it('finishes once the deposit landed', () => {
    expect(getMigrationStep({ redeemedAssets: 100n, allowance: 0n, deposited: true })).toBe('done')
  })
})

describe('getLockAmount', () => {
  it('locks what the redeem paid out', () => {
    expect(getLockAmount(100n, 150n)).toBe(100n)
  })

  it('never asks for more RSR than the wallet still holds', () => {
    expect(getLockAmount(100n, 40n)).toBe(40n)
  })

  it('is unknown until both reads land', () => {
    expect(getLockAmount(undefined, 40n)).toBeUndefined()
    expect(getLockAmount(100n, undefined)).toBeUndefined()
  })
})

describe('chooseDeposit', () => {
  const ACCOUNT = '0x1111111111111111111111111111111111111111'
  const OLD_DELEGATE = '0x2222222222222222222222222222222222222222'
  const VLRSR_DELEGATE = '0x3333333333333333333333333333333333333333'
  const VLRSR_OPTIMISTIC = '0x4444444444444444444444444444444444444444'

  it('carries the old vault delegate into both vlRSR delegations', () => {
    expect(
      chooseDeposit({ account: ACCOUNT, oldDelegate: OLD_DELEGATE, delegate: ZERO, optimisticDelegate: ZERO })
    ).toEqual({ type: 'depositAndDelegate', delegatee: OLD_DELEGATE, optimisticDelegatee: OLD_DELEGATE })
  })

  it('delegates to the holder when the old vault had no delegate', () => {
    expect(
      chooseDeposit({ account: ACCOUNT, oldDelegate: ZERO, delegate: ZERO, optimisticDelegate: ZERO })
    ).toEqual({ type: 'depositAndDelegate', delegatee: ACCOUNT, optimisticDelegatee: ACCOUNT })
  })

  it('keeps an existing vlRSR delegation untouched', () => {
    expect(
      chooseDeposit({
        account: ACCOUNT,
        oldDelegate: OLD_DELEGATE,
        delegate: VLRSR_DELEGATE,
        optimisticDelegate: VLRSR_OPTIMISTIC,
      })
    ).toEqual({ type: 'deposit' })
  })

  it('fills only the missing vlRSR delegation and keeps the one already set', () => {
    expect(
      chooseDeposit({ account: ACCOUNT, oldDelegate: OLD_DELEGATE, delegate: VLRSR_DELEGATE, optimisticDelegate: ZERO })
    ).toEqual({ type: 'depositAndDelegate', delegatee: VLRSR_DELEGATE, optimisticDelegatee: VLRSR_DELEGATE })
  })
})
