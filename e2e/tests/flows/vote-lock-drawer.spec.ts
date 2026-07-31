/**
 * Index DTF vote-lock drawer — WRITE flow for the shares-based unlock rework
 * (src/components/vote-lock/): unlock now inputs vault SHARES (redeem, not
 * withdraw) and lock shows a real previewDeposit shares-out quote instead of
 * assuming 1:1. See docs/plans/vlrsr-self-appreciating-vaults.md.
 *
 * Fixture: bsc/photon — its stToken (vlRSR) is the registry's ONE
 * self-appreciating vault (rate ~1.0188 underlying per share), so this is the
 * fixture that actually exercises share/asset math instead of a 1:1 vault
 * where the bug would be invisible.
 */
import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  getAddress,
  parseAbi,
  parseUnits,
  type Hex,
} from 'viem'
import { test, expect } from '../../harness'
import { REGISTRY, TEST_ADDRESS } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

const dtf = REGISTRY.find((d) => d.slug === 'photon')!

interface PhotonSnapshot {
  dtf: {
    stToken: {
      id: string
      token: { decimals: number }
      underlying: { address: string; decimals: number }
    }
  }
}
const { dtf: photonData } = loadSnapshot<PhotonSnapshot>(
  `${dtf.snapshotDir}/dtf.json`
)
const VAULT = getAddress(photonData.stToken.id)
const RSR = getAddress(photonData.stToken.underlying.address)
const SHARE_DECIMALS = photonData.stToken.token.decimals
const UNDERLYING_DECIMALS = photonData.stToken.underlying.decimals

const VAULT_ABI = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function convertToAssets(uint256) view returns (uint256)',
  'function previewRedeem(uint256) view returns (uint256)',
  'function previewDeposit(uint256) view returns (uint256)',
  'function maxWithdraw(address) view returns (uint256)',
  'function unstakingDelay() view returns (uint256)',
  'function redeem(uint256,address,address) returns (uint256)',
])
const ERC20_BALANCE_ABI = parseAbi([
  'function balanceOf(address) view returns (uint256)',
])

const ONE_SHARE = parseUnits('1', SHARE_DECIMALS)
const ONE_UNDERLYING = parseUnits('1', UNDERLYING_DECIMALS)

// vlRSR's self-appreciating exchange rate (~1.0188 underlying per share, per
// the plan doc). ONE constant feeds convertToAssets, previewRedeem, AND the
// unlock-tab quote assertion, so the mock and the assertion can't drift apart.
const EXCHANGE_RATE = '1.0188'
const EXCHANGE_RATE_RAW = parseUnits(EXCHANGE_RATE, UNDERLYING_DECIMALS)

// previewDeposit(1 underlying) at the same rate: 1 / 1.0188.
const LOCK_SHARES_OUT = '0.98155'
const LOCK_SHARES_OUT_RAW = parseUnits(LOCK_SHARES_OUT, SHARE_DECIMALS)

function encodeUint(value: bigint): Hex {
  return encodeAbiParameters([{ type: 'uint256' }], [value])
}

// bsc — the wallet must report the fixture's chain or the write path shows
// "Switch network" instead of a submit button.
test.use({ walletChain: 56 })

test('vote-lock drawer: unlock submits redeem() with share-denominated args @smoke', async ({
  harness,
  overrides,
}) => {
  const page = harness.page

  overrides.ethCall(
    VAULT,
    encodeFunctionData({
      abi: VAULT_ABI,
      functionName: 'balanceOf',
      args: [TEST_ADDRESS],
    }),
    encodeUint(parseUnits('1000', SHARE_DECIMALS))
  )
  overrides.ethCall(
    VAULT,
    encodeFunctionData({
      abi: VAULT_ABI,
      functionName: 'convertToAssets',
      args: [ONE_SHARE],
    }),
    encodeUint(EXCHANGE_RATE_RAW)
  )
  // Fires twice for the same shares amount: the governance card's exchange-
  // rate badge (unconditional) AND the unlock tab's quote — same calldata.
  overrides.ethCall(
    VAULT,
    encodeFunctionData({
      abi: VAULT_ABI,
      functionName: 'previewRedeem',
      args: [ONE_SHARE],
    }),
    encodeUint(EXCHANGE_RATE_RAW)
  )
  overrides.ethCall(
    VAULT,
    encodeFunctionData({
      abi: VAULT_ABI,
      functionName: 'maxWithdraw',
      args: [TEST_ADDRESS],
    }),
    encodeUint(parseUnits('1018.8', UNDERLYING_DECIMALS))
  )
  // 14-day delay so the submit button's copy reads "Begin 14-day unlock delay"
  // instead of the central zero default.
  overrides.ethCall(
    VAULT,
    encodeFunctionData({ abi: VAULT_ABI, functionName: 'unstakingDelay' }),
    encodeUint(1_209_600n)
  )

  await harness.chain.freezeAt(Math.floor(Date.now() / 1000))
  await harness.goto(dtf, 'governance')
  await harness.wallet.connect()

  await expect(async () => {
    await harness.chain.advance(4_000)
    await expect(page.getByTestId('vote-lock-open-btn')).toBeVisible()
  }).toPass({ timeout: 20_000 })
  await page.getByTestId('vote-lock-open-btn').click()
  await page.getByTestId('vote-lock-tab-unlock').click()

  await page.getByTestId('vote-unlock-input').fill('1')
  // Pump past the 300ms debounce + react-query's notifyManager flush (a
  // paused clock freezes both) so the previewRedeem quote reaches the DOM.
  await expect(async () => {
    await harness.chain.advance(4_000)
    await expect(page.getByTestId('vote-unlock-output')).toHaveValue(
      EXCHANGE_RATE
    )
  }).toPass({ timeout: 20_000 })

  const submit = page.getByTestId('vote-unlock-submit')
  await expect(async () => {
    await harness.chain.advance(4_000)
    await expect(submit).toBeEnabled()
  }).toPass({ timeout: 20_000 })

  harness.tx.confirm()
  await submit.click()
  await harness.chain.advance(10_000)

  await expect.poll(() => harness.tx.log.length, { timeout: 15_000 }).toBe(1)
  const sent = harness.tx.last()!
  expect(sent.to.toLowerCase()).toBe(VAULT.toLowerCase())
  expect(sent.chainId).toBe(dtf.chainId)
  const decoded = decodeFunctionData({
    abi: VAULT_ABI,
    data: sent.data as Hex,
  })
  expect(decoded.functionName).toBe('redeem')
  expect(decoded.args).toEqual([ONE_SHARE, TEST_ADDRESS, TEST_ADDRESS])
})

test('vote-lock drawer: lock tab shows previewDeposit shares-out quote @smoke', async ({
  harness,
  overrides,
}) => {
  const page = harness.page

  overrides.ethCall(
    VAULT,
    encodeFunctionData({
      abi: VAULT_ABI,
      functionName: 'previewDeposit',
      args: [ONE_UNDERLYING],
    }),
    encodeUint(LOCK_SHARES_OUT_RAW)
  )
  // The governance card's exchange-rate badge fires previewRedeem(1 share)
  // unconditionally for a self-appreciating vault, independent of which tab
  // is open — must be mocked or the page itself fails teardown.
  overrides.ethCall(
    VAULT,
    encodeFunctionData({
      abi: VAULT_ABI,
      functionName: 'previewRedeem',
      args: [ONE_SHARE],
    }),
    encodeUint(EXCHANGE_RATE_RAW)
  )
  overrides.ethCall(
    RSR,
    encodeFunctionData({
      abi: ERC20_BALANCE_ABI,
      functionName: 'balanceOf',
      args: [TEST_ADDRESS],
    }),
    encodeUint(parseUnits('1000', UNDERLYING_DECIMALS))
  )

  await harness.chain.freezeAt(Math.floor(Date.now() / 1000))
  await harness.goto(dtf, 'governance')
  await harness.wallet.connect()

  await expect(async () => {
    await harness.chain.advance(4_000)
    await expect(page.getByTestId('vote-lock-open-btn')).toBeVisible()
  }).toPass({ timeout: 20_000 })
  await page.getByTestId('vote-lock-open-btn').click()
  // Lock is the drawer's default tab; click it explicitly so this doesn't
  // silently start asserting the wrong tab if that default ever changes.
  await page.getByTestId('vote-lock-tab-lock').click()

  await page.getByTestId('vote-lock-input').fill('1')
  await expect(async () => {
    await harness.chain.advance(4_000)
    await expect(page.getByTestId('vote-lock-output')).toHaveValue(
      LOCK_SHARES_OUT
    )
  }).toPass({ timeout: 20_000 })
})
