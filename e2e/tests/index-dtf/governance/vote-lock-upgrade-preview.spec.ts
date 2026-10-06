import { expect, test } from '../../../fixtures/base'
import { advanceTime, freezeTime, proposalTime } from '../../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../../helpers/registry'
import { loadSnapshot } from '../../../helpers/snapshots'
import { loadEnrichedProposal } from '../../../helpers/subgraph'
import type { MockOverrides } from '../../../helpers/overrides'
import {
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  parseAbi,
  toHex,
  type Address,
} from 'viem'

// A vote-lock 1.0.0 → 1.1.0 upgrade proposal (vault, governor, timelock
// upgradeToAndCall) renders as one decoded card instead of "Unknown Contract",
// and each implementation is checked against the registry's 1.1.0 entry.
const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'
const REGISTRY = '0x0692eCddFe6ad18dBD4BBD7D1ea506e461Eb87aA' as Address
const IMPLS = [
  '0x35051BBE8CC9c47643132fE328a3F0C71819f83a',
  '0x69c6597690B8Df61D15F201519C03725bdec40c1',
  '0x5688198927870968E57e332c77bce33fa0c1B9e1',
] as Address[]
const UNREGISTERED = '0x1111111111111111111111111111111111111111' as Address

const abi = parseAbi([
  'function upgradeToAndCall(address newImplementation, bytes data)',
  'function initializeAverageVotes()',
  'function initializeVersionRegistry(address registry)',
  'function getImplementationsForVersion(bytes32 versionHash) view returns (address, address, address)',
])

const dtf = findDtfByAddress(DTF_ADDRESS)!

type Snapshot = {
  dtf: {
    stToken: { id: Address; governance: { id: Address; timelock: { id: Address } } }
  }
}

function seedUpgradeProposal(overrides: MockOverrides, implementations: Address[]) {
  const { dtf: dtfObj } = loadSnapshot<Snapshot>(`${dtf.snapshotDir}/dtf.json`)
  const { stToken } = dtfObj
  const initRegistry = encodeFunctionData({
    abi,
    functionName: 'initializeVersionRegistry',
    args: [REGISTRY],
  })
  const inits = [encodeFunctionData({ abi, functionName: 'initializeAverageVotes' }), initRegistry, initRegistry]
  const { proposal } = loadEnrichedProposal(PROPOSAL_ID)!
  overrides.subgraph(
    { operationName: 'GetIndexDtfProposal', variables: { proposalId: PROPOSAL_ID } },
    {
      dtf: dtfObj,
      proposal: {
        ...proposal,
        description: 'Upgrade vote-lock governance to 1.1.0 #1',
        targets: [stToken.id, stToken.governance.id, stToken.governance.timelock.id],
        calldatas: implementations.map((implementation, i) =>
          encodeFunctionData({ abi, functionName: 'upgradeToAndCall', args: [implementation, inits[i]] })
        ),
      },
    }
  )
  overrides.ethCall(
    REGISTRY,
    encodeFunctionData({
      abi,
      functionName: 'getImplementationsForVersion',
      args: [keccak256(toHex('1.1.0'))],
    }),
    encodeAbiParameters([{ type: 'address' }, { type: 'address' }, { type: 'address' }], [IMPLS[0], IMPLS[1], IMPLS[2]])
  )
  return proposal as { voteStart: string; voteEnd: string }
}

async function openProposal(page: import('@playwright/test').Page) {
  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await advanceTime(page, 5_000)
  await advanceTime(page, 5_000)
}

test('vote-lock upgrade proposal renders decoded with registered implementations', async ({
  page,
  overrides,
}) => {
  const proposal = seedUpgradeProposal(overrides, IMPLS)
  await freezeTime(page, proposalTime(proposal, 'active'))
  await openProposal(page)

  const card = page.getByTestId('proposal-vote-lock-upgrade')
  await expect(card).toBeVisible()
  await expect(card.locator('a[href*="0x35051"]')).toHaveCount(1)
  await expect(page.getByTestId('proposal-unknown-contract')).toHaveCount(0)
  await expect(page.getByTestId('proposal-vote-lock-upgrade-unregistered')).toHaveCount(0)
})

test('vote-lock upgrade proposal flags an implementation the registry does not list', async ({
  page,
  overrides,
}) => {
  const proposal = seedUpgradeProposal(overrides, [IMPLS[0], UNREGISTERED, IMPLS[2]])
  await freezeTime(page, proposalTime(proposal, 'active'))
  await openProposal(page)

  await expect(page.getByTestId('proposal-vote-lock-upgrade')).toBeVisible()
  await expect(page.getByTestId('proposal-vote-lock-upgrade-unregistered')).toHaveCount(1)
})
