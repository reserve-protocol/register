import { expect, test } from '@playwright/test'

const story = (id: string, args = '') =>
  `/iframe.html?id=${id}&viewMode=story${args ? `&args=${args}` : ''}`

test('Docs exact-entry example moves its thumb with the displayed value', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(
    '/iframe.html?id=components-fields-and-selection-slider--docs&viewMode=docs'
  )
  const example = page.locator(
    '#story--components-fields-and-selection-slider--exact-entry-inner'
  )
  const input = example.getByRole('spinbutton', { name: 'Rebalance Percent' })
  const slider = example.getByRole('slider', { name: 'Rebalance Percent' })
  await slider.scrollIntoViewIfNeeded()
  const rail = await example
    .locator('[data-orientation="horizontal"]')
    .first()
    .boundingBox()
  const thumb = await slider.boundingBox()
  expect(rail).not.toBeNull()
  expect(thumb).not.toBeNull()
  await page.mouse.move(
    thumb!.x + thumb!.width / 2,
    thumb!.y + thumb!.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(
    rail!.x + rail!.width / 4,
    thumb!.y + thumb!.height / 2,
    { steps: 8 }
  )
  await page.mouse.up()
  await expect(input).toHaveValue('25')
  await expect(slider).toHaveAttribute('aria-valuenow', '25')
  await expect
    .poll(async () => {
      const moved = await slider.boundingBox()
      return Math.abs(moved!.x + moved!.width / 2 - (rail!.x + rail!.width / 4))
    })
    .toBeLessThan(6)
  await input.fill('70')
  await expect(slider).toHaveAttribute('aria-valuenow', '70')
  await slider.press('ArrowLeft')
  await expect(input).toHaveValue('69')
  await expect(slider).toHaveAttribute('aria-valuenow', '69')
  const interactive = page.locator('.storybook-docs-interactive').first()
  await interactive
    .getByRole('row', { name: /^value number/ })
    .getByRole('spinbutton')
    .fill('100')
  await expect(
    interactive.getByRole('slider', { name: 'Rebalance Percent' })
  ).toHaveAttribute('aria-valuenow', '100')
  await expect(slider).toHaveAttribute('aria-valuenow', '69')
  await expect(
    page
      .locator('#story--components-fields-and-selection-slider--disabled-inner')
      .getByRole('spinbutton', { name: 'Rebalance Percent' })
  ).toHaveValue('50')
  await slider.scrollIntoViewIfNeeded()
  await example.screenshot({
    animations: 'disabled',
    path: test.info().outputPath('docs-exact-entry.png'),
  })
})

test('slider exact entry shares its value, validity and disabled state', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 640 })
  await page.goto(story('components-fields-and-selection-slider--exact-entry'))
  const input = page.getByRole('spinbutton', { name: 'Rebalance Percent' })
  const slider = page.getByRole('slider', { name: 'Rebalance Percent' })
  await input.fill('65')
  await expect(slider).toHaveAttribute('aria-valuenow', '65')
  await input.fill('101')
  await expect(input).toHaveAttribute('aria-invalid', 'true')
  const messageId = await input.getAttribute('aria-describedby')
  expect(messageId).toBeTruthy()
  await expect(page.locator(`[id="${messageId}"]`)).toBeVisible()
  await expect(slider).toHaveAttribute('aria-valuenow', '65')
  await input.fill('70')
  await expect(input).not.toHaveAttribute('aria-invalid', 'true')
  await slider.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(input).toHaveValue('69')
  await expect(input.locator('..')).toHaveCSS('height', '44px')
  await page.screenshot({
    animations: 'disabled',
    path: test.info().outputPath('slider-exact-entry.png'),
  })
  await page.goto(
    story(
      'components-fields-and-selection-slider--exact-entry',
      'disabled:true'
    )
  )
  await expect(input).toBeDisabled()
  await expect(slider).toBeDisabled()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(
    '/iframe.html?id=components-fields-and-selection-slider--docs&viewMode=docs'
  )
  const interactive = page.locator('.storybook-docs-interactive').first()
  const exactMode = interactive.getByRole('radio', {
    name: 'Exact entry',
    exact: true,
  })
  const readoutMode = interactive.getByRole('radio', {
    name: 'Value readout',
    exact: true,
  })
  await exactMode.check()
  const exact = interactive.getByRole('spinbutton', {
    name: 'Rebalance Percent',
  })
  await exact.fill('101')
  const errorId = await exact.getAttribute('aria-describedby')
  await expect(page.locator(`[id="${errorId}"]`)).toBeVisible()
  await readoutMode.check()
  await expect(exact).toHaveCount(0)
  await expect(page.locator(`[id="${errorId}"]`)).toHaveCount(0)
  await exactMode.check()
  await expect(exact).toHaveValue('50')
  await expect(exact).not.toHaveAttribute('aria-invalid', 'true')
})

test('slider shares configurable integer and decimal increments with exact entry', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 640 })
  const input = page.getByRole('spinbutton', { name: 'Rebalance Percent' })
  const slider = page.getByRole('slider', { name: 'Rebalance Percent' })
  await page.goto(story('components-fields-and-selection-slider--exact-entry'))
  await input.fill('13')
  await expect(slider).toHaveAttribute('aria-valuenow', '13')
  await slider.press('ArrowRight')
  await expect(input).toHaveValue('14')
  const beforeError = await slider.boundingBox()
  const beforeField = await input.boundingBox()
  await input.fill('101')
  await expect(input).toHaveAttribute('aria-invalid', 'true')
  await expect(slider).toHaveAttribute('aria-valuenow', '14')
  const message = page.locator(
    `[id="${await input.getAttribute('aria-describedby')}"]`
  )
  await expect(message).toBeVisible()
  const afterError = await slider.boundingBox()
  expect(afterError!.y - (await input.boundingBox())!.y).toBe(
    beforeError!.y - beforeField!.y
  )
  expect((await message.boundingBox())!.y).toBeGreaterThan(
    afterError!.y + afterError!.height
  )
  await page.screenshot({
    animations: 'disabled',
    path: test.info().outputPath('slider-validation.png'),
  })
  await page.goto(
    story('components-fields-and-selection-slider--exact-entry', 'step:5')
  )
  await slider.press('ArrowRight')
  await expect(input).toHaveValue('55')
  await input.fill('13')
  await expect(input).toHaveAttribute('aria-invalid', 'true')
  await expect(slider).toHaveAttribute('aria-valuenow', '55')
  await input.fill('65')
  await expect(slider).toHaveAttribute('aria-valuenow', '65')
  await page.goto(
    story('components-fields-and-selection-slider--exact-entry', 'step:0.1')
  )
  await input.fill('13.2')
  await expect(input).not.toHaveAttribute('aria-invalid', 'true')
  await expect(slider).toHaveAttribute('aria-valuenow', '13.2')
  await slider.press('ArrowRight')
  await expect(input).toHaveValue('13.3')
})

test('slider Docs present validation without moving focus or scrolling the page', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 640 })
  await page.goto(
    '/iframe.html?id=components-fields-and-selection-slider--docs&viewMode=docs'
  )
  const invalid = page.locator(
    '#story--components-fields-and-selection-slider--invalid-entry-inner'
  )
  const input = invalid.getByRole('spinbutton', { name: 'Rebalance Percent' })
  await expect(input).toHaveValue('101')
  await expect(input).toHaveAttribute('aria-invalid', 'true')
  await expect(input).not.toBeFocused()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  await expect(
    page
      .locator('.storybook-docs-interactive')
      .getByRole('row', { name: /^onValueChange/ })
  ).toHaveCount(0)
})

test('inline jurisdictions wrap together and preserve confirmations and the external link', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(story('components-feedback-and-overlays-dialog--eligibility'))
  await page.getByRole('button', { name: 'Review eligibility' }).click()
  const dialog = page.getByRole('dialog', { name: 'Verify your eligibility' })
  const confirmations = dialog.getByRole('checkbox')
  await confirmations.nth(0).check()
  await confirmations.nth(2).check()
  const confirm = dialog.getByRole('button', { name: 'Confirm', exact: true })
  await expect(confirm).toBeDisabled()
  const disclosure = dialog.getByRole('button', {
    name: 'Show restricted jurisdictions',
  })
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false')
  await dialog.evaluate(async (element) => {
    await Promise.allSettled(
      element.getAnimations().map((animation) => animation.finished)
    )
  })
  const collapsedHeight = (await dialog.boundingBox())!.height
  await disclosure.press('Enter')
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true')
  await expect(disclosure).toBeFocused()
  await expect(confirm).toBeInViewport()
  expect(
    (await dialog.boundingBox())!.height - collapsedHeight
  ).toBeLessThanOrEqual(256)
  const list = dialog.getByRole('list', {
    name: 'Jurisdiction-Based Prohibitions:',
  })
  const entries = list.getByRole('listitem')
  await expect(entries).toHaveCount(15)
  await expect(list).toContainText('Afghanistan; Belarus; Canada; Crimea,')
  expect((await entries.nth(0).boundingBox())!.y).toBeCloseTo(
    (await entries.nth(1).boundingBox())!.y,
    0
  )
  const link = dialog.getByRole('link', {
    name: 'restricted jurisdiction',
    exact: true,
  })
  await expect(link).toHaveAttribute(
    'href',
    'https://docs.ondo.finance/ondo-global-markets/eligibility'
  )
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(confirmations.nth(0)).toBeChecked()
  await expect(confirmations.nth(1)).not.toBeChecked()
  await expect(confirmations.nth(2)).toBeChecked()
  await dialog.screenshot({
    animations: 'disabled',
    path: test.info().outputPath('eligibility-inline-desktop.png'),
  })
  await disclosure.press('Enter')
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false')
  await expect(list).toHaveCount(0)
  await expect(disclosure).toBeFocused()
  await confirmations.nth(1).check()
  await expect(confirm).toBeEnabled()
})

test('inline jurisdictions use only the dialog body scroller on short screens', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 480 })
      await page.goto(
        `/?path=/story/components-feedback-and-overlays-dialog--long-content&globals=theme:${theme}`
      )
      const preview = page.frameLocator('#storybook-preview-iframe')
      const opener = preview.getByRole('button', { name: 'Open eligibility' })
      await opener.click()
      const dialog = preview.getByRole('dialog', {
        name: 'Verify your eligibility',
      })
      const disclosure = dialog.getByRole('button', {
        name: 'Show restricted jurisdictions',
      })
      await expect(disclosure).toHaveAttribute('aria-expanded', 'true')
      await expect(dialog.getByRole('button', { name: /close/i })).toHaveCount(
        0
      )
      await page.keyboard.press('Escape')
      await expect(dialog).toBeVisible()
      await dialog.evaluate(async (element) => {
        await Promise.allSettled(
          element.getAnimations().map((animation) => animation.finished)
        )
      })
      const heading = dialog.getByRole('heading', {
        name: 'Verify your eligibility',
      })
      const confirm = dialog.getByRole('button', {
        name: 'Confirm',
        exact: true,
      })
      await expect(confirm).toBeInViewport()
      const headingTop = (await heading.boundingBox())!.y
      const actionTop = (await confirm.boundingBox())!.y
      expect(
        await dialog.evaluate(
          (element) =>
            [...element.querySelectorAll('*')].filter(
              (child) =>
                /auto|scroll/.test(getComputedStyle(child).overflowY) &&
                child.scrollHeight > child.clientHeight + 1
            ).length
        )
      ).toBe(1)
      const list = dialog.getByRole('list', {
        name: 'Jurisdiction-Based Prohibitions:',
      })
      const lastCountry = list.getByRole('listitem').last()
      await lastCountry.scrollIntoViewIfNeeded()
      await expect(lastCountry).toBeInViewport()
      const lastStatement = dialog.getByText(
        'I confirm that I am allowed to purchase tokenized stocks under the laws of my country of residence.',
        { exact: true }
      )
      await lastStatement.scrollIntoViewIfNeeded()
      await expect(lastStatement).toBeInViewport()
      await expect(confirm).toBeInViewport()
      expect((await heading.boundingBox())!.y).toBeCloseTo(headingTop, 0)
      expect((await confirm.boundingBox())!.y).toBeCloseTo(actionTop, 0)
      await dialog.screenshot({
        animations: 'disabled',
        path: test
          .info()
          .outputPath(`eligibility-inline-${theme}-${width}.png`),
      })
      await page
        .getByRole('button', { name: 'Close preview dialog', exact: true })
        .click()
      await expect(dialog).toHaveCount(0)
      await expect(opener).toBeFocused()
    }
  }
})

test('bounded Zapper uses a real dialog and returns focus from nested settings', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 480 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(
    story(
      'patterns-transactions-in-progress-zapper-and-rfq--bounded-dialog-proposal'
    )
  )
  const opener = page.getByRole('button', { name: 'Open Zapper', exact: true })
  await opener.click()
  const dialog = page.getByRole('dialog', { name: 'Buy / Sell' })
  await expect(dialog).toBeVisible()
  await page.screenshot({
    animations: 'disabled',
    path: test.info().outputPath('bounded-zapper.png'),
  })
  await dialog.getByRole('button', { name: 'Open Zapper settings' }).click()
  await expect(
    page.getByRole('dialog', { name: 'Zapper settings' })
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('dialog', { name: 'Zapper settings' })
  ).toHaveCount(0)
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Show quote details' }).click()
  await dialog.evaluate(async (element) => {
    await Promise.allSettled(
      element
        .getAnimations({ subtree: true })
        .filter(
          (animation) => animation.effect?.getTiming().iterations !== Infinity
        )
        .map((animation) => animation.finished)
    )
  })
  const buy = dialog.getByRole('button', { name: 'Buy CMC20', exact: true })
  await expect(buy).toBeInViewport({ ratio: 1 })
  await buy.scrollIntoViewIfNeeded()
  await expect(buy).toBeInViewport({ ratio: 1 })
  expect(
    await buy.evaluate((element) => {
      const box = element.getBoundingClientRect()
      return element.contains(
        document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
      )
    })
  ).toBe(true)
  await page.screenshot({
    animations: 'disabled',
    path: test.info().outputPath('bounded-zapper-expanded.png'),
  })
  await expect(buy).toBeInViewport({ ratio: 1 })
  await dialog.getByRole('button', { name: 'Close Zapper' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(opener).toBeFocused()
  await opener.click()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(opener).toBeFocused()
  for (const state of [
    'RFQ outcome',
    'RFQ recovery',
    'Market-hours advisory',
    'Updates',
  ]) {
    await page.goto(
      story(
        'patterns-transactions-in-progress-zapper-and-rfq--bounded-dialog-proposal',
        `state:${state}`
      ) + '&globals=theme:dark'
    )
    await opener.click()
    await expect(dialog).toBeVisible()
    await dialog.evaluate(async (element) => {
      await Promise.allSettled(
        element.getAnimations().map((animation) => animation.finished)
      )
    })
    const bounds = await dialog.boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.y).toBeGreaterThanOrEqual(0)
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(480)
    expect(
      await dialog.evaluate(
        (element) => element.scrollWidth <= element.clientWidth
      )
    ).toBe(true)
    await page.screenshot({
      animations: 'disabled',
      path: test.info().outputPath(`bounded-zapper-${state}.png`),
    })
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(opener).toBeFocused()
  }
})
