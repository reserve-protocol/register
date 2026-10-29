import { expect, test, type Locator } from '@playwright/test'

const story = (id: string, theme: string) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`

const sizes = [
  { name: 'Micro', key: 'micro', height: 28, padding: 10, iconPadding: 8 },
  { name: 'Compact', key: 'compact', height: 32, padding: 14, iconPadding: 12 },
  { name: 'Default', key: 'default', height: 44, padding: 24, iconPadding: 22 },
] as const

const expectSize = async (control: Locator, height: number) => {
  await expect(control).toHaveCSS('height', `${height}px`)
  await expect(control).toHaveCSS('transform', 'none')
  await expect
    .poll(async () => (await control.boundingBox())?.height)
    .toBeCloseTo(height, 1)
}

const expectUnclipped = async (panel: Locator, host: Locator) => {
  await expect
    .poll(async () => {
      const [p, h] = await Promise.all([
        panel.boundingBox(),
        host.boundingBox(),
      ])
      return Boolean(
        p &&
        h &&
        p.x >= h.x &&
        p.y >= h.y &&
        p.x + p.width <= h.x + h.width &&
        p.y + p.height <= h.y + h.height
      )
    })
    .toBe(true)
  expect(await host.evaluate((element) => element.scrollTop)).toBe(0)
}

test('inset study separates mobile, desktop and nested content geometry', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    for (const width of [390, 767, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto(
        story('explorations-foundation-studies--responsive-insets', theme)
      )
      for (const [name, inset] of [
        ['Mobile section inset', 20],
        ['Desktop section inset', 24],
        ['Nested content inset', 16],
      ] as const) {
        const specimen = page.getByRole('region', { name, exact: true })
        await expect(specimen).toBeVisible()
        for (const side of ['top', 'right', 'bottom', 'left']) {
          await expect(specimen).toHaveCSS(`padding-${side}`, `${inset}px`)
        }
        const box = (await specimen.boundingBox())!
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(width)
        expect(
          await specimen.evaluate(
            (element) => element.scrollWidth > element.clientWidth
          )
        ).toBe(false)
      }
    }
  }
})

test('geometry study presents the supported canonical control dimensions', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto(
        story('explorations-foundation-studies--control-geometry', theme)
      )
      for (const size of sizes) {
        const row = page.getByRole('region', {
          name: `${size.name} control geometry`,
        })
        const text = row.getByRole('button', { name: 'Action', exact: true })
        await expectSize(text, size.height)
        await expect(text).toHaveCSS('font-size', '14px')
        await expect(text).toHaveCSS('padding-left', `${size.padding}px`)
        await expect(text).toHaveCSS('padding-right', `${size.padding}px`)
        const leading = row.getByRole('button', {
          name: 'Filters',
          exact: true,
        })
        await expectSize(leading, size.height)
        await expect(leading).toHaveCSS('padding-left', `${size.iconPadding}px`)
        const trailing = row.getByRole('button', {
          name: 'Continue',
          exact: true,
        })
        await expectSize(trailing, size.height)
        await expect(trailing).toHaveCSS(
          'padding-right',
          `${size.iconPadding}px`
        )
        const icon = row.getByRole('button', {
          name: `${size.name} more actions`,
        })
        await expectSize(icon, size.height)
        await expect(icon).toHaveCSS('width', `${size.height}px`)
        expect((await icon.boundingBox())!.width).toBeCloseTo(size.height, 1)
        if (size.key !== 'micro') {
          await expectSize(row.getByRole('combobox'), size.height)
          await expectSize(
            row.getByLabel(`${size.name} segmented control`),
            size.height
          )
        }
        const inputs = row.getByRole('textbox')
        const searches = row.getByRole('searchbox')
        if (size.key === 'default') {
          await expect(inputs).toHaveCSS('font-size', '16px')
          await expect(searches).toHaveCSS('font-size', '16px')
          for (const frame of await row
            .getByTestId('canonical-text-input')
            .all()) {
            await expectSize(frame, 44)
          }
        } else {
          await expect(inputs).toHaveCount(0)
          await expect(searches).toHaveCount(0)
        }
      }
    }
  }
})

test('Button dependents retain native dimensions across states and themes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const theme of ['light', 'dark']) {
    await page.goto(story('components-actions-button--system', theme))
    const matrix = page.locator('table')
    for (const size of sizes) {
      const controls = matrix.locator(`[data-size="${size.key}"]`)
      await expect(controls).toHaveCount(4)
      for (const control of await controls.all()) {
        await expectSize(control, size.height)
        await expect(control).toHaveCSS('font-size', '14px')
      }
      const text = controls.filter({ hasText: 'Details' })
      await expect(text).toHaveCSS('padding-left', `${size.padding}px`)
      const leading = controls.filter({ hasText: 'Create' })
      await expect(leading).toHaveCSS('padding-left', `${size.iconPadding}px`)
    }
    const states = page
      .getByRole('heading', { name: 'States · default size' })
      .locator('..')
    for (const control of await states.getByRole('button').all()) {
      await expectSize(control, 44)
      await expect(control).toHaveCSS('font-size', '14px')
      await expect(control).toBeDisabled()
    }

    await page.goto(story('components-actions-icon-button--system', theme))
    for (const size of sizes) {
      const controls = page.locator(`table [data-size="${size.key}"]`)
      await expect(controls).toHaveCount(12)
      for (const control of await controls.all()) {
        await expectSize(control, size.height)
        await expect(control).toHaveCSS('width', `${size.height}px`)
        expect((await control.boundingBox())!.width).toBeCloseTo(size.height, 1)
        await expect(control).toHaveCSS('padding-left', '0px')
        await expect(control).toHaveCSS('padding-right', '0px')
      }
    }

    await page.goto(
      story('components-navigation-and-disclosure-pagination--middle', theme)
    )
    const pagination = page.getByRole('navigation', { name: 'Pagination' })
    await expect(pagination.getByRole('button').first()).toBeVisible()
    for (const control of await pagination.getByRole('button').all()) {
      await expectSize(control, 32)
      await expect(control).toHaveCSS('padding-left', '0px')
    }

    await page.goto(story('patterns-market-discover--table', theme))
    const baskets = page.locator('[data-slot="token-stack-trigger"]')
    await expect(baskets.first()).toBeVisible()
    for (const basket of await baskets.all()) {
      await expectSize(basket, 44)
      await expect(basket).toHaveCSS('padding-top', '0px')
      await expect(basket).toHaveCSS('padding-bottom', '0px')
      await expect(basket).toHaveCSS('padding-left', '9px')
    }
  }
})

test('mobile utility panels stay inside their previews and close compactly', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 320, height: 400 },
    ]) {
      await page.setViewportSize(viewport)
      await page.goto(story('patterns-navigation--mobile-global', theme))
      const hosts = [
        page.getByTestId('mobile-global-preview'),
        page.getByTestId('mobile-header-connected-state').locator('..'),
        page.getByTestId('mobile-header-transparent-state').locator('..'),
        page.getByTestId('mobile-header-narrow-state'),
        page.getByTestId('mobile-header-compact-brand-state'),
      ]
      for (const host of hosts) {
        const trigger = host.getByRole('button', {
          name: 'Search, theme, and language',
        })
        await expect(trigger).toBeVisible()
        const closed = (await host.boundingBox())!.height
        expect(closed).toBeLessThan(80)
        await trigger.click()
        const panel = host.getByRole('region', {
          name: 'Application utilities',
        })
        await expect(panel).toBeVisible()
        await expectUnclipped(panel, host)
        const language = panel.getByRole('button', {
          name: 'Language, English',
        })
        await expectSize(language, 44)
        await expect(language).toHaveCSS('padding-left', '20px')
        await expect(language).toHaveCSS('padding-right', '18px')
        await expect(language).toHaveCSS('font-size', '16px')
        await language.click()
        await expectUnclipped(panel, host)
        const last = panel.getByRole('button', {
          name: 'Switch language to Chinese',
        })
        await last.scrollIntoViewIfNeeded()
        await expect(last).toBeInViewport()
        expect(
          await last.evaluate((element) => {
            const box = element.getBoundingClientRect()
            return element.contains(
              document.elementFromPoint(
                box.x + box.width / 2,
                box.y + box.height / 2
              )
            )
          })
        ).toBe(true)
        await last.click()
        await expect(
          panel.getByRole('button', { name: 'Language, Chinese' })
        ).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(panel).toHaveCount(0)
        await expect(trigger).toBeFocused()
        expect((await host.boundingBox())!.height).toBe(closed)
      }
    }
  }
})
