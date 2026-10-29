import { expect, test } from '@playwright/test'

test('tokenized asset example preserves NVIDIA context, provider explanation and risk navigation', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  if (browserName === 'chromium')
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/?path=/docs/components-feedback-and-overlays-dialog--docs')
  const preview = page.frameLocator('#storybook-preview-iframe')
  const opener = preview.getByRole('button', { name: 'NVIDIA', exact: true })
  await opener.click()
  const dialog = preview.getByRole('dialog', { name: 'NVIDIA', exact: true })
  const native = dialog.getByRole('region', {
    name: 'Native asset (reference)',
    exact: true,
  })
  const held = dialog.getByRole('region', {
    name: 'Tokenized Asset (held in basket)',
    exact: true,
  })
  await expect(native.getByText('NASDAQ: $NVDA', { exact: true })).toBeVisible()
  await expect(held.getByText('BNB Smart Chain', { exact: true })).toBeVisible()
  await expect(held.getByTestId('canonical-chain-badge')).toBeVisible()
  await expect(
    held.getByRole('link', { name: /NVIDIA \(Ondo Tokenized\) \(NVDAon\)/ })
  ).toBeVisible()
  await expect(
    dialog.getByText(
      'An Ondo Tokenized Stock is a blockchain token that gives you the same economic exposure as owning the underlying stock or ETF. Please read the documentation for more details.',
      { exact: true }
    )
  ).toBeVisible()
  await dialog.screenshot({
    animations: 'disabled',
    path: test.info().outputPath('tokenized-asset-overview.png'),
  })
  await held
    .getByRole('button', {
      name: 'Copy 0xA9eE28C80f960B889dFbd1902055218cBa016F75 to clipboard',
      exact: true,
    })
    .click()
  await expect(held.getByRole('status')).toHaveText('Copied to clipboard!')
  if (browserName === 'chromium')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      '0xA9eE28C80f960B889dFbd1902055218cBa016F75'
    )
  for (const [name, destination] of [
    ['NVIDIA', 'https://app.ondo.finance/assets/nvdaon'],
    [
      'NVIDIA (Ondo Tokenized) (NVDAon)',
      'https://bscscan.com/token/0xA9eE28C80f960B889dFbd1902055218cBa016F75',
    ],
    ['Read docs', 'https://docs.ondo.finance/'],
  ]) {
    await page.context().route(destination, (route) =>
      route.fulfill({
        contentType: 'text/plain',
        body: 'External navigation test',
      })
    )
    const link = dialog.getByRole('link', {
      name: new RegExp(
        '^' + name.replace(/[()]/g, '\\$&') + ' opens in a new tab$'
      ),
    })
    await expect(link).toHaveAttribute('href', destination)
    const popupPromise = page.waitForEvent('popup')
    await link.click()
    const popup = await popupPromise
    await expect(popup).toHaveURL(destination)
    await popup.close()
  }
  const overview = dialog.getByRole('tab', { name: 'Overview', exact: true })
  const risks = dialog.getByRole('tab', { name: 'Risks', exact: true })
  await dialog
    .getByRole('button', { name: 'Read about risks', exact: true })
    .click()
  await expect(risks).toBeFocused()
  await expect(risks).toHaveAttribute('aria-selected', 'true')
  await expect(dialog.getByRole('link')).toHaveCount(0)
  await expect(dialog.getByRole('listitem')).toHaveCount(5)
  await expect(
    dialog.getByText('Valuation & NAV risks', { exact: true })
  ).toBeVisible()
  await expect(
    dialog.getByRole('button', { name: 'Close dialog', exact: true })
  ).toBeInViewport()
  await dialog.screenshot({
    animations: 'disabled',
    path: test.info().outputPath('tokenized-asset-risks.png'),
  })
  await risks.press('ArrowLeft')
  await expect(overview).toHaveAttribute('aria-selected', 'true')
  await expect(native).toBeVisible()
  await dialog
    .getByRole('button', { name: 'Close dialog', exact: true })
    .click()
  await expect(opener).toBeFocused()
  await opener.click()
  await expect(overview).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Escape')
  await expect(opener).toBeFocused()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(
    '/iframe.html?id=components-feedback-and-overlays-dialog--asset-bridge-information&viewMode=story'
  )
  await page.getByRole('button', { name: 'NVIDIA', exact: true }).click()
  const phoneDialog = page.getByRole('dialog', { name: 'NVIDIA', exact: true })
  await phoneDialog.screenshot({
    animations: 'disabled',
    path: test.info().outputPath('tokenized-asset-phone.png'),
  })
  await phoneDialog
    .getByRole('button', { name: 'Read about risks', exact: true })
    .click()
  await expect(
    phoneDialog.getByRole('button', { name: 'Close dialog', exact: true })
  ).toBeInViewport()
})
