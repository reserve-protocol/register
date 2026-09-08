import { expect, test } from '../fixtures/base'

for (const theme of ['light', 'dark']) {
  test(`Issuance stage emphasis and recovery spacing in ${theme}`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(
      (value) => localStorage.setItem('theme-ui-color-mode', value),
      theme
    )
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/internal/design-system/components/transaction-action')
    const manual = page.getByTestId('transaction-composition-atomic')
    const automated = page.getByTestId('transaction-composition-staged')
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 1200 })
      for (const [group, option, current] of [
        [0, 0, 'approvals'],
        [2, 1, 'approvals'],
        [2, 6, 'mint'],
        [3, 0, 'mint'],
        [3, 1, 'mint'],
        [3, 3, 'mint'],
        [1, 5, 'amount'],
      ] as const) {
        await manual
          .getByTestId(
            `transaction-composition-atomic-state-group-${group}-option-${option}`
          )
          .click()
        const task = manual.getByTestId('manual-issuance-task')
        const section = task.getByTestId(`manual-${current}-section`)
        await expect(task.locator('[aria-current="step"]')).toHaveCount(1)
        await expect(section).toHaveAttribute('aria-current', 'step')
        const primaryColor = await task
          .getByTestId('manual-issuance-primary-action')
          .evaluate((el) => getComputedStyle(el).backgroundColor)
        const neutralColor = await task.evaluate(
          (el) => getComputedStyle(el).color
        )
        const amountInput = task.getByRole('textbox')
        if (current === 'amount') {
          await expect(
            task.getByTestId('manual-collateral-balance-notice')
          ).toBeVisible()
          await expect(
            task.getByTestId('manual-issuance-primary-action')
          ).toBeEnabled()
          await expect(
            task.getByTestId('manual-issuance-transaction-action')
          ).toBeDisabled()
        } else {
          await expect(amountInput).toHaveCSS('color', neutralColor)
          if (current === 'approvals') {
            await expect(
              section
                .getByTestId('transaction-amount-object')
                .locator(':scope > div:first-child > p')
            ).toHaveCSS('color', primaryColor)
            await expect(
              section
                .getByTestId('transaction-amount-primary-row')
                .locator('p')
                .first()
            ).toHaveCSS('color', primaryColor)
          } else {
            await expect(section.getByRole('heading')).toHaveCSS(
              'color',
              primaryColor
            )
            await expect(
              section.getByTestId('manual-mint-summary-status')
            ).toHaveCSS('color', primaryColor)
            await expect(
              section.getByTestId('manual-issuance-primary-action')
            ).toHaveAttribute('data-tone', 'primary')
          }
          if (group === 2 && option === 6) {
            const complete = task
              .getByTestId('manual-approval-readiness')
              .getByTestId('transaction-amount-supporting-row')
              .locator('span.inline-flex')
            await expect(complete).toHaveCSS('color', neutralColor)
            const actionBox = (await task
              .getByTestId('manual-issuance-primary-action')
              .boundingBox())!
            const description = (await section
              .getByTestId('manual-mint-summary-description')
              .boundingBox())!
            expect(actionBox.y - description.y - description.height).toBe(24)
          }
          if (group === 3 && option === 3) {
            const message = section.getByTestId('canonical-inline-message')
            const messageBox = (await message.boundingBox())!
            const actionBox = (await task
              .getByTestId('manual-issuance-primary-action')
              .boundingBox())!
            const description = (await section
              .getByTestId('manual-mint-summary-description')
              .boundingBox())!
            expect(messageBox.y - description.y - description.height).toBe(16)
            expect(actionBox.y - messageBox.y - messageBox.height).toBe(8)
          }
        }
        await task.screenshot({
          path: testInfo.outputPath(`manual-${width}-${group}-${option}.png`),
        })
      }
      for (const [group, option, current] of [
        [1, 3, 'collateral'],
        [2, 1, 'collateral'],
        [2, 3, 'mint'],
        [2, 4, 'mint'],
        [2, 2, 'collateral'],
      ] as const) {
        await automated
          .getByTestId(
            `transaction-composition-staged-state-group-${group}-option-${option}`
          )
          .click()
        const task = automated.getByTestId('automated-mint-task')
        await expect(task.locator('[aria-current="step"]')).toHaveCount(1)
        const currentSection = task.getByTestId(
          `automated-mint-${current}-step`
        )
        await expect(currentSection).toHaveAttribute('aria-current', 'step')
        const action = currentSection
          .locator('button[data-tone="primary"]')
          .first()
        const primaryColor = await action.evaluate(
          (el) => getComputedStyle(el).backgroundColor
        )
        const amount = currentSection.getByTestId(
          current === 'mint'
            ? 'automated-mint-output-amount'
            : 'automated-mint-collateral-stage'
        )
        await expect(amount.locator(':scope > div:first-child > p')).toHaveCSS(
          'color',
          primaryColor
        )
        await expect(
          amount
            .getByTestId('transaction-amount-primary-row')
            .locator('p')
            .first()
        ).toHaveCSS('color', primaryColor)
        const complete = task.getByTestId('automated-mint-collateral-complete')
        if (current === 'mint') {
          await expect(complete.locator('svg')).toBeVisible()
          await expect(complete).toHaveCSS(
            'color',
            await task.evaluate((el) => getComputedStyle(el).color)
          )
        } else {
          await expect(complete).toHaveCount(0)
        }
        await task.screenshot({
          path: testInfo.outputPath(
            `automated-${width}-${group}-${option}.png`
          ),
        })
      }
    }
  })
}
