import { decodeFunctionData, getAddress, parseAbi } from 'viem'
import { describe, expect, it } from 'vitest'
import {
  UPGRADE_FOLIO_MESSAGE,
  buildRetireProposal,
  hasLiveRetire,
  hasLiveUpgradeFolio,
  isUnusedDeployVault,
  nextRetireDescription,
  nextUpgradeFolioDescription,
} from '../migration-proposals'

const VAULT = getAddress('0x45a96cd0e4d89a41eebf3cc4204b00b1cf1582fa')
const GOVERNOR = getAddress('0x2dee428bd8131faa4288750d707de6f3901afe3c')
const SPELL = getAddress('0x971c890ACb9EeB084f292996Be667bB9A2889AE9')

const proposal = (description: string, state: string) =>
  ({ description, votingState: { state } }) as never

const callAbi = parseAbi([
  'function transferOwnership(address newOwner)',
  'function retireOldStakingVault(address oldStakingVault)',
])

describe('upgradeFolio proposals', () => {
  it('recognizes titles in descriptions with RFC links and body text', () => {
    const description =
      '# Reserve Optimistic Governor upgrade #3 \n [RFC](https://forum.reserve.org/t/rfc) \n Community-reviewed migration.'
    expect(hasLiveUpgradeFolio([proposal(description, 'ACTIVE')])).toBe(true)
    expect(
      nextUpgradeFolioDescription([proposal(description, 'DEFEATED')])
    ).toBe('Reserve Optimistic Governor upgrade #4')
  })
  it.each(['PENDING', 'ACTIVE', 'SUCCEEDED', 'QUEUED', 'EXECUTED'])(
    'counts a %s upgrade as live',
    (state) => {
      expect(
        hasLiveUpgradeFolio([proposal(`${UPGRADE_FOLIO_MESSAGE} #1`, state)])
      ).toBe(true)
    }
  )

  it.each(['DEFEATED', 'EXPIRED', 'CANCELED'])(
    'lets a %s upgrade be proposed again',
    (state) => {
      const proposals = [proposal(`${UPGRADE_FOLIO_MESSAGE} #1`, state)]
      expect(hasLiveUpgradeFolio(proposals)).toBe(false)
      expect(nextUpgradeFolioDescription(proposals)).toBe(
        `${UPGRADE_FOLIO_MESSAGE} #2`
      )
    }
  )
})

describe('retire proposals', () => {
  it('recognizes Markdown retirement titles and advances their nonce', () => {
    const description = `# Retire legacy vote-lock vault ${VAULT} #2 \n [RFC](https://forum.reserve.org/t/rfc) \n Retire the old vault.`
    expect(hasLiveRetire([proposal(description, 'ACTIVE')], VAULT)).toBe(true)
    expect(
      nextRetireDescription([proposal(description, 'DEFEATED')], VAULT)
    ).toBe(`Retire legacy vote-lock vault ${VAULT} #3`)
  })
  it('numbers retries per vault and only counts live attempts', () => {
    const description = nextRetireDescription([], VAULT)
    expect(description).toBe(`Retire legacy vote-lock vault ${VAULT} #1`)
    const defeated = [proposal(description, 'DEFEATED')]
    expect(hasLiveRetire(defeated, VAULT)).toBe(false)
    expect(nextRetireDescription(defeated, VAULT)).toBe(
      `Retire legacy vote-lock vault ${VAULT} #2`
    )
    expect(hasLiveRetire([proposal(description, 'QUEUED')], VAULT)).toBe(true)
  })

  it('hands the vault to the spell, then retires it, on the vault DAO governor', () => {
    const { address, args } = buildRetireProposal({
      chainId: 8453,
      governor: GOVERNOR,
      voteLock: VAULT,
      spell: SPELL,
      description: 'd',
    })
    const [targets, values, calldatas] = args
    expect(address).toBe(GOVERNOR)
    expect(targets).toEqual([VAULT, SPELL])
    expect(values).toEqual([0n, 0n])
    expect(
      calldatas.map((data) => decodeFunctionData({ abi: callAbi, data }))
    ).toEqual([
      { functionName: 'transferOwnership', args: [SPELL] },
      { functionName: 'retireOldStakingVault', args: [VAULT] },
    ])
  })
})

describe('isUnusedDeployVault', () => {
  it('lists the seed-only deploy vaults of MAG7 and the AI DTFs on each chain', () => {
    expect(
      isUnusedDeployVault(
        8453,
        getAddress('0x9cff81dc5e5de6420e67d4986082158379927f9e')
      )
    ).toBe(true)
    expect(
      isUnusedDeployVault(
        56,
        getAddress('0x24f3248c9e9fc17577c92ffeed1afd15a5ebc80d')
      )
    ).toBe(true)
    expect(
      isUnusedDeployVault(
        1,
        getAddress('0x6d586c6ece79db0a5a3b7fde1e09d59724037769')
      )
    ).toBe(true)
  })

  it('keeps every other vault retirable, and matches on the chain', () => {
    expect(isUnusedDeployVault(8453, VAULT)).toBe(false)
    expect(
      isUnusedDeployVault(
        1,
        getAddress('0x9cff81dc5e5de6420e67d4986082158379927f9e')
      )
    ).toBe(false)
  })
})
