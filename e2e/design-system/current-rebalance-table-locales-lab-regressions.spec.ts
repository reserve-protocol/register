import { test, expect, currentCapture } from './current-rebalance-helpers'

const url =
  '/internal/design-system/components/table#auctions-current-table-review'

for (const [locale, restricted, anyone, explanation, expiryLabel] of [
  [
    'es',
    'Solo el lanzador puede iniciar',
    'Cualquiera puede iniciar',
    'El lanzamiento comunitario no está disponible para este reequilibrio',
    'El reequilibrio vence en',
  ],
  [
    'ko',
    '실행자만 시작 가능',
    '누구나 시작 가능',
    '이 리밸런싱에는 커뮤니티 실행을 이용할 수 없습니다',
    '리밸런싱 만료까지',
  ],
  [
    'zh',
    '仅发起者可启动',
    '任何人都可启动',
    '此次再平衡不支持社区发起',
    '再平衡到期剩余',
  ],
])
  test(`current table access labels fit ${locale} phone`, async ({
    page,
    txLog,
  }, info) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.addInitScript(
      (value) => localStorage.setItem('register.locale', JSON.stringify(value)),
      locale
    )
    await page.goto(url)
    const table = page.getByTestId('current-rebalances-table')
    await expect(
      table
        .first()
        .getByTestId('current-table-expiry')
        .filter({ visible: true })
    ).toContainText(expiryLabel)
    for (const [id, label] of [
      ['ready', restricted],
      ['permissionless', anyone],
    ]) {
      const row = table
        .locator('tbody tr')
        .filter({ has: page.locator(`[data-table-focus="details-all-${id}"]`) })
      await expect(
        row.getByTestId('current-table-status').filter({ visible: true })
      ).toHaveText(label)
    }
    const weights = page.getByTestId('current-table-example').filter({
      has: page.locator('[data-table-focus="details-all-hybrid-restricted"]'),
    })
    await expect(
      weights
        .getByTestId('current-table-access-summary')
        .filter({ visible: true })
    ).toHaveText(restricted)
    const help = weights
      .getByTestId('current-table-launcher-help')
      .filter({ visible: true })
      .getByRole('button')
    await help.click()
    await expect(page.getByRole('tooltip')).toHaveText(explanation)
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('current-retained-detail')).toHaveCount(0)
    expect(
      await table.evaluateAll((elements) =>
        Math.max(...elements.map((el) => el.scrollWidth - el.clientWidth))
      )
    ).toBeLessThanOrEqual(1)
    for (const width of [383, 384, 390, 430, 608, 1072]) {
      await page.setViewportSize({ width, height: 900 })
      const wrapped = await table
        .getByTestId('lifecycle-status-pill')
        .filter({ visible: true })
        .evaluateAll((pills) =>
          pills
            .filter((pill) => {
              const range = document.createRange()
              range.selectNode(pill.lastChild!)
              return (
                range.getBoundingClientRect().height >
                parseFloat(getComputedStyle(pill).lineHeight) + 1
              )
            })
            .map((pill) => pill.textContent)
        )
      expect(wrapped, `translated pills at ${width}`).toEqual([])
      if (width === 1072) {
        await expect(table.first().locator('thead')).toContainText(expiryLabel)
        await currentCapture(
          page,
          table.first(),
          info,
          `closeout-expiry-${locale}-${width}`
        )
      }
      if (width < 1072) {
        const overlaps = await table.evaluateAll((tables) =>
          tables.flatMap((el, index) => {
            const arrow = Array.from(
              el.querySelectorAll('a[data-table-focus^="details-"]')
            ).find((item) => item.getBoundingClientRect().height > 0)!
            const status = Array.from(
              el.querySelectorAll('[data-testid="current-table-status"]')
            ).find((item) => item.getBoundingClientRect().height > 0)!
            const pill = status
              .querySelector('[data-testid="lifecycle-status-pill"]')!
              .getBoundingClientRect()
            const button = arrow.getBoundingClientRect()
            const help = status.querySelector('button')?.getBoundingClientRect()
            if (el.getBoundingClientRect().width < 352) return []
            return pill.right > button.left - 18 ||
              (help && help.right + 12 > button.left - 6)
              ? [index]
              : []
          })
        )
        expect(
          overlaps,
          `translated status/helper keeps clear of arrow at ${width}`
        ).toEqual([])
      }
      expect(
        await table.evaluateAll((elements) =>
          Math.max(...elements.map((el) => el.scrollWidth - el.clientWidth))
        )
      ).toBeLessThanOrEqual(1)
    }
    await page.setViewportSize({ width: 320, height: 900 })
    await currentCapture(
      page,
      page.getByTestId('current-table-heading'),
      info,
      `table-access-${locale}-phone`
    )
    await page.setViewportSize({ width: 390, height: 900 })
    await currentCapture(
      page,
      table.first(),
      info,
      `status-arrow-${locale}-390`
    )
    expect(txLog.length).toBe(0)
  })
