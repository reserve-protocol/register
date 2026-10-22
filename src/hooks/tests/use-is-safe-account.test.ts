import { describe, expect, it } from 'vitest'
import { isSafeAccountCode } from '../use-is-safe-account'

describe('isSafeAccountCode', () => {
  it('treats a deployed contract as a Safe', () => {
    expect(isSafeAccountCode('0x608060405234801561001057600080fd5b50')).toBe(true)
  })

  it.each([undefined, '0x', '0xef01007702cb554e6bfb442cb743a7df23154544a7176c'])(
    'treats %s as a plain wallet',
    (code) => {
      expect(isSafeAccountCode(code)).toBe(false)
    }
  )
})
