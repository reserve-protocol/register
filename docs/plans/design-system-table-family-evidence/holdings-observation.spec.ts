import { test, expect } from '../../../e2e/harness'
import { REGISTRY } from '../../../e2e/helpers/registry'

const lcap = REGISTRY.find((dtf) => dtf.slug === 'lcap')!

for (const theme of ['light', 'dark']) {
  for (const width of [375, 639, 640, 1400]) {
    test(`holdings ${theme} ${width}`, async ({ harness }, info) => {
      const page = harness.page
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await harness.goto(lcap, 'overview')
      const basket = page.getByTestId('overview-basket')
      await expect(basket).toBeVisible()
      const tabs = basket.locator('[role="tab"]:visible')
      await expect(tabs).toHaveCount(2)
      await tabs.first().scrollIntoViewIfNeeded()
      await basket.evaluate((el) => el.scrollIntoView({ block: 'start' }))
      await page.evaluate(() => scrollBy(0, -80))
      await expect(
        basket.locator(width < 640 ? '.sm\\:hidden .grid' : 'tbody tr').first()
      ).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      await info.attach('exposure', {
        body: await page.screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      })
      await tabs.nth(1).click()
      await expect(tabs.nth(1)).toHaveAttribute('data-state', 'active')
      await expect(
        basket.locator('a[target="_blank"]:visible').first()
      ).toBeVisible()
      await info.attach('collateral', {
        body: await page.screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      })
      const observed = await basket.evaluate((el) => ({
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        basket: el.getBoundingClientRect().toJSON(),
        tabs: [...el.querySelectorAll('[role="tab"]')].map((tab) => ({
          text: tab.textContent,
          visible: tab.getBoundingClientRect().width > 0,
          bounds: tab.getBoundingClientRect().toJSON(),
        })),
        links: [...el.querySelectorAll('a')]
          .filter((link) => link.getBoundingClientRect().width > 0)
          .map((link) => ({
            href: link.href,
            target: link.target,
            rel: link.rel,
          })),
      }))
      await info.attach('geometry', {
        body: Buffer.from(JSON.stringify(observed, null, 2)),
        contentType: 'application/json',
      })
      await tabs.first().focus()
      await page.keyboard.press('Enter')
      await expect(tabs.first()).toHaveAttribute('data-state', 'active')
      expect(harness.tx.log).toHaveLength(0)
    })
  }
}
