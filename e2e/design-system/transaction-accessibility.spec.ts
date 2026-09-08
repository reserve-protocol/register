import { expect, test } from '../fixtures/base'

test('Transaction modal keyboard focus stays inside from the initial shell focus', async ({
  page,
}) => {
  await page.goto('/internal/design-system/components/transaction-action')
  for (const family of ['vote-lock', 'stake']) {
    const composition = page.getByTestId(`transaction-composition-${family}`)
    const dialog = composition.getByRole('dialog')
    await dialog.focus()
    await page.keyboard.press('Shift+Tab')
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement)
      )
    ).toBe(true)
    await page.keyboard.press('Tab')
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement)
      )
    ).toBe(true)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    const opener = composition.getByRole('button', {
      name: family === 'stake' ? 'Stake RSR' : 'Vote-lock $RSR',
      exact: true,
    })
    await expect(opener).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(dialog).toBeFocused()
  }
})

test('Transaction committed logos and outcome attachments respect reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/internal/design-system/components/transaction-action')
  for (const [family, group, state] of [
    ['rfq', 0, 4],
    ['vote-lock', 0, 2],
    ['stake', 0, 2],
  ] as const) {
    const composition = page.getByTestId(`transaction-composition-${family}`)
    await composition
      .getByTestId(
        `transaction-composition-${family}-state-group-${group}-option-${state}`
      )
      .click()
    await expect(
      composition.getByTestId('transaction-committed-mode-logo')
    ).toHaveCSS('animation-name', 'none')
  }
  const zapper = page.getByTestId('transaction-composition-rfq')
  await zapper.getByRole('radio', { name: 'Intro call', exact: true }).click()
  await expect(
    zapper.getByTestId('transaction-outcome-attachment-region')
  ).toHaveCSS('animation-name', 'none')
})
