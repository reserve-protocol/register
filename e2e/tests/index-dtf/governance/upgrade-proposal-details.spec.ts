import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  parseAbi,
  toHex,
  zeroAddress,
  zeroHash,
  type Hex,
  type Address,
} from 'viem'
import { connectWallet, expect, test } from '../../../fixtures/wallet'
import { advanceTime, freezeTime, proposalTime } from '../../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../../helpers/registry'
import { loadSnapshot } from '../../../helpers/snapshots'
import { loadEnrichedProposal } from '../../../helpers/subgraph'

const dtf = findDtfByAddress('0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8')!
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'
const PROPOSE_ABI = parseAbi([
  'function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256)',
])
const TITLE = 'Reserve Optimistic Governor upgrade #1'
const DEFAULT_BODY =
  'Migrate this DTF to Reserve Optimistic Governor using the configured successor vote-lock vault. Update governance, roles and the governance fee recipient through the upgrade spell.'
const RFC = 'https://forum.reserve.org/t/upgrade-rfc/12345'
const BODY =
  'Upgrade governance after community review.\n\n## Rationale\nPreserve transparent governance.'

test.beforeEach(async ({ page, overrides }) => {
  const { dtf: snapshot } = loadSnapshot<{
    dtf: {
      stToken: { id: Address }
      ownerGovernance: { id: Address; timelock: { id: Address } }
    }
  }>(`${dtf.snapshotDir}/dtf.json`)
  const abi = parseAbi([
    'function version() view returns (string)',
    'function versionRegistry() view returns (address)',
    'function timelock() view returns (address)',
    'function getLatestVersion() view returns (bytes32, string, address, bool)',
    'function getImplementationsForVersion(bytes32) view returns (address, address, address)',
  ])
  const registry = '0x0692eCddFe6ad18dBD4BBD7D1ea506e461Eb87aA'
  overrides.ethCall(
    snapshot.stToken.id,
    encodeFunctionData({ abi, functionName: 'versionRegistry' }),
    encodeAbiParameters([{ type: 'address' }], [registry])
  )
  overrides.ethCall(
    snapshot.ownerGovernance.id,
    encodeFunctionData({ abi, functionName: 'timelock' }),
    encodeAbiParameters(
      [{ type: 'address' }],
      [snapshot.ownerGovernance.timelock.id]
    )
  )
  overrides.ethCall(
    registry,
    encodeFunctionData({ abi, functionName: 'getLatestVersion' }),
    encodeAbiParameters(
      [
        { type: 'bytes32' },
        { type: 'string' },
        { type: 'address' },
        { type: 'bool' },
      ],
      [zeroHash, '1.0.0', zeroAddress, false]
    )
  )
  overrides.ethCall(
    '0x2F0D6538807a77d4AdDCd4b4DAf214Ea2E818E3D',
    encodeFunctionData({ abi, functionName: 'version' }),
    encodeAbiParameters([{ type: 'string' }], ['1.1.0'])
  )
  overrides.ethCall(
    registry,
    encodeFunctionData({
      abi,
      functionName: 'getImplementationsForVersion',
      args: [keccak256(toHex('1.1.0'))],
    }),
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'address' }, { type: 'address' }],
      [zeroAddress, zeroAddress, zeroAddress]
    )
  )
  const { proposal } = loadEnrichedProposal(PROPOSAL_ID)!
  await freezeTime(
    page,
    proposalTime(proposal as { voteStart: string; voteEnd: string }, 'active')
  )
  await page.goto(dtfPath(dtf, 'governance/propose'))
  await connectWallet(page)
  await advanceTime(page, 5_000)
})

test('upgrade banner opens editable details without submitting; confirmed metadata reaches calldata @mobile', async ({
  page,
  txLog,
}) => {
  const banner = page.getByTestId('governance-optimistic-upgrade')
  await expect(banner).toBeVisible()
  await banner.locator('button').click()
  await advanceTime(page, 1_000)

  expect(txLog).toHaveLength(0)
  const details = page.getByTestId('governance-upgrade-details')
  await expect(details).toBeVisible()
  await expect(details.locator('#title')).toHaveValue(TITLE)
  await expect(details.locator('#rfc')).toHaveValue('')
  const editor = details.locator('textarea')
  await expect(editor).toHaveValue(DEFAULT_BODY)

  await details.locator('#title').fill('')
  const submit = page.getByTestId('governance-upgrade-submit-btn')
  await expect(submit).toBeDisabled()
  await details.locator('#title').fill('Community-reviewed governance upgrade')
  await details.locator('#rfc').fill(RFC)
  await editor.fill(BODY)
  await advanceTime(page, 1_000)
  await expect(submit).toBeEnabled()
  await page.screenshot({
    path: test.info().outputPath('proposal-details.png'),
  })
  await submit.click()
  await advanceTime(page, 5_000)
  await expect.poll(() => txLog.length).toBe(1)

  const snapshot = loadSnapshot<{
    dtf: { id: string; proxyAdmin: string; ownerGovernance: { id: string } }
  }>(`${dtf.snapshotDir}/dtf.json`).dtf
  expect(txLog[0].chainId).toBe(dtf.chainId)
  expect(txLog[0].to).toBe(snapshot.ownerGovernance.id.toLowerCase())
  const decoded = decodeFunctionData({
    abi: PROPOSE_ABI,
    data: txLog[0].data as Hex,
  })
  expect(decoded.functionName).toBe('propose')
  expect(
    decoded.args[0].slice(0, 2).map((address) => address.toLowerCase())
  ).toEqual([snapshot.id.toLowerCase(), snapshot.proxyAdmin.toLowerCase()])
  expect(decoded.args[1]).toEqual([0n, 0n, 0n])
  expect(decoded.args[2]).toHaveLength(3)
  expect(decoded.args[3]).toBe(
    `# Community-reviewed governance upgrade \n [${RFC}](${RFC}) \n ${BODY}`
  )
  await expect(submit).toBeDisabled()
})

test('dismissing upgrade details never sends a transaction and reopening starts a fresh form @mobile', async ({
  page,
  txLog,
}) => {
  const banner = page.getByTestId('governance-optimistic-upgrade')
  await banner.locator('button').click()
  const details = page.getByTestId('governance-upgrade-details')
  await expect(details).toBeVisible()
  await details.locator('#title').fill('Abandoned title')
  await details.locator('#rfc').fill(RFC)
  await details.locator('textarea').fill(BODY)
  await page.keyboard.press('Escape')
  await expect(details).not.toBeVisible()
  await banner.locator('button').click()
  await expect(details.locator('#title')).toHaveValue(TITLE)
  await expect(details.locator('#rfc')).toHaveValue('')
  await expect(details.locator('textarea')).toHaveValue(DEFAULT_BODY)
  await details.locator('button').first().click()
  await expect(details).not.toBeVisible()
  expect(txLog).toHaveLength(0)
})

test('adding only an RFC submits the prefilled name and description @mobile', async ({
  page,
  txLog,
}) => {
  await page
    .getByTestId('governance-optimistic-upgrade')
    .locator('button')
    .click()
  const details = page.getByTestId('governance-upgrade-details')
  await details.locator('#rfc').fill(RFC)
  await page.getByTestId('governance-upgrade-submit-btn').click()
  await advanceTime(page, 5_000)
  await expect.poll(() => txLog.length).toBe(1)
  const decoded = decodeFunctionData({
    abi: PROPOSE_ABI,
    data: txLog[0].data as Hex,
  })
  expect(decoded.args[3]).toBe(
    `# ${TITLE} \n [${RFC}](${RFC}) \n ${DEFAULT_BODY}`
  )
})

test('rejected upgrade submission keeps metadata and allows retry @mobile', async ({
  page,
  overrides,
  txLog,
}) => {
  overrides.transaction({ kind: 'reject' })
  await page
    .getByTestId('governance-optimistic-upgrade')
    .locator('button')
    .click()
  const details = page.getByTestId('governance-upgrade-details')
  await details.locator('#rfc').fill(RFC)
  await details.locator('textarea').fill(BODY)
  const submit = page.getByTestId('governance-upgrade-submit-btn')
  await submit.click()
  await advanceTime(page, 5_000)
  await expect(submit).toBeEnabled()
  expect(txLog).toHaveLength(0)
  await expect(details.locator('#rfc')).toHaveValue(RFC)
  await expect(details.locator('textarea')).toHaveValue(BODY)
  await submit.click()
  await advanceTime(page, 5_000)
  await expect.poll(() => txLog.length).toBe(1)
})
