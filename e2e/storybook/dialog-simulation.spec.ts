import { expect, test } from '@playwright/test'

const shell =
  '/iframe.html?id=components-feedback-and-overlays-dialog--shell&viewMode=story'
const title = 'Liquidity simulation amount'

test('liquidity dialog preserves exact input, coarse adjustment and applied versus discarded drafts', async ({
  page,
}) => {
  await page.goto(shell)
  const opener = page.getByRole('button', {
    name: 'Simulation config',
    exact: true,
  })
  await opener.click()
  const dialog = page.getByRole('dialog', { name: title, exact: true })
  const input = dialog.getByRole('textbox', { name: title, exact: true })
  const slider = dialog.getByRole('slider', { name: title, exact: true })
  await expect(dialog).toContainText(
    'Set the USD amount per token used to simulate price impact.'
  )
  await expect(input).toHaveValue('10000')
  await input.fill('13751')
  await expect(slider).toHaveAttribute('aria-valuenow', '13751')
  await dialog.getByRole('button', { name: 'Simulate', exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(opener).toBeFocused()
  await opener.click()
  await expect(input).toHaveValue('13751')
  await input.fill('12510')
  await slider.press('ArrowRight')
  await expect(input).toHaveValue('12610')
  await page.keyboard.press('Escape')
  await expect(opener).toBeFocused()
  await opener.click()
  await expect(input).toHaveValue('13751')
  await input.fill('8')
  await slider.focus()
  await expect(input).toHaveValue('10')
  await input.fill('100001')
  await slider.focus()
  await expect(input).toHaveValue('100000')
  await input.fill('')
  await slider.focus()
  await expect(input).toHaveValue('10')
  await input.fill('24681')
  await input.press('Enter')
  await expect(dialog).toBeHidden()
  await opener.click()
  await expect(input).toHaveValue('24681')
  await dialog
    .getByRole('button', { name: 'Close dialog', exact: true })
    .click()
  await expect(opener).toBeFocused()
})

for (const header of ['shell', 'topic-header']) {
  test(`liquidity dialog uses native controls and fits narrow, short and desktop views in both themes (${header})`, async ({
    page,
  }) => {
    for (const width of [320, 390, 640, 1440]) {
      await page.setViewportSize({ width, height: 480 })
      for (const theme of ['light', 'dark']) {
        await page.goto(
          shell.replace('--shell', `--${header}`) + `&globals=theme:${theme}`
        )
        await page
          .getByRole('button', { name: 'Simulation config', exact: true })
          .click()
        const dialog = page.getByRole('dialog', { name: title, exact: true })
        await dialog.evaluate(async (element) => {
          await Promise.allSettled(
            element.getAnimations().map((animation) => animation.finished)
          )
        })
        const input = dialog.getByRole('textbox', { name: title, exact: true })
        const slider = dialog.getByRole('slider', { name: title, exact: true })
        await expect(
          dialog.getByRole('heading', { name: title, exact: true })
        ).toBeInViewport()
        await expect(
          dialog.getByRole('button', { name: 'Simulate', exact: true })
        ).toBeInViewport()
        await expect(input).toBeInViewport()
        await expect(input.locator('..')).toHaveCSS('height', '44px')
        const box = (await dialog.boundingBox())!
        expect(box.x).toBeGreaterThanOrEqual(-1)
        expect(box.y).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(width + 1)
        expect(box.y + box.height).toBeLessThanOrEqual(481)
        expect(
          await dialog.evaluate((el) =>
            [...el.querySelectorAll('*')]
              .filter(
                (child) =>
                  !child.closest('.sr-only') &&
                  child.scrollWidth > child.clientWidth + 1
              )
              .map((child) => child.textContent)
          )
        ).toEqual([])
        const track = (await dialog
          .locator('[data-orientation="horizontal"]')
          .first()
          .boundingBox())!
        await page.mouse.click(
          track.x + track.width * 0.73,
          track.y + track.height / 2
        )
        const pointerValue = await slider.getAttribute('aria-valuenow')
        expect(pointerValue).not.toBe('10000')
        await expect(input).toHaveValue(pointerValue!)
        await page.screenshot({
          path: test.info().outputPath(`simulation-${theme}-${width}.png`),
          animations: 'disabled',
        })
      }
    }
  })
}

test('Dialog Docs lead with the real task and width changes preserve its applied setting', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(
    '/iframe.html?id=components-feedback-and-overlays-dialog--docs&viewMode=docs'
  )
  const interactive = page.locator('.storybook-docs-interactive').first()
  await expect(
    interactive.getByRole('row', { name: /^dismissible/ })
  ).toHaveCount(0)
  const opener = interactive.getByRole('button', {
    name: 'Simulation config',
    exact: true,
  })
  await opener.click()
  const dialog = page.getByRole('dialog', { name: title, exact: true })
  await dialog.getByRole('textbox', { name: title, exact: true }).fill('17821')
  await dialog.getByRole('button', { name: 'Simulate', exact: true }).click()
  await interactive.getByRole('radio', { name: 'compact', exact: true }).click()
  await opener.click()
  await expect(dialog).toHaveAttribute('data-width', 'compact')
  await expect(
    dialog.getByRole('textbox', { name: title, exact: true })
  ).toHaveValue('17821')
})

test('Storybook toolbar closes eligibility previews without adding a product dismissal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/?path=/docs/components-feedback-and-overlays-dialog--docs')
  const preview = page.frameLocator('#storybook-preview-iframe')
  const closePreview = page.getByRole('button', {
    name: 'Close preview dialog',
    exact: true,
  })
  for (const name of ['Review eligibility', 'Open eligibility']) {
    const opener = preview.getByRole('button', { name, exact: true })
    await opener.click()
    const dialog = preview.getByRole('dialog', {
      name: 'Verify your eligibility',
      exact: true,
    })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: /close/i })).toHaveCount(0)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeVisible()
    await expect(closePreview).toBeVisible()
    await page.screenshot({
      animations: 'disabled',
      path: test
        .info()
        .outputPath(`external-close-${name.replaceAll(' ', '-')}.png`),
    })
    await closePreview.click()
    await expect(dialog).toBeHidden()
    await expect(opener).toBeFocused()
    await opener.click()
    await closePreview.focus()
    await closePreview.press('Enter')
    await expect(dialog).toBeHidden()
    await expect(opener).toBeFocused()
  }
})

test('Dialog Docs distinguish allowed header compositions from the avoid example', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=components-feedback-and-overlays-dialog--docs&viewMode=docs'
  )
  await expect(
    page.getByRole('heading', { name: /Header examples$/ })
  ).toBeVisible()
  for (const name of [
    'Allowed · Title and close',
    'Allowed · Topic icon and close',
    'Allowed · Transaction controls',
    'Avoid · Empty action row',
  ]) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
  }
  const topic = page.locator(
    '#story--components-feedback-and-overlays-dialog--topic-header-inner'
  )
  await topic
    .getByRole('button', { name: 'Simulation config', exact: true })
    .click()
  const dialog = page.getByRole('dialog', { name: title, exact: true })
  await dialog.evaluate(async (element) => {
    await Promise.allSettled(
      element.getAnimations().map((animation) => animation.finished)
    )
  })
  const heading = dialog.getByRole('heading', { name: title, exact: true })
  const close = dialog.getByRole('button', {
    name: 'Close dialog',
    exact: true,
  })
  const titleBox = (await heading.boundingBox())!
  const closeBox = (await close.boundingBox())!
  expect(titleBox.y - closeBox.y - closeBox.height).toBeCloseTo(16, 0)
  await close.click()
  await expect(dialog).toBeHidden()
  await expect(
    topic.getByRole('button', { name: 'Simulation config', exact: true })
  ).toBeFocused()
  await page.goto(
    '/iframe.html?id=components-feedback-and-overlays-dialog--header-examples&viewMode=story'
  )
  await page
    .getByTestId('dialog-header-examples')
    .screenshot({ path: test.info().outputPath('header-examples.png') })
})
