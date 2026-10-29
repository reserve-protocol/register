import { expect, test } from '@playwright/test'

test('whitepaper example preserves real version links and expandable changes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/?path=/docs/components-feedback-and-overlays-dialog--docs')
  const preview = page.frameLocator('#storybook-preview-iframe')
  const opener = preview.getByRole('button', {
    name: 'Review CFB Whitepaper',
    exact: true,
  })
  await opener.click()
  const dialog = preview.getByRole('dialog', {
    name: 'CFB Token Whitepapers',
    exact: true,
  })
  await expect(
    dialog.getByText('Official documentation for the CFB LCAP token', {
      exact: true,
    })
  ).toBeVisible()
  await expect(
    dialog.getByRole('heading', { name: 'Current Version (v2)', exact: true })
  ).toBeVisible()
  await expect(
    dialog.getByText('Published: October 2025', { exact: true })
  ).toBeVisible()
  await expect(
    dialog.getByText('Original whitepaper documentation', { exact: true })
  ).toBeVisible()
  await expect(dialog.getByRole('button')).toHaveCount(2)
  const summary = dialog.getByRole('button', {
    name: 'Summary of Changes from v1',
    exact: true,
  })
  await expect(summary).toHaveCSS('font-size', '16px')
  await expect(summary).toHaveCSS('line-height', '24px')
  await expect(summary).toHaveCSS('min-height', '48px')
  await expect(summary).toHaveAttribute('aria-expanded', 'false')
  await dialog.screenshot({
    animations: 'disabled',
    path: test.info().outputPath('whitepaper-collapsed.png'),
  })
  await summary.press('Enter')
  await expect(summary).toHaveAttribute('aria-expanded', 'true')
  const changes = dialog.getByRole('list')
  await expect(changes.getByRole('listitem')).toHaveCount(9)
  await dialog.screenshot({
    animations: 'disabled',
    path: test.info().outputPath('whitepaper-expanded.png'),
  })
  const finalChange = changes.getByText(
    'Expanded J.1 to include energy usage data and the sources and methodologies used for its calculation.',
    { exact: false }
  )
  await finalChange.scrollIntoViewIfNeeded()
  await expect(finalChange).toBeInViewport()
  await summary.press('Enter')
  await expect(summary).toHaveAttribute('aria-expanded', 'false')
  await page
    .context()
    .route('https://storage.reserve.org/cfb-whitepaper*.pdf', (route) =>
      route.fulfill({ contentType: 'text/plain', body: 'PDF navigation test' })
    )
  const links = dialog.getByRole('link', { name: /View PDF/ })
  for (const [index, destination] of [
    'https://storage.reserve.org/cfb-whitepaper-v2.pdf',
    'https://storage.reserve.org/cfb-whitepaper.pdf',
  ].entries()) {
    const link = links.nth(index)
    await expect(link).toHaveAttribute('href', destination)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noopener/)
    const popupPromise = page.waitForEvent('popup')
    await link.click()
    const popup = await popupPromise
    await expect(popup).toHaveURL(destination)
    await popup.close()
    await expect(dialog).toBeVisible()
  }
  await dialog
    .getByRole('button', { name: 'Close dialog', exact: true })
    .click()
  await expect(dialog).toBeHidden()
  await expect(opener).toBeFocused()
  await opener.click()
  await expect(summary).toHaveAttribute('aria-expanded', 'false')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(opener).toBeFocused()
})

test('bridge information keeps captured metadata, copy, links and tab navigation', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  if (browserName === 'chromium')
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/?path=/docs/components-feedback-and-overlays-dialog--docs')
  const preview = page.frameLocator('#storybook-preview-iframe')
  const opener = preview.getByRole('button', {
    name: 'BTCB Token',
    exact: true,
  })
  await opener.click()
  const dialog = preview.getByRole('dialog', {
    name: 'BTCB Token',
    exact: true,
  })
  const overview = dialog.getByRole('tab', { name: 'Overview', exact: true })
  const risks = dialog.getByRole('tab', { name: 'Risks', exact: true })
  await expect(overview).toHaveAttribute('aria-selected', 'true')
  await expect(dialog.getByRole('link', { name: /BTCB Token/ })).toBeVisible()
  await dialog.screenshot({
    animations: 'disabled',
    path: test.info().outputPath('bridge-overview.png'),
  })
  await expect(
    dialog.getByText('0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', {
      exact: true,
    })
  ).toHaveCount(1)
  await dialog
    .getByRole('button', {
      name: 'Copy 0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c to clipboard',
      exact: true,
    })
    .click()
  await expect(dialog.getByRole('status')).toHaveText('Copied to clipboard!')
  if (browserName === 'chromium')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c'
    )
  const destinations = [
    ['Bitcoin (BTC)', 'https://coinmarketcap.com/currencies/bitcoin/'],
    [
      'BTCB Token (BTCB)',
      'https://bscscan.com/token/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    ],
    ['Read docs', 'https://www.bnbchain.org/en/bridge'],
  ]
  for (const [name, destination] of destinations) {
    await page.context().route(destination, (route) =>
      route.fulfill({
        contentType: 'text/plain',
        body: 'External navigation test',
      })
    )
    const link = dialog.getByRole('link', {
      name: new RegExp(name.replace(/[()]/g, '\\$&')),
    })
    await expect(link).toHaveAttribute('href', destination)
    const popupPromise = page.waitForEvent('popup')
    await link.click()
    const popup = await popupPromise
    await expect(popup).toHaveURL(destination)
    await popup.close()
  }
  await dialog
    .getByRole('button', { name: 'Read about risks', exact: true })
    .click()
  await expect(risks).toHaveAttribute('aria-selected', 'true')
  await expect(risks).toBeFocused()
  await dialog.screenshot({
    animations: 'disabled',
    path: test.info().outputPath('bridge-risks.png'),
  })
  await expect(
    dialog.getByRole('heading', {
      name: 'Potential Risks Using BSC Bridge',
      exact: true,
    })
  ).toBeVisible()
  await expect(
    dialog.getByText('Bridge operated by Binance', { exact: false })
  ).toBeVisible()
  await risks.press('ArrowLeft')
  await expect(overview).toHaveAttribute('aria-selected', 'true')
  await risks.click()
  await dialog
    .getByRole('button', { name: 'Close dialog', exact: true })
    .click()
  await expect(opener).toBeFocused()
  await opener.click()
  await expect(overview).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})
