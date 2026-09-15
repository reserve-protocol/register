import { expect, test } from '../../fixtures/wallet'

// Wallet modal contract on top of the injected Test Wallet: connect through the
// AppKit modal (legal footer present), open the account view, and an explicit
// disconnect must not be undone by AppKit's own reconnect.
test('wallet modal: connect, legal footer, account view, disconnect sticks @mobile', async ({ page }) => {
  await page.goto('/')
  const wallet = page.getByTestId('header-wallet')
  const connectBtn = page.getByTestId('header-connect-btn')
  const disconnect = page.getByRole('button', { name: /disconnect/i })
  const connectTitle = page.getByText('Connect Wallet', { exact: true })

  // The injected test wallet is always authorized, so AppKit usually reconnects
  // it on mount; start from a known disconnected state either way.
  const autoConnected = await expect(wallet)
    .toBeVisible({ timeout: 10_000 })
    .then(() => true, () => false)
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
  await page.getByRole('button', { name: 'Test Wallet' }).click()
  await expect(wallet).toBeVisible()
  await expect(connectTitle).not.toBeVisible()

  await wallet.click()
  await expect(disconnect).toBeVisible()
  await disconnect.click()
  await expect(disconnect).not.toBeVisible()
  await expect(connectBtn).toBeVisible()
  await page.waitForTimeout(5_000)
  await expect(wallet).not.toBeVisible()
  await expect(connectBtn).toBeVisible()
})
