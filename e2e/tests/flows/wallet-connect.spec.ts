import {
  encodeFunctionData,
  encodeFunctionResult,
  parseAbi,
  zeroAddress,
} from 'viem'
import { mainnet } from 'viem/chains'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { TEST_ADDRESS } from '../../helpers/registry'

// Wallet modal contract on top of the injected Test Wallet: connect through the
// AppKit modal (legal footer present), open the account view, and an explicit
// disconnect must not be undone by AppKit's own reconnect.
test('wallet modal: connect, legal footer, account view, disconnect sticks @mobile', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  const wallet = page.getByTestId('header-wallet')
  const connectBtn = page.getByTestId('header-connect-btn')
  const disconnect = page.getByRole('button', { name: /disconnect/i })
  const connectTitle = page.getByText('Connect Wallet', { exact: true })

  // The injected test wallet is always authorized, so AppKit usually reconnects
  // it on mount; start from a known disconnected state either way.
  const autoConnected = await expect(wallet)
    .toBeVisible({ timeout: 10_000 })
    .then(
      () => true,
      () => false
    )
  if (autoConnected) {
    await wallet.click()
    await disconnect.click()
    await expect(disconnect).not.toBeVisible()
    await expect(connectBtn).toBeVisible()
  }

  await connectBtn.click()
  await expect(connectTitle).toBeVisible()
  await expect(page.getByText('By connecting your wallet')).toBeVisible()
  await expect(page.getByText('Terms of Service')).toBeVisible()
  await expect(page.getByText('Privacy Policy')).toBeVisible()
  await expect(page.getByTestId('wallet-selector-safe')).toHaveCount(0)
  await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Continue with Google' })
  ).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('wallet-connect.png') })
  await page.getByRole('button', { name: 'Test Wallet' }).click()
  await expect(wallet).toBeVisible()
  await expect(connectTitle).not.toBeVisible()

  await wallet.click()
  await expect(disconnect).toBeVisible()
  for (const name of ['Fund wallet', 'Swap', 'Send', 'Activity']) {
    await expect(
      page.getByRole('alertdialog').getByRole('button', { name, exact: true })
    ).toBeVisible()
  }
  await page.screenshot({ path: testInfo.outputPath('wallet-account.png') })
  await disconnect.click()
  await expect(disconnect).not.toBeVisible()
  await expect(connectBtn).toBeVisible()
  await page.waitForTimeout(5_000)
  await expect(wallet).not.toBeVisible()
  await expect(connectBtn).toBeVisible()
})

const reverseResolverAbi = parseAbi([
  'function reverseWithGateways(bytes reverseName, uint256 coinType, string[] gateways) view returns (string resolvedName, address resolver, address reverseResolver)',
])

for (const { name, expected, clipped } of [
  { name: '', expected: '0xf3…2266', clipped: false },
  { name: 'register.eth', expected: 'register.eth', clipped: true },
  {
    name: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijk.eth',
    expected: 'abcdefghijklmnopqrstuvwx...',
    clipped: true,
  },
]) {
  test(`wallet header: ${name || 'plain address'} stays within the viewport @mobile`, async ({
    page,
    overrides,
  }, testInfo) => {
    overrides.ethCall(
      mainnet.contracts.ensUniversalResolver.address,
      encodeFunctionData({
        abi: reverseResolverAbi,
        functionName: 'reverseWithGateways',
        args: [TEST_ADDRESS, 60n, ['x-batch-gateway:true']],
      }),
      encodeFunctionResult({
        abi: reverseResolverAbi,
        functionName: 'reverseWithGateways',
        result: [name, zeroAddress, zeroAddress],
      })
    )

    await page.goto('/')
    await connectWallet(page)
    const wallet = page.getByTestId('header-wallet')
    const label = wallet.locator('span:visible')
    await expect(label).toHaveText(expected)
    // ENS names may truncate with an ellipsis on narrow headers; addresses must render whole.
    if (!clipped) {
      expect(await label.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(false)
    }
    const viewport = page.viewportSize()!
    const widths =
      testInfo.project.name === 'mobile'
        ? [viewport.width, 360]
        : [viewport.width]
    for (const width of widths) {
      await page.setViewportSize({ width, height: viewport.height })
      const bounds = await wallet.boundingBox()
      expect(bounds).not.toBeNull()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
      if (testInfo.project.name === 'mobile') {
        const navigation = await page
          .getByTestId('header-navigation-toggle')
          .boundingBox()
        expect(navigation).not.toBeNull()
        expect(navigation!.x + navigation!.width).toBeLessThanOrEqual(width)
      }
      await page.screenshot({
        path: testInfo.outputPath(`wallet-header-${width}.png`),
      })
    }
  })
}
