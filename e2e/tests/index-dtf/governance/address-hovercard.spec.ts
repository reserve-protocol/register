import { encodeAbiParameters, getAddress, parseUnits } from 'viem'
import { expect, test } from '../../../fixtures/base'
import { dtfPath, findDtfByAddress } from '../../../helpers/registry'
import { loadSnapshot } from '../../../helpers/snapshots'
import type { MockOverrides } from '../../../helpers/overrides'

// Address hovercard: on-chain governance context for any address in the
// governance section. Profile numbers come from Reserve API
// /v1/portfolio/{address}/governance; roles and voting power from the SDK.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const dtf = findDtfByAddress(DTF_ADDRESS)!
const PROPOSER = '0xb209eed4d80fb47e5c16577e44dad1073c5c5015' // newest snapshot proposal

interface GovernanceSnapshot {
  stakingToken: {
    id: string
    totalDelegates: string
    token: { totalSupply: string }
    delegates: Array<{ address: string; delegatedVotes: string; numberVotes: number }>
  }
}

const profileFor = (address: string, thisDtf: Record<string, number>) => ({
  address: getAddress(address),
  totals: { proposals: 31, executed: 28, defeated: 3, vetoed: 0, canceled: 0, votes: 96 },
  firstActionAt: 1741718929,
  lastActionAt: 1794600803,
  dtfs: [
    {
      chainId: 8453,
      address: DTF_ADDRESS,
      symbol: 'LCAP',
      type: 'index',
      proposals: 0,
      executed: 0,
      defeated: 0,
      vetoed: 0,
      canceled: 0,
      votes: 0,
      votingPowerSince: 1743552000,
      delegators: 0,
      ...thisDtf,
    },
  ],
  truncated: false,
  degradedChains: [],
})

// The card requests the address in whichever casing the surface renders it.
function seedProfile(overrides: MockOverrides, address: string, data: unknown) {
  for (const casing of new Set([address.toLowerCase(), getAddress(address)])) {
    overrides.api({ pathname: `/v1/portfolio/${casing}/governance` }, data)
  }
}

test.beforeEach(async ({ overrides }) => {
  const gov = loadSnapshot<GovernanceSnapshot>(`${dtf.snapshotDir}/governance.json`)
  const st = gov.stakingToken
  overrides.subgraph(
    { operationName: 'GetIndexDtfDelegates' },
    {
      stakingToken: {
        id: st.id,
        totalDelegates: st.totalDelegates,
        currentDelegates: st.totalDelegates,
        totalOptimisticDelegates: '0',
        currentOptimisticDelegates: '0',
        token: { totalSupply: st.token.totalSupply },
        delegates: st.delegates.map((d) => ({
          address: d.address,
          delegatedVotesRaw: parseUnits(d.delegatedVotes, 18).toString(),
          optimisticDelegatedVotesRaw: '0',
          numberVotes: d.numberVotes,
          numberOptimisticVotes: 0,
          hasBeenStandardDelegate: true,
          hasBeenOptimisticDelegate: false,
          tokenHoldersRepresentedAmount: 0,
          optimisticTokenHoldersRepresentedAmount: 0,
        })),
      },
    }
  )
})

test('proposal row hovercard shows the proposer track record and links', async ({
  page,
  overrides,
}) => {
  seedProfile(overrides, PROPOSER, profileFor(PROPOSER, { proposals: 12, executed: 11, defeated: 1, votes: 41 }))
  // A Safe answers getThreshold(); the tag must come from the contract, not a list.
  overrides.ethCall(
    PROPOSER,
    '0xe75235b8',
    encodeAbiParameters([{ type: 'uint256' }], [2n])
  )

  await page.goto(dtfPath(dtf, 'governance'))
  const row = page.getByTestId('proposal-list-item').first()
  await expect(row).toBeVisible()

  await row.getByTestId('address-hovercard-trigger').hover()
  const card = page.getByTestId('address-profile-card')
  await expect(card).toBeVisible()
  await expect(card).toContainText('12')
  await expect(card).toContainText('41')
  await expect(card).toContainText('31')
  await expect(card).toContainText('96')
  await expect(card).toContainText('Safe multisig')
  await expect(card.locator(`a[href="/explorer/governance?proposer=${getAddress(PROPOSER)}&period=all"], a[href="/explorer/governance?proposer=${PROPOSER}&period=all"]`)).toHaveCount(1)
  await expect(card.locator('a[href*="/portfolio?account="]')).toHaveCount(1)
})

test('clicking the proposer opens the hovercard without leaving the list', async ({
  page,
  overrides,
}) => {
  seedProfile(overrides, PROPOSER, profileFor(PROPOSER, { proposals: 1 }))

  await page.goto(dtfPath(dtf, 'governance'))
  const url = page.url()
  await page.getByTestId('proposal-list-item').first().getByTestId('address-hovercard-trigger').click()

  await expect(page.getByTestId('address-profile-card')).toBeVisible()
  expect(page.url()).toBe(url)
})

// The preview that focus opens is out of the tab order; Enter must turn it into a dialog, not close it.
test('keyboard: Enter on a focused proposer opens the profile as a dialog with its links in the tab order', async ({
  page,
  overrides,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'desktop keyboard path')
  seedProfile(overrides, PROPOSER, profileFor(PROPOSER, { proposals: 1 }))

  await page.goto(dtfPath(dtf, 'governance'))
  await page.getByTestId('proposal-list-item').first().getByTestId('address-hovercard-trigger').focus()
  await expect(page.getByTestId('address-profile-card')).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByTestId('address-profile-card')).toBeVisible()

  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(dialog.locator('a[target="_blank"]').first()).toBeFocused()
})

test('delegates table opens the hovercard for a delegate', async ({ page, overrides }) => {
  const gov = loadSnapshot<GovernanceSnapshot>(`${dtf.snapshotDir}/governance.json`)
  const delegate = gov.stakingToken.delegates[0].address
  seedProfile(overrides, delegate, profileFor(delegate, { votes: 7 }))

  await page.goto(dtfPath(dtf, 'governance'))
  const trigger = page.locator('table').getByTestId('address-hovercard-trigger').first()
  await trigger.scrollIntoViewIfNeeded()
  await trigger.hover()

  await expect(page.getByTestId('address-profile-card')).toBeVisible()
})

test('hovering one delegate preloads the rest of the table in one call', async ({
  page,
  overrides,
  boundaryRequests,
}) => {
  const gov = loadSnapshot<GovernanceSnapshot>(`${dtf.snapshotDir}/governance.json`)
  const [first, second] = gov.stakingToken.delegates.map((d) => d.address)
  seedProfile(overrides, first, profileFor(first, { votes: 7 }))
  seedProfile(overrides, second, profileFor(second, { votes: 57 }))
  const profileRequests = () =>
    boundaryRequests.flatMap((request) =>
      request.boundary === 'api' &&
      (request.pathname === '/v1/governance/accounts' || request.pathname.endsWith('/governance'))
        ? request.pathname.toLowerCase()
        : []
    )

  await page.goto(dtfPath(dtf, 'governance'))
  const triggers = page.locator('table').getByTestId('address-hovercard-trigger')
  await triggers.first().scrollIntoViewIfNeeded()
  await triggers.first().hover()
  const card = page.getByTestId('address-profile-card')
  await expect(card).toBeVisible()
  await expect
    .poll(() => profileRequests().sort())
    .toEqual(['/v1/governance/accounts', `/v1/portfolio/${first.toLowerCase()}/governance`])

  await triggers.nth(1).hover()
  await expect(card).toContainText('57')
  expect(profileRequests()).toHaveLength(2)
})

test('tapping a proposer on mobile opens the profile sheet @mobile', async ({
  page,
  overrides,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile tap')
  seedProfile(overrides, PROPOSER, profileFor(PROPOSER, { proposals: 12, executed: 11 }))

  await page.goto(dtfPath(dtf, 'governance'))
  await page.getByTestId('proposal-list-item').first().getByTestId('address-hovercard-trigger').tap()

  const sheet = page.getByRole('dialog')
  await expect(sheet.getByTestId('address-profile-card')).toBeVisible()
  await expect(sheet).toContainText('12')
})

test('explorer filters proposals by the proposer in the URL', async ({ page }) => {
  await page.goto(`/explorer/governance?proposer=${PROPOSER}`)
  const chip = page.getByTestId('explorer-proposer-filter')
  await expect(chip).toBeVisible()

  await chip.getByRole('button').click()
  await expect(chip).toHaveCount(0)
  await expect(page).not.toHaveURL(/proposer=/)
})
