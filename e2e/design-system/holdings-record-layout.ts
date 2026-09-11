import { expect, type Locator } from '@playwright/test'

export async function expectHoldingRecordLayout(
  records: Locator,
  available: number
) {
  for (const record of await records.all()) {
    const geometry = await record.evaluate((root) => {
      const box = (slot: string) =>
        root
          .querySelector(`[data-slot="${slot}"]`)!
          .getBoundingClientRect()
          .toJSON()
      const cell = root.closest('td')!
      const seam = cell.querySelector('[data-slot="row-seam"]')!
      return {
        cell: cell.getBoundingClientRect().toJSON(),
        seam: seam.getClientRects().length
          ? seam.getBoundingClientRect().toJSON()
          : null,
        name: box('entity-identity-name'),
        summary: box('holding-summary'),
        weight: box('holding-allocation'),
        details: box('holding-details'),
        symbol: box('holding-symbol'),
        price: box('holding-price-change'),
        cap: box('holding-market-cap'),
      }
    })
    if (geometry.seam) {
      expect(geometry.seam.left - geometry.cell.left).toBeCloseTo(24, 0)
      expect(geometry.cell.right - geometry.seam.right).toBeCloseTo(0, 0)
    }
    expect(Math.abs(geometry.name.y - geometry.weight.y)).toBeLessThanOrEqual(1)
    expect(geometry.weight.x - geometry.name.right).toBeGreaterThanOrEqual(15)
    expect(geometry.details.y - geometry.summary.bottom).toBe(
      available < 512 ? 8 : 16
    )
    expect(Math.abs(geometry.price.y - geometry.cap.y)).toBeLessThanOrEqual(1)
    if (available >= 512) {
      expect(
        Math.abs(geometry.symbol.y - geometry.price.y)
      ).toBeLessThanOrEqual(1)
    } else {
      expect(geometry.price.y - geometry.symbol.bottom).toBe(16)
    }
    const weight = record.locator('[data-slot="holding-allocation"]')
    await expect(weight).toContainText('Weight')
    await expect(weight.locator('.sr-only')).toHaveCSS('position', 'absolute')
    await expect(weight.getByTestId('canonical-metric-value')).toHaveCSS(
      'font-weight',
      '500'
    )
    await expect(
      record.locator('[data-slot="holding-summary"] img')
    ).toHaveCount(0)
    await expect(
      record.locator('[data-slot="holding-symbol"] img').first()
    ).toHaveCSS('width', '20px')
    for (const icon of await record
      .locator('[data-slot="holding-external-icon"]')
      .all())
      await expect(icon).toHaveCSS('opacity', '1')
  }
}
