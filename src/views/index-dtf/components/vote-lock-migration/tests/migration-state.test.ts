import { describe, expect, it } from 'vitest'
import { getMigrationStep, isRetiredWithBalance } from '../migration-state'

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
