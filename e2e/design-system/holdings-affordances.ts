import { expect, type Locator, type Page } from '@playwright/test'

export async function expectHoldingsToolbar(
  composition: Locator,
  available: number
) {
  const toolbar = composition.locator('[data-slot="holdings-toolbar"]')
  if (available >= 768) {
    await expect(toolbar).toBeHidden()
    return
  }
  await expect(toolbar).toBeVisible()
  await expect(toolbar.getByRole('tablist')).toHaveCSS('height', '44px')
  const geometry = await toolbar.evaluate((root) => {
    const box = (selector: string) =>
      root.querySelector(selector)!.getBoundingClientRect().toJSON()
    const bounds = root.getBoundingClientRect()
    return {
      left: bounds.left + 24,
      right: bounds.right - 24,
      tabs: box('[role="tablist"]'),
      sort: box('[data-testid="table-sort-menu"]'),
    }
  })
  expect(Math.abs(geometry.tabs.left - geometry.left)).toBeLessThanOrEqual(1)
  expect(Math.abs(geometry.sort.right - geometry.right)).toBeLessThanOrEqual(1)
  expect(geometry.sort.width).toBe(44)
  expect(geometry.sort.height).toBe(44)
  expect(Math.abs(geometry.tabs.y - geometry.sort.y)).toBeLessThanOrEqual(1)
  expect(geometry.sort.x - geometry.tabs.right).toBe(8)
  const firstSummary = await composition
    .locator('[data-slot="holding-summary"]:visible')
    .first()
    .boundingBox()
  expect(firstSummary!.y - geometry.tabs.bottom).toBeCloseTo(24, 0)
  await expect(toolbar.getByTestId('table-sort-menu')).not.toContainText(
    'Sort by:'
  )
  await expect(toolbar.getByTestId('table-sort-menu')).toHaveAccessibleName(
    /^Sort by:/
  )
}

export async function expectHoldingLinkAffordance(
  page: Page,
  row: Locator,
  wide: boolean
) {
  const link = row.getByRole('link').filter({ visible: true }).first()
  const icon = link.locator('[data-slot="holding-external-icon"]')
  await page.mouse.move(0, 0)
  await expect(icon).toHaveCSS('opacity', wide ? '0' : '1')
  const before = await link.boundingBox()
  await link.hover()
  await expect(icon).toHaveCSS('opacity', '1')
  expect(await link.boundingBox()).toEqual(before)
  await page.mouse.move(0, 0)
  await page.keyboard.press('Tab')
  await link.focus()
  await expect(icon).toHaveCSS('opacity', '1')
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(link).toHaveAccessibleName(/opens in a new tab/)
  const bridge = row
    .getByRole('button', { name: 'Bridged', exact: true })
    .filter({ visible: true })
  await expect(bridge).toHaveCSS('text-decoration-line', 'underline')
  const separator = row.locator('[data-slot="metadata-separator"]:visible')
  await expect(separator).toHaveText('·')
  await expect(separator).toHaveAttribute('aria-hidden', 'true')
  const bridgeTop = (await bridge.boundingBox())!.y
  expect(
    Math.abs((await separator.boundingBox())!.y - bridgeTop)
  ).toBeLessThanOrEqual(1)
}

export async function expectIdentitySkeleton(row: Locator) {
  const text = row.locator('[data-slot="identity-skeleton-text"]:visible')
  await expect(text).toHaveCSS('height', '44px')
  const bars = text.getByTestId('v1-skeleton')
  await expect(bars.nth(0)).toHaveCSS('height', '16px')
  await expect(bars.nth(1)).toHaveCSS('height', '12px')
  const first = (await bars.nth(0).boundingBox())!
  const second = (await bars.nth(1).boundingBox())!
  expect(second.y - first.y - first.height).toBe(8)
}
