import { expect, test } from '../fixtures/base'

for (const [locale, expected] of [
  [
    'es',
    ['Se requieren aprobaciones', 'Listo para hacer Mint', 'Mint en curso'],
  ],
  ['ko', ['승인 필요', 'Mint 준비됨', 'Mint 진행 중']],
  ['zh', ['需要批准', '可 Mint', 'Mint 进行中']],
] as const) {
  test(`Manual readiness summary fits translated ${locale} copy`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript((value) => {
      localStorage.setItem('register.locale', JSON.stringify(value))
      localStorage.setItem('theme-ui-color-mode', 'light')
    }, locale)
    await page.goto('/internal/design-system/components/transaction-action')
    for (const width of [320, 1024]) {
      await page.setViewportSize({ width, height: 1000 })
      for (const [index, [group, option]] of [
        [0, 0],
        [2, 6],
        [3, 0],
      ].entries()) {
        await page
          .getByTestId(
            `transaction-composition-atomic-state-group-${group}-option-${option}`
          )
          .click()
        const summary = page.getByTestId('manual-mint-summary')
        const status = summary.getByTestId('manual-mint-summary-status')
        await expect(status).toHaveText(expected[index])
        for (const element of [
          summary,
          status,
          summary.getByTestId('manual-mint-summary-description'),
        ]) {
          expect(
            await element.evaluate((el) => el.scrollWidth - el.clientWidth)
          ).toBeLessThanOrEqual(1)
        }
        const box = (await summary.boundingBox())!
        const task = (await page
          .getByTestId('manual-issuance-task')
          .boundingBox())!
        expect(box.x).toBeGreaterThanOrEqual(task.x)
        expect(box.x + box.width).toBeLessThanOrEqual(task.x + task.width)
        await summary.screenshot({
          path: testInfo.outputPath(`${locale}-${width}-${index}.png`),
        })
      }
    }
  })
}

test('Manual Mint shares section geometry without duplicating the final amount or status', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/transaction-action#transaction-composition-atomic'
  )
  await page
    .getByTestId('transaction-composition-staged-state-group-1-option-3')
    .click()
  for (const width of [320, 359, 360, 390, 639, 640, 1024, 1280]) {
    await page.setViewportSize({ width, height: 1000 })
    await page
      .getByTestId('transaction-composition-atomic-state-group-0-option-0')
      .click()
    const task = page.getByTestId('manual-issuance-task')
    if (width >= 1024) {
      const manualHost = (await page
        .getByTestId('manual-issuance-workspace')
        .boundingBox())!
      const automatedHost = (await page
        .getByTestId('automated-mint-workspace')
        .boundingBox())!
      expect(manualHost.width).toBe(automatedHost.width)
      expect(manualHost.height).toBe(automatedHost.height)
    }
    const approvals = task.getByTestId('manual-approvals-section')
    const mint = task.getByTestId('manual-mint-section')
    await expect(mint.locator('button')).toBeDisabled()
    await expect(
      task
        .getByTestId('manual-amount-section')
        .getByTestId('manual-switch-zapper')
    ).toBeVisible()
    const taskBox = (await task.boundingBox())!
    const summaries = task.getByTestId('transaction-amount-object')
    await expect(summaries).toHaveCount(2)
    const hierarchy = await summaries.evaluateAll((elements) =>
      elements.map((element) => {
        const label = element.firstElementChild!.querySelector('p')!
        const primary = element.querySelector(
          '[data-testid="transaction-amount-primary-row"]'
        )!.firstElementChild!
        const style = (el: Element) => {
          const s = getComputedStyle(el)
          return [s.fontSize, s.lineHeight, s.fontWeight]
        }
        return {
          label: style(label),
          primary: style(primary),
          labelGap:
            primary.getBoundingClientRect().top -
            label.getBoundingClientRect().bottom,
        }
      })
    )
    expect(hierarchy[1]).toEqual(hierarchy[0])
    const mintHierarchy = await mint.evaluate((element) => {
      const label = element.querySelector('h3')!
      const primary = element.querySelector(
        '[data-testid="manual-mint-summary-status"]'
      )!
      const style = (el: Element) => {
        const s = getComputedStyle(el)
        return [s.fontSize, s.lineHeight, s.fontWeight]
      }
      return {
        label: style(label),
        primary: style(primary),
        labelGap:
          primary.getBoundingClientRect().top -
          label.getBoundingClientRect().bottom,
      }
    })
    expect(mintHierarchy, `${width}: matching step headline geometry`).toEqual(
      hierarchy[1]
    )
    await expect(mint.getByTestId('manual-mint-prerequisite')).toHaveCount(0)
    const finalAction = (await mint.locator('button').boundingBox())!
    const description = (await mint
      .getByTestId('manual-mint-summary-description')
      .boundingBox())!
    expect(finalAction.y - description.y - description.height).toBe(24)
    for (const section of [approvals, mint]) {
      const box = (await section.boundingBox())!
      if (section === approvals) {
        const label = (await section
          .getByTestId('transaction-amount-object')
          .locator(':scope > div')
          .first()
          .boundingBox())!
        expect(label.x - box.x).toBe(24)
        expect(label.y - box.y).toBe(24)
      } else {
        const label = (await section.getByRole('heading').boundingBox())!
        expect(label.x - box.x).toBe(24)
        expect(label.y - box.y).toBe(24)
      }
      const action = (await section
        .locator('[data-testid^="manual-issuance-"]')
        .boundingBox())!
      expect(box.x).toBe(taskBox.x)
      expect(box.width).toBe(taskBox.width)
      expect(action.x - box.x).toBe(8)
      expect(box.x + box.width - action.x - action.width).toBe(8)
      expect(box.y + box.height - action.y - action.height).toBe(
        section === approvals ? 24 : 8
      )
    }
    const boundaries = task.getByTestId('manual-mint-stage-boundary')
    await expect(boundaries).toHaveCount(2)
    for (const boundary of await boundaries.all()) {
      const line = (await boundary.boundingBox())!
      const circle = (await boundary.locator('span').first().boundingBox())!
      expect(line.x).toBe(taskBox.x)
      expect(line.width).toBe(taskBox.width)
      expect(line.height).toBe(2)
      expect(circle.width).toBe(36)
      expect(circle.x + circle.width / 2).toBeCloseTo(
        line.x + line.width / 2,
        0
      )
      expect(circle.y + circle.height / 2).toBeCloseTo(
        line.y + line.height / 2,
        0
      )
    }
    const circle = (await boundaries
      .nth(1)
      .locator('span')
      .first()
      .boundingBox())!
    const approvalAction = (await approvals
      .locator('[data-testid^="manual-issuance-"]')
      .boundingBox())!
    expect(
      circle.y - approvalAction.y - approvalAction.height
    ).toBeGreaterThanOrEqual(6)
    expect(finalAction.y - circle.y - circle.height).toBeGreaterThanOrEqual(6)
    await page
      .getByTestId('transaction-composition-atomic-state-group-2-option-6')
      .click()
    await expect(mint.locator('button')).toBeEnabled()
    await expect(approvals.getByRole('button')).toHaveCount(0)
    await expect(mint.getByTestId('manual-mint-prerequisite')).toHaveCount(0)
    const readyHeight = (await mint.boundingBox())!.height
    const readyAction = (await mint.locator('button').boundingBox())!
    const readyDescription = (await mint
      .getByTestId('manual-mint-summary-description')
      .boundingBox())!
    expect(readyAction.y - readyDescription.y - readyDescription.height).toBe(
      24
    )
    for (const state of [0, 1]) {
      await page
        .getByTestId(
          `transaction-composition-atomic-state-group-3-option-${state}`
        )
        .click()
      expect((await mint.boundingBox())!.height).toBe(readyHeight)
      await expect(mint.getByTestId('manual-mint-prerequisite')).toHaveCount(0)
      await expect(
        mint.getByTestId('transaction-amount-primary-row')
      ).toHaveCount(0)
    }
    await page
      .getByTestId('transaction-composition-atomic-state-group-0-option-1')
      .click()
    await expect(approvals).toHaveCount(0)
  }
})

test('Manual compact rows retain identity and action relationships', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/transaction-action#transaction-composition-atomic'
  )
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const mode of [0, 1]) {
      await page
        .getByTestId(
          `transaction-composition-atomic-state-group-0-option-${mode}`
        )
        .click()
      const ledger = page.getByTestId('manual-issuance-ledger')
      for (const row of await ledger
        .getByTestId('transaction-requirement-row')
        .all()) {
        const identity = (await row
          .getByTestId('canonical-entity-identity')
          .boundingBox())!
        const trailing = (await (
          mode === 0
            ? row.getByTestId('manual-asset-permission')
            : row.locator('dl')
        ).boundingBox())!
        expect(trailing.y).toBeLessThan(identity.y + identity.height)
        expect(identity.x + identity.width).toBeLessThanOrEqual(trailing.x)
        await expect(row.locator('a')).toHaveAccessibleName(
          /0x.*opens in a new tab/
        )
        expect(
          await row
            .locator('a > span[aria-hidden="true"]')
            .evaluate((label) => label.scrollWidth <= label.clientWidth)
        ).toBe(true)
      }
    }
    await page.getByTestId('manual-switch-zapper').click()
    await expect(page.getByTestId('manual-zapper-preview')).toBeVisible()
    await expect(page.getByTestId('manual-zapper-preview')).toContainText(
      'No swap is executed'
    )
  }
})

test('Manual permission transitions preserve mobile row geometry', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(
    '/internal/design-system/components/transaction-action#transaction-composition-atomic'
  )
  for (const width of [320, 360, 375, 390, 430, 640, 1024]) {
    await page.setViewportSize({ width, height: 844 })
    await page
      .getByTestId('transaction-composition-atomic-state-group-0-option-1')
      .click()
    await page
      .getByTestId('transaction-composition-atomic-state-group-0-option-0')
      .click()
    const ledger = page.getByTestId('manual-issuance-ledger')
    const geometry = () =>
      ledger.evaluate((root) => {
        const top = root.getBoundingClientRect().top
        return [
          ...root.querySelectorAll(
            '[data-testid="transaction-requirement-row"]'
          ),
        ].map((row) => {
          const r = row.getBoundingClientRect()
          const comparison = row
            .querySelector('dl.grid')!
            .getBoundingClientRect()
          return {
            top: r.top - top,
            height: r.height,
            comparisonTop: comparison.top - r.top,
          }
        })
      })
    await expect(ledger).toBeVisible()
    await page.evaluate(() => document.fonts.ready.then(() => undefined))
    const before = await geometry()
    const weth = ledger.locator('[data-token-symbol="WETH"]')
    await weth.getByTestId('manual-permission-action').click()
    expect(await geometry(), `${width}: signing`).toEqual(before)
    await page.getByTestId('manual-simulate-advance').click()
    expect(await geometry(), `${width}: confirming`).toEqual(before)
    await page.getByTestId('manual-simulate-advance').click()
    expect(await geometry(), `${width}: approved`).toEqual(before)
    if (width === 320 || width === 390) {
      await page.setViewportSize({ width, height: 2200 })
      await ledger.screenshot({
        path: testInfo.outputPath(`manual-mobile-${width}.png`),
      })
    }
  }
})

test('Manual mobile controls and help remain reachable in short viewports', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/transaction-action#transaction-composition-atomic'
  )
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 440 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport)
    await page
      .getByTestId('transaction-composition-atomic-state-group-0-option-0')
      .click()
    const task = page.getByTestId('manual-issuance-task')
    const input = task.locator('input')
    await input.fill('73.25')
    await expect(input).toHaveAttribute('inputmode', 'decimal')
    await expect(input).toHaveValue('73.25')
    const help = task
      .getByTestId('manual-unlimited-setting')
      .locator('button')
      .last()
    await help.click()
    const tooltip = page.getByRole('tooltip')
    await expect(tooltip).toBeVisible()
    const box = await tooltip.boundingBox()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width)
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height)
    await help.press('Escape')
    const ledger = page.getByTestId('manual-issuance-ledger')
    const lastRow = ledger.getByTestId('transaction-requirement-row').last()
    await lastRow.scrollIntoViewIfNeeded()
    await expect(lastRow).toBeInViewport()
    const action = task.getByTestId('manual-issuance-primary-action')
    await action.scrollIntoViewIfNeeded()
    await expect(action).toBeInViewport()
    await action.click({ trial: true })
    await page
      .getByTestId('transaction-composition-atomic-state-group-0-option-1')
      .click()
    await expect(task.locator('input')).toHaveValue('73.25')
    await task
      .getByTestId('manual-issuance-primary-action')
      .click({ trial: true })
  }
})

test('Manual readiness preserves the setting value and compacts completed content', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(
    '/internal/design-system/components/transaction-action#transaction-composition-atomic'
  )
  for (const width of [320, 390, 1024, 1280]) {
    await page.setViewportSize({ width, height: 1000 })
    await page
      .getByTestId('transaction-composition-atomic-state-group-0-option-1')
      .click()
    await page
      .getByTestId('transaction-composition-atomic-state-group-0-option-0')
      .click()
    const task = page.getByTestId('manual-issuance-task')
    await task.locator('input').fill('73.25')
    await task.getByRole('checkbox').uncheck()
    const action = task.getByTestId('manual-issuance-primary-action')
    const advance = page.getByTestId('manual-simulate-advance')
    await action.click()
    await advance.click()
    await advance.click()
    const usdt = page.locator(
      '[data-testid="transaction-requirement-row"][data-token-symbol="USDT"]'
    )
    await usdt.getByTestId('manual-permission-action').click()
    await advance.click()
    await advance.click()
    await usdt.getByTestId('manual-permission-action').click()
    await advance.click()
    const actionOffset = () =>
      task.evaluate(
        (root) =>
          root
            .querySelector(
              '[data-testid="manual-mint-section"] [data-testid^="manual-issuance-"]'
            )!
            .getBoundingClientRect().top - root.getBoundingClientRect().top
      )
    const before = await actionOffset()
    const approvalHeight = (await task
      .getByTestId('manual-approvals-section')
      .boundingBox())!.height
    await advance.click()
    await expect(task.getByTestId('manual-approval-readiness')).toBeVisible()
    await expect(task.getByRole('checkbox')).toHaveCount(0)
    expect(
      await actionOffset(),
      `${width}: completed section compacts`
    ).toBeLessThan(before)
    const completedSection = task.getByTestId('manual-approvals-section')
    expect((await completedSection.boundingBox())!.height).toBeLessThan(
      approvalHeight
    )
    expect(await completedSection.locator('.invisible').count()).toBe(0)
    const completion = (await task
      .getByTestId('manual-approval-readiness')
      .getByTestId('transaction-amount-supporting-row')
      .boundingBox())!
    const sectionBox = (await completedSection.boundingBox())!
    expect(
      sectionBox.y + sectionBox.height - completion.y - completion.height
    ).toBe(24)
    await task.locator('input').fill('177')
    await expect(task.getByRole('checkbox')).not.toBeChecked()
    await expect(task.getByTestId('manual-approval-readiness')).toHaveCount(0)
  }
})
