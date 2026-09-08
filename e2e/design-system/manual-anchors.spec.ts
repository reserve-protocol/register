import { expect, test } from '../fixtures/base'

test('manual balance warnings do not move asset rows', async ({ page }) => {
  await page.goto(
    '/internal/design-system/components/transaction-action#transaction-composition-atomic'
  )
  const input = page.getByTestId('manual-issuance-task').locator('input')
  await expect(input).toBeVisible()
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  for (const width of [320, 390, 1024, 1280]) {
    await page.setViewportSize({ width, height: 1000 })
    const layouts = []
    for (const amount of ['175', '177', '175']) {
      await input.fill(amount)
      const labelsFit = await page
        .getByTestId('manual-issuance-ledger')
        .evaluate((ledger) =>
          [
            ...ledger.querySelectorAll(
              '[data-testid="transaction-requirement-row"]'
            ),
          ].every((row) => {
            const labels = row.querySelectorAll('dt')
            return (
              labels[0].getBoundingClientRect().right + 8 <=
              labels[1].getBoundingClientRect().left
            )
          })
        )
      expect(labelsFit, `${width}: comparison labels remain separate`).toBe(
        true
      )
      layouts.push(
        await page.getByTestId('manual-issuance-ledger').evaluate((ledger) => {
          const top = ledger.getBoundingClientRect().top
          return [
            ...ledger.querySelectorAll(
              '[data-testid="transaction-requirement-row"]'
            ),
          ].map((row) => {
            const box = row.getBoundingClientRect()
            return { top: box.top - top, height: box.height }
          })
        })
      )
    }
    expect(layouts[1], `${width}: new insufficient balance`).toEqual(layouts[0])
    expect(layouts[2], `${width}: restored amount`).toEqual(layouts[0])
  }
})

for (const theme of ['light', 'dark']) {
  test(`manual anchors preserve their content axes and fit column transitions in ${theme}`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript((value) => {
      localStorage.setItem('theme-ui-color-mode', value)
    }, theme)
    await page.goto(
      '/internal/design-system/components/transaction-action#transaction-composition-atomic'
    )
    const task = page.getByTestId('manual-issuance-task')
    await expect(task).toBeVisible()
    await page.evaluate(() => document.fonts.ready.then(() => undefined))

    for (const width of [320, 390, 639, 640, 1023, 1024, 1183, 1184, 1280]) {
      await page.setViewportSize({ width, height: 1000 })
      for (const mode of [0, 1]) {
        await page
          .getByTestId(
            `transaction-composition-atomic-state-group-0-option-${mode}`
          )
          .click()
        const geometry = await page.evaluate(() => {
          const task = document.querySelector(
            '[data-testid="manual-issuance-task"]'
          )!
          const ledger = document.querySelector(
            '[data-testid="manual-issuance-ledger"]'
          )!
          const rect = (node: Element) => node.getBoundingClientRect()
          const column = document.querySelector(
            '[data-testid="manual-issuance-workspace"]'
          )!.firstElementChild!
          const amount = task.querySelector(
            '[data-testid="transaction-amount-object"]'
          )!
          const action = task.querySelector(
            '[data-testid="manual-issuance-primary-action"]'
          )!
          const setting = task.querySelector(
            '[data-testid="manual-unlimited-setting"]'
          )
          const rows = [
            ...ledger.querySelectorAll(
              '[data-testid="transaction-requirement-row"]'
            ),
          ]
          return {
            columnTop: rect(column).top,
            columnBottom: rect(column).bottom,
            taskBottom: rect(task).bottom,
            ledgerTop: rect(ledger).top,
            ledgerBottom: rect(ledger).bottom,
            taskHeaderInset:
              rect(amount.querySelector('p')!).left - rect(task).left,
            headerGap:
              rect(amount).top -
              rect(task.firstElementChild!).bottom,
            amountTextInset:
              rect(amount.querySelector('input')!).left - rect(task).left,
            amountInset: rect(amount).left - rect(task).left,
            actionInset: rect(action).left - rect(task).left,
            actionGap: rect(action).top - rect(amount).bottom,
            settingGeometry: setting
              ? {
                  above:
                    rect(setting).top -
                    rect(
                      task.querySelector(
                        '[data-testid="manual-approvals-section"] [data-testid="transaction-amount-supporting-row"]'
                      )!
                    ).bottom,
                  below: rect(action).top - rect(setting).bottom,
                  inset: rect(setting).left - rect(task).left,
                  contentFits: [...setting.children].every(
                    (child) =>
                      rect(child).left >= rect(setting).left &&
                      rect(child).right <= rect(setting).right + 1
                  ),
                }
              : null,
            ledgerHeaderInset:
              rect(ledger.querySelector('header')!).left +
              parseFloat(
                getComputedStyle(ledger.querySelector('header')!).paddingLeft
              ) -
              rect(ledger).left,
            identityInset:
              rect(rows[0].firstElementChild!).left - rect(ledger).left,
            rowContentGap:
              rect(rows[1].firstElementChild!).top -
              rect(rows[0].lastElementChild!).bottom,
            primaryTypography: rows.map((row) => {
              const name = row.querySelector(
                '[data-slot="entity-identity-name"]'
              )!
              const values = [...row.querySelectorAll('dd')]
              const primaryValues = row.querySelector('dl.grid')
                ? values
                : values.slice(0, 1)
              return [name, ...primaryValues].map((element) => {
                const style = getComputedStyle(element)
                return {
                  fontSize: style.fontSize,
                  lineHeight: style.lineHeight,
                }
              })
            }),
            overflow: rows.map((row) => row.scrollWidth - row.clientWidth),
            outerOverflow: ledger.scrollWidth - ledger.clientWidth,
            taskOverflow: task.scrollWidth - task.clientWidth,
            logoWidths: rows.map(
              (row) => rect(row.querySelector('img')!).width
            ),
            addressFits: rows.every((row) => {
              const link = row.querySelector('a')!
              return rect(link).right <= rect(link.parentElement!).right + 1
            }),
          }
        })
        expect(geometry.taskHeaderInset, `${width}/${mode} header`).toBe(24)
        if (width >= 1024) {
          expect(geometry.columnTop).toBe(geometry.ledgerTop)
          expect(geometry.columnBottom).toBe(geometry.ledgerBottom)
          expect(geometry.taskBottom).toBeLessThan(geometry.columnBottom)
        } else {
          expect(geometry.columnBottom).toBe(geometry.taskBottom)
          expect(geometry.ledgerTop - geometry.columnBottom).toBe(2)
        }
        expect(geometry.headerGap, `${width}/${mode} tabs to input`).toBe(16)
        expect(geometry.amountTextInset, `${width}/${mode} amount text`).toBe(
          24
        )
        expect(geometry.amountInset).toBe(8)
        expect(geometry.actionInset).toBe(8)
        const alternate = await task
          .getByTestId('manual-zapper-alternative')
          .evaluate((row) => {
            const label = row.querySelector('p')!.getBoundingClientRect()
            const button = row.querySelector('button')!.getBoundingClientRect()
            const card = row.closest('section')!.getBoundingClientRect()
            return {
              left: label.left - card.left,
              right: card.right - button.right,
              labelTop: label.top,
              buttonTop: button.top,
            }
          })
        expect(alternate.left).toBe(24)
        expect(alternate.right).toBe(24)
        if (width === 1280) expect(alternate.buttonTop).toBe(alternate.labelTop)
        if (mode === 0) {
          const checkbox = task.getByTestId('canonical-checkbox')
          const mark = checkbox.getByTestId('canonical-checkbox-mark')
          const slotBox = await checkbox.boundingBox()
          const markBox = await mark.boundingBox()
          expect(slotBox?.width).toBe(28)
          expect(slotBox?.height).toBe(28)
          expect(markBox?.width).toBe(20)
          expect(markBox?.height).toBe(20)
          const setting = task.getByTestId('manual-unlimited-setting')
          const help = setting.locator('button').last()
          const helpBox = await help.boundingBox()
          const settingBox = await setting.boundingBox()
          expect(helpBox).not.toBeNull()
          expect(settingBox).not.toBeNull()
          expect(
            Math.abs(
              helpBox!.x + helpBox!.width - settingBox!.x - settingBox!.width
            )
          ).toBeLessThanOrEqual(1)
          expect(
            Math.abs(
              helpBox!.y +
                helpBox!.height / 2 -
                settingBox!.y -
                settingBox!.height / 2
            )
          ).toBeLessThanOrEqual(1)
          await help.click()
          await expect(page.getByRole('tooltip')).toBeVisible()
          await expect(checkbox).toBeChecked()
          await help.press('Escape')
          await expect(page.getByRole('tooltip')).toBeHidden()
          await checkbox.focus()
          await checkbox.press('Space')
          await expect(checkbox).not.toBeChecked()
          await checkbox.press('Space')
          await expect(checkbox).toBeChecked()
          expect(geometry.settingGeometry).toEqual({
            above: 24,
            below: 16,
            inset: 24,
            contentFits: true,
          })
        } else {
          expect(geometry.settingGeometry).toBeNull()
          expect(geometry.actionGap).toBe(8)
        }
        expect(geometry.ledgerHeaderInset).toBe(24)
        expect(geometry.identityInset).toBe(24)
        expect(geometry.rowContentGap).toBe(24)
        for (const row of geometry.primaryTypography) {
          for (const typography of row) {
            expect(typography).toEqual({ fontSize: '16px', lineHeight: '24px' })
          }
        }
        expect(geometry.outerOverflow).toBeLessThanOrEqual(1)
        expect(geometry.taskOverflow).toBeLessThanOrEqual(1)
        expect(geometry.logoWidths.every((width) => width === 32)).toBe(true)
        expect(
          geometry.addressFits,
          `${width}/${mode} address visibility`
        ).toBe(true)
        expect(
          geometry.overflow.every((value) => value <= 1),
          `${width}/${mode} row overflow`
        ).toBe(true)
        if (width === 390 || width === 1280) {
          await page.getByTestId('manual-issuance-workspace').screenshot({
            path: testInfo.outputPath(`manual-workspace-${width}-${mode}.png`),
          })
          await task.screenshot({
            path: testInfo.outputPath(`manual-task-${width}-${mode}.png`),
          })
          await page.getByTestId('manual-issuance-ledger').screenshot({
            path: testInfo.outputPath(`manual-ledger-${width}-${mode}.png`),
          })
        }
      }
    }
    await page.setViewportSize({ width: 1024, height: 1000 })
    await page
      .getByTestId('transaction-composition-atomic-state-group-0-option-0')
      .click()
    await page.addStyleTag({
      content:
        '[data-testid="manual-issuance-workspace"] { max-width: 800px; }',
    })
    const contained = await page
      .getByTestId('manual-issuance-ledger')
      .evaluate((ledger) =>
        [
          ...ledger.querySelectorAll(
            '[data-testid="transaction-requirement-row"]'
          ),
        ].every((row) => row.scrollWidth <= row.clientWidth + 1)
      )
    expect(
      contained,
      'rows fit the available column, not merely the viewport'
    ).toBe(true)
    await page.addStyleTag({
      content:
        '[data-testid="manual-issuance-workspace"] { max-width: 600px; }',
    })
    const scrollLedger = page.getByTestId('manual-issuance-ledger')
    expect(
      await scrollLedger.evaluate(
        (node) => node.scrollHeight > node.clientHeight
      )
    ).toBe(true)
    const finalRow = scrollLedger
      .getByTestId('transaction-requirement-row')
      .last()
    await finalRow.scrollIntoViewIfNeeded()
    const visibleBottom = await finalRow.evaluate((row) => {
      const ledger = row.closest('section')!
      return (
        row.getBoundingClientRect().bottom <=
        ledger.getBoundingClientRect().bottom
      )
    })
    expect(
      visibleBottom,
      'overflowing ledger remains scrollable to its final asset'
    ).toBe(true)
    await task.locator('input').fill('')
    await expect(task.locator('input')).toHaveValue('')
    await expect(
      page.getByTestId('manual-issuance-primary-action')
    ).toBeDisabled()
    await expect(
      page.getByTestId('manual-issuance-ledger').locator('dd').first()
    ).toHaveText('— WBTC')
    await page.setViewportSize({ width: 320, height: 1000 })
    await page
      .getByTestId('transaction-composition-atomic-state-group-0-option-1')
      .click()
    for (const value of ['124.64', '999999999999.999999']) {
      await task.locator('input').fill(value)
      await expect(
        page.getByTestId('manual-issuance-primary-action')
      ).toBeDisabled()
      const fits = await page
        .getByTestId('manual-issuance-workspace')
        .evaluate((workspace) =>
          [
            workspace,
            ...workspace.querySelectorAll(
              '[data-testid="manual-issuance-task"], [data-testid="transaction-requirement-row"], [data-testid="manual-issuance-primary-action"]'
            ),
          ].every((node) => node.scrollWidth <= node.clientWidth + 1)
        )
      expect(fits, `invalid Redeem amount ${value} stays contained`).toBe(true)
      const labelFitsInset = await page
        .getByTestId('manual-issuance-primary-action')
        .evaluate((button) => {
          const box = button.getBoundingClientRect()
          const style = getComputedStyle(button)
          const range = document.createRange()
          range.selectNodeContents(button)
          return [...range.getClientRects()].every(
            (line) =>
              line.left >= box.left + parseFloat(style.paddingLeft) - 1 &&
              line.right <= box.right - parseFloat(style.paddingRight) + 1
          )
        })
      expect(
        labelFitsInset,
        'primary label respects its internal padding'
      ).toBe(true)
      await task.screenshot({
        path: testInfo.outputPath(`redeem-invalid-${value}.png`),
      })
    }
  })
}
