import { expect, test } from '../../../fixtures/base'
import { advanceTime, freezeTime, proposalTime } from '../../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../../helpers/registry'
import { loadSnapshot } from '../../../helpers/snapshots'
import { loadEnrichedProposal } from '../../../helpers/subgraph'
import type { MockOverrides } from '../../../helpers/overrides'
import {
  INDEX_DTF_UPGRADE_SPELL_6_0_0_ADDRESS,
  buildIndexDtfUpgradeToV6Calls,
} from '@reserve-protocol/react-sdk'
import { encodeFunctionData, getAddress, zeroAddress, type Address } from 'viem'

// The Folio 5.0.0 → 6.0.0 upgrade proposal renders each call by name: the selector registry
// rotation (optimistic governance only), the ProxyAdmin ownership transfer and the spell cast.
const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'
const REGISTRY = getAddress('0x8ad8f63367b204ed46f2df797baa27b788f522f6')
const SPELL = INDEX_DTF_UPGRADE_SPELL_6_0_0_ADDRESS[8453]

const dtf = findDtfByAddress(DTF_ADDRESS)!

type Snapshot = {
  dtf: {
    proxyAdmin: Address
    ownerGovernance: Record<string, unknown>
    tradingGovernance?: Record<string, unknown>
  }
}

function seedV6UpgradeProposal(overrides: MockOverrides, topology: 'optimistic' | 'legacy') {
  const { dtf: dtfObj } = loadSnapshot<Snapshot>(`${dtf.snapshotDir}/dtf.json`)
  const selectorRegistry = topology === 'optimistic' ? REGISTRY : zeroAddress
  const calls = buildIndexDtfUpgradeToV6Calls({
    chainId: 8453,
    address: DTF_ADDRESS,
    proxyAdmin: getAddress(dtfObj.proxyAdmin),
    spell: SPELL,
    selectorRegistry,
  })
  const governance =
    topology === 'optimistic'
      ? {
          ...dtfObj.ownerGovernance,
          isOptimistic: true,
          optimisticSelectorRegistry: REGISTRY.toLowerCase(),
        }
      : dtfObj.ownerGovernance
  const { proposal } = loadEnrichedProposal(PROPOSAL_ID)!
  overrides.subgraph(
    { operationName: 'GetIndexDtfProposal', variables: { proposalId: PROPOSAL_ID } },
    {
      dtf: { ...dtfObj, ownerGovernance: governance, tradingGovernance: governance },
      proposal: {
        ...proposal,
        description: 'Release 6.0.0 upgrade #1',
        targets: calls.map((call) => call.contract.address.toLowerCase()),
        calldatas: calls.map((call) =>
          encodeFunctionData({
            abi: call.contract.abi,
            functionName: call.contract.functionName,
            args: call.contract.args,
          } as Parameters<typeof encodeFunctionData>[0])
        ),
      },
    }
  )
  return proposal as { voteStart: string; voteEnd: string }
}

async function openProposal(page: import('@playwright/test').Page) {
  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await advanceTime(page, 5_000)
  await advanceTime(page, 5_000)
}

const V6_START_REBALANCE = '0xc1e54b89'
const V5_START_REBALANCE = '0x207c8eed'

const contracts = (page: import('@playwright/test').Page) => page.getByTestId('proposal-contract-changes')

test('optimistic governance: registry rotation, ProxyAdmin transfer and spell cast, in order', async ({
  page,
  overrides,
}) => {
  const proposal = seedV6UpgradeProposal(overrides, 'optimistic')
  await freezeTime(page, proposalTime(proposal, 'active'))
  await openProposal(page)

  const { dtf: dtfObj } = loadSnapshot<Snapshot>(`${dtf.snapshotDir}/dtf.json`)
  const proxyAdmin = getAddress(dtfObj.proxyAdmin)
  await expect(contracts(page)).toHaveCount(3, { timeout: 15_000 })
  await expect(contracts(page).nth(0)).toHaveAttribute('data-contract', REGISTRY.toLowerCase())
  await expect(contracts(page).nth(1)).toHaveAttribute('data-contract', proxyAdmin.toLowerCase())
  await expect(contracts(page).nth(2)).toHaveAttribute('data-contract', SPELL.toLowerCase())

  const registryCalls = contracts(page).nth(0).getByTestId('proposal-selector-registry-call')
  await expect(registryCalls.nth(0)).toHaveAttribute('data-action', 'registerSelectors')
  await expect(registryCalls.nth(0).locator(`[data-selector="${V6_START_REBALANCE}"]`)).toHaveCount(1)
  await expect(registryCalls.nth(1)).toHaveAttribute('data-action', 'unregisterSelectors')
  await expect(registryCalls.nth(1).locator(`[data-selector="${V5_START_REBALANCE}"]`)).toHaveCount(1)

  const transfer = contracts(page).nth(1).getByTestId('proposal-raw-call')
  await expect(transfer).toHaveAttribute('data-function', 'transferOwnership')
  await expect(transfer).toContainText(SPELL)

  const cast = contracts(page).nth(2).getByTestId('proposal-raw-call')
  await expect(cast).toHaveAttribute('data-function', 'cast')
  await expect(cast).toContainText(getAddress(DTF_ADDRESS))
  await expect(cast).toContainText(proxyAdmin)
  await expect(cast).toContainText(REGISTRY)
})

test('legacy governance: ProxyAdmin transfer and a cast with a zero registry, no registry calls', async ({
  page,
  overrides,
}) => {
  const proposal = seedV6UpgradeProposal(overrides, 'legacy')
  await freezeTime(page, proposalTime(proposal, 'active'))
  await openProposal(page)

  const { dtf: dtfObj } = loadSnapshot<Snapshot>(`${dtf.snapshotDir}/dtf.json`)
  const proxyAdmin = getAddress(dtfObj.proxyAdmin)
  await expect(contracts(page)).toHaveCount(2, { timeout: 15_000 })
  await expect(contracts(page).nth(0)).toHaveAttribute('data-contract', proxyAdmin.toLowerCase())
  await expect(contracts(page).nth(1)).toHaveAttribute('data-contract', SPELL.toLowerCase())
  await expect(page.getByTestId('proposal-selector-registry-call')).toHaveCount(0)

  await expect(contracts(page).nth(0).getByTestId('proposal-raw-call')).toHaveAttribute('data-function', 'transferOwnership')
  const cast = contracts(page).nth(1).getByTestId('proposal-raw-call')
  await expect(cast).toHaveAttribute('data-function', 'cast')
  await expect(cast).toContainText(zeroAddress)
})
