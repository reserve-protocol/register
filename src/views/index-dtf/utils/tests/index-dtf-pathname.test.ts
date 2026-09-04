import { describe, expect, it } from 'vitest'
import { isIndexDtfOverviewPathname } from '../index-dtf-pathname'

describe('isIndexDtfOverviewPathname', () => {
  it('matches the overview route with or without a trailing slash', () => {
    expect(isIndexDtfOverviewPathname('/base/index-dtf/mag7/overview')).toBe(
      true
    )
    expect(isIndexDtfOverviewPathname('/base/index-dtf/mag7/overview/')).toBe(
      true
    )
    expect(
      isIndexDtfOverviewPathname(
        '/bsc/index-dtf/0xd7ce7a841310982acd976d1a6fe7bb6063c5689d/Overview'
      )
    ).toBe(true)
  })

  it('rejects other DTF pages and non-DTF routes', () => {
    expect(isIndexDtfOverviewPathname('/base/index-dtf/mag7/governance')).toBe(
      false
    )
    expect(isIndexDtfOverviewPathname('/base/index-dtf/mag7')).toBe(false)
    expect(isIndexDtfOverviewPathname('/base/yield-dtf/eusd/overview')).toBe(
      false
    )
    expect(isIndexDtfOverviewPathname('/discover')).toBe(false)
  })
})
