import { expect, test } from '../fixtures/base'

for (const theme of ['light', 'dark']) {
  test(`Manual lifecycle states fit and preserve evidence in ${theme}`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(
      (value) => localStorage.setItem('theme-ui-color-mode', value),
      theme
    )
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(
      '/internal/design-system/components/transaction-action#transaction-composition-atomic'
    )
    const composition = page.getByTestId('transaction-composition-atomic')
    const states = composition.locator(
      '[data-testid^="transaction-composition-atomic-state-group-"][data-testid*="-option-"]'
    )
    await expect(states).toHaveCount(29)
    for (const width of [320, 390, 1024, 1280]) {
      await page.setViewportSize({ width, height: 1000 })
      for (let index = 0; index < (await states.count()); index++) {
        await states.nth(index).click()
        const workspace = page.getByTestId('manual-issuance-workspace')
        await expect(workspace).toBeVisible()
        if (width >= 1024) {
          expect((await workspace.boundingBox())!.height).toBe(736)
        }
        const fits = await workspace.evaluate((root) =>
          [...root.querySelectorAll('section, article, button, input')].every(
            (e) => {
              const r = e.getBoundingClientRect()
              const host = root.getBoundingClientRect()
              return (
                r.left >= host.left - 1 &&
                r.right <= host.right + 1 &&
                (e.tagName === 'BUTTON' ||
                  e.tagName === 'INPUT' ||
                  e.scrollWidth <= e.clientWidth + 1)
              )
            }
          )
        )
        expect(fits, `${width}/${await states.nth(index).textContent()}`).toBe(
          true
        )
        if (width === 320 || width === 1280) {
          const height =
            Math.ceil((await workspace.boundingBox())!.height) + 320
          await page.setViewportSize({ width, height })
          await workspace.scrollIntoViewIfNeeded()
          await workspace.screenshot({
            path: testInfo.outputPath(`manual-${width}-${index}.png`),
          })
          await page.setViewportSize({ width, height: 1000 })
        }
      }
    }
  })
}

test('Manual custom-amount journey retains successful approvals and final recovery', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/transaction-action#transaction-composition-atomic'
  )
  const input = page.getByTestId('manual-issuance-task').getByRole('textbox')
  await input.fill('73.25')
  const action = page.getByTestId('manual-issuance-primary-action')
  const simulate = page.getByTestId('manual-lab-simulator')
  const accept = async () => {
    await simulate.getByTestId('manual-simulate-advance').click()
    await simulate.getByTestId('manual-simulate-advance').click()
  }
  await action.click()
  await accept()
  await expect(action).toHaveText('Retry 1 approval')
  const usdt = page.locator(
    '[data-testid="transaction-requirement-row"][data-token-symbol="USDT"]'
  )
  await usdt.getByTestId('manual-permission-action').click()
  await accept()
  await usdt.getByTestId('manual-permission-action').click()
  await accept()
  await expect(action).toHaveText('Mint 73.25 CMC20')
  await action.click()
  await simulate.getByTestId('manual-simulate-failure').click()
  await expect(input).toHaveValue('73.25')
  await expect(
    page
      .getByTestId('manual-issuance-ledger')
      .getByTestId('lifecycle-status-pill')
  ).toHaveCount(5)
  await action.click()
  await accept()
  await expect(page.getByTestId('manual-issuance-outcome')).toBeVisible()
  await expect(
    page
      .getByTestId('manual-issuance-outcome')
      .getByTestId('transaction-amount-supporting-row')
  ).toHaveText('$7,355.18')
  await page.getByTestId('manual-outcome-view-transaction').click()
  await expect(page.getByTestId('manual-navigation-preview')).toContainText(
    'no on-chain transaction'
  )
  await expect(page.getByTestId('manual-issuance-preview-note')).toContainText(
    'submitted amount'
  )
  await page.getByTestId('manual-outcome-view-dtf').click()
  await expect(page.getByTestId('manual-navigation-preview')).toBeVisible()
  await page.getByTestId('manual-outcome-restart').click()
  await expect(input).toHaveValue('')
})
