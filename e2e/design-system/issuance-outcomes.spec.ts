import { expect, test } from '../fixtures/base'

test('Automated outcomes expose one final transaction link and a quiet restart', async ({
  page,
}) => {
  await page.goto('/internal/design-system/components/transaction-action')
  await page
    .getByTestId('transaction-composition-staged-state-group-3-option-0')
    .click()
  const explorer = page.getByTestId('automated-mint-view-transaction')
  await expect(
    page.getByTestId('automated-mint-final-transaction')
  ).toHaveCount(0)
  await explorer.focus()
  await expect(explorer).toBeFocused()
  await expect(explorer).toContainText('View transaction')
  await expect(explorer).toHaveAttribute(
    'href',
    'https://basescan.org/tx/0x4b9956225163659ad723853515456526280c1e9cc5b842c3df1b9c7443bb01ae'
  )
  await expect(explorer).toHaveAttribute('target', '_blank')
  await expect(explorer).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(explorer).toHaveAccessibleName(
    'View transaction, Opens Basescan in a new tab'
  )
  await page.keyboard.press('Tab')
  await expect(page.getByTestId('automated-mint-view-dtf')).toBeFocused()
  const restart = page.getByTestId('automated-mint-outcome-restart')
  await expect(restart).toHaveAttribute('data-tone', 'secondary')
  await expect(restart).toHaveAttribute('data-size', 'compact')
  await restart.click()
  await expect(
    page.getByTestId('automated-issuance-operation-mint')
  ).toBeChecked()
  await expect(
    page.getByTestId('automated-issuance-configure-amount').locator('input')
  ).toHaveValue('')
  await expect(page.getByTestId('automated-mint-outcome')).toHaveCount(0)
  await page
    .getByTestId('transaction-composition-staged-state-group-3-option-1')
    .click()
  await page.getByTestId('automated-mint-outcome-restart').click()
  await expect(
    page.getByTestId('automated-issuance-operation-redeem')
  ).toBeChecked()
  await expect(
    page.getByTestId('automated-issuance-configure-amount').locator('input')
  ).toHaveValue('')
})

for (const theme of ['light', 'dark']) {
  test(`Issuance results fill their columns with brand space in ${theme}`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(
      (value) => localStorage.setItem('theme-ui-color-mode', value),
      theme
    )
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/internal/design-system/components/transaction-action')
    for (const width of [1280, 1024, 390, 320]) {
      await page.setViewportSize({ width, height: 1800 })
      for (const [family, prefix, states] of [
        ['staged', 'automated-mint', ['Mint complete', 'Redeem complete']],
        ['atomic', 'manual-issuance', ['Mint outcome', 'Redeem outcome']],
      ] as const) {
        const composition = page.getByTestId(
          `transaction-composition-${family}`
        )
        for (const state of states) {
          const stateIndex = state.startsWith('Mint') ? 0 : 1
          const selector =
            family === 'staged'
              ? `transaction-composition-staged-state-group-3-option-${stateIndex}`
              : `transaction-composition-atomic-state-group-${3 + stateIndex}-option-4`
          await composition.getByTestId(selector).click()
          const outcome = composition.getByTestId(`${prefix}-outcome`)
          const workspace = composition.getByTestId(`${prefix}-workspace`)
          const footer = outcome.locator('button, a').last()
          await expect(outcome).toBeVisible()
          const rect = (await outcome.boundingBox())!
          const action = (await footer.boundingBox())!
          expect(rect.y + rect.height - action.y - action.height).toBeCloseTo(
            8,
            0
          )
          expect(action.height).toBeGreaterThanOrEqual(44)
          const actions = outcome
            .getByTestId(
              family === 'staged'
                ? 'automated-mint-outcome-footer'
                : 'manual-outcome-footer'
            )
            .locator('button, a')
          await expect(actions).toHaveCount(2)
          for (const action of await actions.all()) {
            expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(
              44
            )
          }
          const brand = (await outcome
            .locator('header')
            .locator('..')
            .boundingBox())!
          const supporting = outcome.getByTestId(
            'transaction-amount-supporting-row'
          )
          await expect(supporting).toBeVisible()
          const fiat = (await supporting.boundingBox())!
          expect(brand.y + brand.height - fiat.y - fiat.height).toBeCloseTo(
            24,
            0
          )
          if (width >= 1024) {
            const host = (await workspace.boundingBox())!
            expect(rect.height).toBeCloseTo(host.height, 0)
            expect(brand.height).toBeGreaterThan(256)
          }
          expect(
            await outcome.evaluate((e) => e.scrollWidth <= e.clientWidth)
          ).toBe(true)
          if (family === 'staged') {
            await expect(
              outcome.getByTestId('automated-mint-final-transaction')
            ).toHaveCount(0)
          }
          const restart = outcome.getByTestId(
            family === 'staged'
              ? 'automated-mint-outcome-restart'
              : 'manual-outcome-restart'
          )
          const restartBox = (await restart.boundingBox())!
          const header = (await outcome.locator('header').boundingBox())!
          expect(restartBox.height).toBe(32)
          expect(
            header.x + header.width - restartBox.x - restartBox.width
          ).toBe(16)
          expect(restartBox.y - header.y).toBe(16)
          await outcome.scrollIntoViewIfNeeded()
          await outcome.screenshot({
            path: testInfo.outputPath(`${family}-${state}-${width}.png`),
          })
        }
      }
    }
  })
}
