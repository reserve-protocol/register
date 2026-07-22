import { IndexDTF } from '@/types'
import { formatPercentage } from '@/utils'
import { Address } from 'viem'
import { describe, expect, it } from 'vitest'
import { getFeeRecipients } from '../index-settings-fees'

const DEPLOYER = '0x1111111111111111111111111111111111111111' as Address
const STTOKEN = '0x2222222222222222222222222222222222222222' as Address
const TOKEN_JAR = '0x3333333333333333333333333333333333333333' as Address
const OTHER = '0x4444444444444444444444444444444444444444' as Address

type FeeRecipient = { address: string; percentage: string }

const makeDTF = (recipients: FeeRecipient[], stTokenId?: string): IndexDTF =>
  ({
    deployer: DEPLOYER,
    feeRecipients: recipients,
    stToken: stTokenId ? { id: stTokenId } : undefined,
  }) as unknown as IndexDTF

// With platformFee=50, PERCENT_ADJUST=2, so a contract 80% => displayed 40%.
const PLATFORM_FEE = 50
const adjusted = (pct: number) => formatPercentage(pct / 2)

const find = (recipients: ReturnType<typeof getFeeRecipients>, label: string) =>
  recipients?.find((r) => String(r.label) === label)

describe('getFeeRecipients', () => {
  it('returns undefined when the DTF or platform fee is missing', () => {
    expect(getFeeRecipients(undefined, PLATFORM_FEE, TOKEN_JAR)).toBeUndefined()
    expect(
      getFeeRecipients(makeDTF([], STTOKEN), undefined, TOKEN_JAR)
    ).toBeUndefined()
  })

  it('folds the tokenJar recipient into the Governance Share (new vault)', () => {
    const result = getFeeRecipients(
      makeDTF(
        [
          { address: DEPLOYER, percentage: '20' },
          { address: TOKEN_JAR, percentage: '80' },
        ],
        STTOKEN
      ),
      PLATFORM_FEE,
      TOKEN_JAR
    )

    expect(find(result, 'Governance Share')?.value).toBe(adjusted(80))
    expect(find(result, 'Deployer Share')?.value).toBe(adjusted(20))
    expect(
      result?.filter((r) => String(r.label).startsWith('Other recipient'))
    ).toHaveLength(0)
  })

  it('matches the stToken address as Governance Share (old vault, no tokenJar)', () => {
    const result = getFeeRecipients(
      makeDTF([{ address: STTOKEN, percentage: '80' }], STTOKEN),
      PLATFORM_FEE,
      undefined
    )

    expect(find(result, 'Governance Share')?.value).toBe(adjusted(80))
    expect(
      result?.filter((r) => String(r.label).startsWith('Other recipient'))
    ).toHaveLength(0)
  })

  it('matches the tokenJar address case-insensitively', () => {
    const upperJar = ('0x' + TOKEN_JAR.slice(2).toUpperCase()) as Address
    const result = getFeeRecipients(
      makeDTF([{ address: upperJar, percentage: '80' }], STTOKEN),
      PLATFORM_FEE,
      TOKEN_JAR
    )

    expect(find(result, 'Governance Share')?.value).toBe(adjusted(80))
    expect(
      result?.filter((r) => String(r.label).startsWith('Other recipient'))
    ).toHaveLength(0)
  })

  it('keeps unrelated addresses as Other recipients with their address', () => {
    const result = getFeeRecipients(
      makeDTF([{ address: OTHER, percentage: '80' }], STTOKEN),
      PLATFORM_FEE,
      TOKEN_JAR
    )

    const other = result?.find((r) => r.address === OTHER)
    expect(String(other?.label)).toBe('Other recipient 1')
    expect(other?.value).toBe(adjusted(80))
    expect(find(result, 'Governance Share')?.value).toBe('0%')
  })

  it('defaults Governance and Deployer shares to 0% when no recipient matches', () => {
    const result = getFeeRecipients(
      makeDTF([{ address: OTHER, percentage: '100' }], STTOKEN),
      PLATFORM_FEE,
      TOKEN_JAR
    )

    expect(find(result, 'Governance Share')?.value).toBe('0%')
    expect(find(result, 'Deployer Share')?.value).toBe('0%')
  })

  it('returns undefined (→ Unavailable) for a degenerate platformFee=100', () => {
    // A 100% platform fee is not a displayable split — indeterminate, never fabricated.
    expect(
      getFeeRecipients(
        makeDTF([{ address: STTOKEN, percentage: '80' }], STTOKEN),
        100,
        undefined
      )
    ).toBeUndefined()
  })

  it('returns undefined for a non-finite / out-of-range platformFee', () => {
    const dtf = makeDTF([{ address: STTOKEN, percentage: '80' }], STTOKEN)
    expect(getFeeRecipients(dtf, NaN, undefined)).toBeUndefined()
    expect(getFeeRecipients(dtf, 150, undefined)).toBeUndefined()
    expect(getFeeRecipients(dtf, -1, undefined)).toBeUndefined()
  })
})
