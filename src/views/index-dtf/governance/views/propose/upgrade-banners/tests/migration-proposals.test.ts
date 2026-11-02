import { decodeFunctionData, getAddress, parseAbi } from 'viem'
import { describe, expect, it } from 'vitest'
import {
  UPGRADE_FOLIO_MESSAGE,
  buildRetireProposal,
  hasLiveRetire,
  hasLiveUpgradeFolio,
  nextRetireDescription,
  nextUpgradeFolioDescription,
} from '../migration-proposals'

const VAULT = getAddress('0x45a96cd0e4d89a41eebf3cc4204b00b1cf1582fa')
const GOVERNOR = getAddress('0x2dee428bd8131faa4288750d707de6f3901afe3c')
const SPELL = getAddress('0x24a4B37F9c40fB0E80ec436Df2e9989FBAFa8bB7')

const proposal = (description: string, state: string) =>
  ({ description, votingState: { state } }) as never

const callAbi = parseAbi([
  'function transferOwnership(address newOwner)',
  'function retireOldStakingVault(address oldStakingVault)',
])

describe('upgradeFolio proposals', () => {
  it.each(['PENDING', 'ACTIVE', 'SUCCEEDED', 'QUEUED', 'EXECUTED'])(
    'counts a %s upgrade as live',
    (state) => {
      expect(hasLiveUpgradeFolio([proposal(`${UPGRADE_FOLIO_MESSAGE} #1`, state)])).toBe(true)
    }
  )

  it.each(['DEFEATED', 'EXPIRED', 'CANCELED'])('lets a %s upgrade be proposed again', (state) => {
    const proposals = [proposal(`${UPGRADE_FOLIO_MESSAGE} #1`, state)]
    expect(hasLiveUpgradeFolio(proposals)).toBe(false)
    expect(nextUpgradeFolioDescription(proposals)).toBe(`${UPGRADE_FOLIO_MESSAGE} #2`)
  })
})

describe('retire proposals', () => {
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
    expect(calldatas.map((data) => decodeFunctionData({ abi: callAbi, data }))).toEqual([
      { functionName: 'transferOwnership', args: [SPELL] },
      { functionName: 'retireOldStakingVault', args: [VAULT] },
    ])
  })
})
