import { test, expect } from '../fixtures/base'
import {
  assertUnchangedSource,
  readReviewSource,
  watchReviewSource,
} from './review-source'

let source: ReturnType<typeof readReviewSource>
let guard: ReturnType<typeof watchReviewSource>
test.beforeEach(() => {
  source = readReviewSource(process.cwd())
  guard = watchReviewSource(process.cwd())
})
test.afterEach(async ({ page }, info) => {
  expect(page.isClosed()).toBe(false)
  guard.close()
  assertUnchangedSource(source, readReviewSource(process.cwd()), [
    ...guard.changes,
  ])
  await info.attach('public-source-digest', {
    body: Buffer.from(source.digest),
    contentType: 'text/plain',
  })
})

for (const theme of ['light', 'dark']) {
  for (const width of [320, 375, 1400]) {
    test(`table family ${theme} ${width}`, async ({ page, txLog }, info) => {
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto(
        '/internal/design-system/components/table#table-family-review'
      )
      const choosePreview = async (state: string) => {
        await page.getByTestId('table-preview-state').click()
        await page.getByTestId(`table-state-${state}`).click()
      }
      const review = page.getByTestId('table-family-review')
      await expect(review).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      const gallery = page.getByTestId('table-family-cells')
      const assertBadgeEdges = async () => {
        const identityGaps = await page
          .getByTestId('canonical-entity-identity')
          .filter({ visible: true })
          .evaluateAll((identities) =>
            identities.flatMap((identity) => {
              const mark = identity.firstElementChild
              const logo = mark?.querySelector('img')
              if (!logo) return []
              const unclassified = identity.cloneNode(true) as HTMLElement
              unclassified.firstElementChild!.removeAttribute(
                'data-entity-logo-size'
              )
              unclassified.style.cssText = 'position:absolute;visibility:hidden'
              unclassified.setAttribute('aria-hidden', 'true')
              identity.parentElement!.appendChild(unclassified)
              const customGap = getComputedStyle(unclassified).columnGap
              unclassified.remove()
              return [
                {
                  size: mark!.getAttribute('data-entity-logo-size'),
                  gap: getComputedStyle(identity).columnGap,
                  customGap,
                },
              ]
            })
          )
        for (const identity of identityGaps) {
          expect(identity.gap).toBe(identity.size === 'xl' ? '12px' : '8px')
          expect(identity.customGap).toBe('8px')
        }
        const geometry = await page
          .getByTestId('canonical-chain-badged-logo')
          .filter({ visible: true })
          .evaluateAll((marks) =>
            marks.map((mark) => {
              const token = mark.querySelector('img')!.getBoundingClientRect()
              const badge = mark.querySelector(
                '[data-testid="canonical-chain-badge"]'
              )!
              const box = badge.getBoundingClientRect()
              const style = getComputedStyle(badge)
              return {
                right:
                  box.right - token.right - parseFloat(style.borderRightWidth),
                bottom:
                  box.bottom -
                  token.bottom -
                  parseFloat(style.borderBottomWidth),
              }
            })
          )
        expect(geometry.length).toBeGreaterThan(0)
        for (const badge of geometry) {
          expect(badge.right).toBeGreaterThanOrEqual(1)
          expect(badge.right).toBeLessThanOrEqual(1.5)
          expect(badge.bottom).toBeGreaterThanOrEqual(0)
          expect(badge.bottom).toBeLessThanOrEqual(0.5)
        }
      }
      await assertBadgeEdges()
      await expect(
        gallery.getByTestId('canonical-metric-value').first()
      ).toHaveCSS('font-size', '16px')
      await expect(
        gallery.getByTestId('canonical-metric-value').first()
      ).toHaveCSS('font-weight', '300')
      await expect(
        gallery.locator('[data-slot="performance-value"]').first()
      ).toHaveCSS('font-weight', '300')
      await expect(
        gallery.locator('[data-slot="entity-identity-name"]')
      ).toHaveCSS('font-weight', '500')
      await gallery.evaluate((el) => {
        el.style.scrollMarginTop = '160px'
        el.scrollIntoView({ block: 'start' })
      })
      const examples = await gallery
        .locator('[data-slot="cell-example"]')
        .evaluateAll((items) =>
          items.map((el) => {
            const box = el.getBoundingClientRect()
            return {
              height: box.height,
              center: box.y + box.height / 2,
              children: [...el.children].map((child) => {
                const box = child.getBoundingClientRect()
                return box.y + box.height / 2
              }),
            }
          })
        )
      for (const example of examples) {
        expect(example.height).toBe(80)
        for (const center of example.children)
          expect(Math.abs(center - example.center)).toBeLessThanOrEqual(1)
      }
      await page.screenshot({
        path: `/private/tmp/table-chrome-${theme}-${width}-cells.png`,
        animations: 'disabled',
      })
      const controls = page.getByTestId('table-review-controls')
      await controls.evaluate((el) => {
        el.style.scrollMarginTop = '160px'
        el.scrollIntoView({ block: 'start' })
      })
      await page.screenshot({
        path: `/private/tmp/table-chrome-${theme}-${width}-controls.png`,
        animations: 'disabled',
      })
      await page.getByTestId('table-state-yield').focus()
      await page.keyboard.press('Enter')
      await choosePreview('pressure')
      await expect(page.getByTestId('table-state-yield')).toHaveAttribute(
        'aria-selected',
        'true'
      )
      await expect(page.getByTestId('table-family-positions')).toContainText(
        'Electronic Dollar with an unusually long display name'
      )
      await choosePreview('default')
      await page.getByTestId('table-family-index').click()
      const positions = page.getByTestId('table-family-positions')
      const withdrawals = page.getByTestId('table-family-withdrawals')
      const browse = positions.locator('a[data-link-treatment="standalone"]')
      await browse.hover()
      await expect.soft(browse).toHaveCSS('text-decoration-line', 'underline')
      await page.mouse.move(0, 0)
      await expect(browse).toHaveCSS('text-decoration-line', 'none')
      await expect
        .soft(positions.locator('h3').locator('../..'))
        .toHaveCSS('align-items', 'baseline')
      const setCollapsedSort = async (
        id: string,
        direction: 'asc' | 'desc'
      ) => {
        const trigger = positions.getByTestId('table-sort-menu')
        await trigger.click()
        const menu = page.getByTestId('table-sort-options')
        await expect(menu).toBeVisible()
        const menuBox = await menu.boundingBox()
        expect(menuBox!.x).toBeGreaterThanOrEqual(0)
        expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(
          page.viewportSize()!.width
        )
        await page.screenshot({
          path: `/private/tmp/table-sort-menu-${theme}-${width}.png`,
          animations: 'disabled',
        })
        await page.getByTestId(`table-sort-field-${id}`).click()
        await expect(trigger).toBeFocused()
        await page.keyboard.press('Enter')
        await page.getByTestId(`table-sort-direction-${direction}`).click()
        await expect(trigger).toBeFocused()
        await expect(trigger).toHaveAccessibleDescription(
          direction === 'asc' ? 'ascending' : 'descending'
        )
      }
      const capture = async (name: string, target = positions) => {
        const actions = await target
          .locator('button[data-testid^="withdraw-"]:visible')
          .evaluateAll((buttons) =>
            buttons.map((button) => {
              const box = button.getBoundingClientRect()
              const logo = [
                ...button
                  .closest('tr')!
                  .querySelectorAll(
                    '[data-testid="canonical-chain-badged-logo"] img'
                  ),
              ]
                .find((image) => image.getBoundingClientRect().width > 0)!
                .getBoundingClientRect()
              return {
                height: box.height,
                center: box.y + box.height / 2,
                logoCenter: logo.y + logo.height / 2,
              }
            })
          )
        for (const action of actions) {
          expect(action.height).toBe(32)
          expect(action.center).toBeCloseTo(action.logoCenter, 1)
        }
        const supportingLines = await target
          .locator('[data-slot="entity-identity-supporting"]:visible')
          .evaluateAll((lines) =>
            lines.map((line) => {
              const control = line.querySelector('a, button')
              const textOffset = (node: Node, parent: Element) => {
                const range = document.createRange()
                range.selectNodeContents(node)
                return (
                  range.getBoundingClientRect().top -
                  parent.getBoundingClientRect().top
                )
              }
              let offsets: number[] = []
              if (control?.firstChild) {
                const plain = line.cloneNode(false) as HTMLElement
                plain.textContent = control.firstChild.textContent
                plain.style.cssText = 'position:absolute;visibility:hidden'
                line.parentElement!.appendChild(plain)
                offsets = [
                  textOffset(control.firstChild, line),
                  textOffset(plain.firstChild!, plain),
                ]
                plain.remove()
              }
              return {
                height: line.getBoundingClientRect().height,
                lineHeight: parseFloat(getComputedStyle(line).lineHeight),
                offsets,
              }
            })
          )
        for (const line of supportingLines) {
          expect(line.height).toBeCloseTo(line.lineHeight, 1)
          if (line.offsets.length)
            expect(line.offsets[0]).toBeCloseTo(line.offsets[1], 1)
        }
        if (name !== 'loading') {
          const records = await target.locator('tbody tr').evaluateAll((rows) =>
            rows.flatMap((row) => {
              const cells = [...row.querySelectorAll('td')].filter(
                (cell) => cell.getBoundingClientRect().width > 0
              )
              if (cells.length !== 1) return []
              const cell = cells[0]
              const identity = cell
                .querySelector('[data-testid="canonical-entity-identity"]')!
                .getBoundingClientRect()
              const facts = ['Balance', 'Value'].map((name) => {
                const label = [...cell.querySelectorAll('span')].find(
                  (span) => span.textContent === name
                )!
                const value = label.parentElement!.querySelector(
                  '[data-testid="canonical-metric-value"]'
                )!
                return {
                  label: label.getBoundingClientRect().toJSON(),
                  value: value.getBoundingClientRect().toJSON(),
                }
              })
              const status = cell
                .querySelector('[data-testid^="withdrawal-"]')
                ?.getBoundingClientRect()
              return [
                {
                  identity: identity.toJSON(),
                  facts,
                  status: status?.toJSON(),
                },
              ]
            })
          )
          for (const record of records) {
            for (const fact of record.facts) {
              expect(fact.label.top).toBeGreaterThanOrEqual(
                record.identity.bottom + 15
              )
              expect(fact.value.top).toBeGreaterThanOrEqual(fact.label.bottom)
            }
            if (record.status)
              expect(record.status.bottom).toBeLessThanOrEqual(
                record.facts[0].label.top - 15
              )
          }
          await info.attach(`${name}-record-hierarchy`, {
            body: Buffer.from(JSON.stringify(records)),
            contentType: 'application/json',
          })
        }
        const header = target.locator('thead tr')
        const collapsed =
          (await target.locator('tbody tr:first-child td:visible').count()) ===
          1
        if (collapsed) {
          await expect(target.locator('thead')).toBeHidden()
          const seamInsets = await target
            .locator('[data-slot="row-seam"]:visible')
            .evaluateAll((seams) =>
              seams.map((seam) => {
                const line = seam.getBoundingClientRect()
                const cell = seam.closest('td')!.getBoundingClientRect()
                return {
                  bottom:
                    line.bottom -
                    seam.parentElement!.getBoundingClientRect().bottom,
                  left: line.left - cell.left,
                  right: cell.right - line.right,
                }
              })
            )
          for (const inset of seamInsets) {
            expect(inset.bottom).toBeCloseTo(24, 0)
            expect(inset.left).toBeCloseTo(24, 0)
            expect(inset.right).toBeCloseTo(0, 0)
          }
        } else {
          await expect(target.locator('thead')).toBeVisible()
        }
        await expect(header).toHaveCSS('border-bottom-width', '0px')
        const spacing = await target.evaluate((el) => {
          const visible = (cells: NodeListOf<Element>) =>
            [...cells].filter((cell) => cell.getBoundingClientRect().width > 0)
          const heads = visible(el.querySelectorAll('th'))
          const first = visible(el.querySelectorAll('tbody tr:first-child td'))
          return {
            headers: heads.map((head) => {
              const style = getComputedStyle(head)
              return {
                padding: style.paddingBottom,
                height: head.getBoundingClientRect().height,
                content:
                  head.firstElementChild?.getBoundingClientRect().height ??
                  parseFloat(style.lineHeight),
              }
            }),
            rowPadding: first.map((cell) => ({
              top: getComputedStyle(cell).paddingTop,
              bottom: getComputedStyle(cell).paddingBottom,
            })),
          }
        })
        for (const header of spacing.headers) {
          expect(header.padding).toBe('16px')
          expect(header.height).toBeCloseTo(header.content + 16, 0)
        }
        for (const padding of spacing.rowPadding) {
          const inset = spacing.rowPadding.length === 1 ? '24px' : '16px'
          expect(padding.top).toBe(inset)
          expect(padding.bottom).toBe(inset)
        }
        await target.evaluate((el) => {
          el.style.scrollMarginTop = '160px'
          el.scrollIntoView({ block: 'start' })
        })
        await expect(target.locator('h3')).toBeInViewport()
        if (
          name !== 'loading' &&
          target === positions &&
          !name.startsWith('yield')
        ) {
          await expect(
            target.locator('img[src="/imgs/cmc20.png"]:visible').first()
          ).toBeVisible()
          await expect
            .poll(() =>
              target.locator('img:visible').evaluateAll((images) =>
                images.every((image) => {
                  const img = image as HTMLImageElement
                  return (
                    img.complete &&
                    img.naturalWidth > 0 &&
                    getComputedStyle(img).opacity === '1'
                  )
                })
              )
            )
            .toBe(true)
        }
        await info.attach(name, {
          body: await page.screenshot({
            animations: 'disabled',
            path: `/private/tmp/table-lab-${theme}-${width}-${name}.png`,
          }),
          contentType: 'image/png',
        })
        const boxes = await target.evaluate((el) => ({
          width: el.clientWidth,
          scroll: el.scrollWidth,
          table: el.querySelector('table')!.getBoundingClientRect().width,
          cells: [...el.querySelectorAll('td')]
            .filter((cell) => cell.getBoundingClientRect().width > 0)
            .map((cell) => ({
              width: cell.clientWidth,
              scroll: cell.scrollWidth,
              text: cell.textContent,
            })),
        }))
        expect(boxes.scroll).toBeLessThanOrEqual(boxes.width + 1)
        for (const cell of boxes.cells)
          expect(cell.scroll, cell.text ?? '').toBeLessThanOrEqual(
            cell.width + 1
          )
        await info.attach(`${name}-geometry`, {
          body: Buffer.from(JSON.stringify(boxes)),
          contentType: 'application/json',
        })
      }
      await capture('positions')
      await capture('withdrawals', withdrawals)
      const positionLink = positions.locator('tbody a:visible').first()
      const destination = new URL(
        (await positionLink.getAttribute('href'))!,
        page.url()
      ).href
      await page.context().route(destination, (route) =>
        route.fulfill({
          contentType: 'text/html',
          body: '<title>Destination fixture</title>',
        })
      )
      const opened: string[] = []
      page.on('popup', (popup) => opened.push(popup.url()))
      await positionLink.focus()
      const popupPromise = page.waitForEvent('popup')
      await page.keyboard.press('Enter')
      const popup = await popupPromise
      await expect(popup).toHaveURL(destination)
      await popup.close()
      await expect(positionLink).toBeFocused()
      expect(opened).toHaveLength(1)
      const retainedRow = await positions
        .locator('tbody tr')
        .first()
        .elementHandle()
      const retainedOrder = await positions
        .locator('tbody tr')
        .allTextContents()
      const expand = positions.getByTestId('table-expand')
      await expand.focus()
      await page.keyboard.press('Enter')
      await expect(expand).toBeFocused()
      await expect(positions.locator('tbody tr')).toHaveCount(6)
      expect(
        (await positions.locator('tbody tr').allTextContents()).slice(0, 5)
      ).toEqual(retainedOrder)
      await expect(
        positions.locator('img[src="/imgs/socials/zindex.png"]:visible').first()
      ).toBeVisible()
      expect(await retainedRow!.evaluate((el) => el.isConnected)).toBe(true)
      await page.keyboard.press('Enter')
      await expect(expand).toBeFocused()
      await expect(positions.locator('tbody tr')).toHaveCount(5)
      const valueSort =
        width < 1024
          ? positions.getByTestId('table-sort-menu')
          : positions.getByTestId('sort-value')
      await expect(valueSort).toHaveAccessibleDescription('descending')
      if (width < 1024) await setCollapsedSort('value', 'asc')
      else {
        await valueSort.focus()
        await page.keyboard.press('Enter')
      }
      await expect(valueSort).toBeFocused()
      await expect(valueSort).toHaveAccessibleDescription('ascending')
      await expect(positions.locator('tbody tr').first()).toContainText(
        'Reserve AI Photonics DTF'
      )
      if (width < 1024) await setCollapsedSort('value', 'desc')
      else await page.keyboard.press('Enter')
      if (width < 640) {
        await page.setViewportSize({
          width: width === 320 ? 375 : 320,
          height: 900,
        })
        await expect(valueSort).toBeFocused()
        await page.setViewportSize({ width, height: 900 })
      }
      const mobile = !(await page
        .getByTestId('withdraw-staked-ready')
        .isVisible())
      const suffix = mobile ? '-mobile' : ''
      const pending = page.getByTestId(`withdraw-staked-pending${suffix}`)
      const ready = page.getByTestId(`withdraw-staked-ready${suffix}`)
      const withdrawal = page.getByTestId(`withdrawal-staked-ready${suffix}`)
      const sourceAction = page.getByTestId(`source-lock-ready${suffix}`)
      await expect(sourceAction).toHaveCSS(
        'font-size',
        mobile ? '14px' : '16px'
      )
      await expect(sourceAction).toHaveCSS('font-weight', '300')
      const foreground = await withdrawals
        .locator('h3')
        .evaluate((el) => getComputedStyle(el).color)
      await expect(sourceAction).toHaveCSS('color', foreground)
      await sourceAction.focus()
      await expect(sourceAction).toBeFocused()
      await expect(sourceAction).toHaveCSS('outline-style', 'solid')
      await page.keyboard.press('Enter')
      await expect(page.getByTestId('table-source-preview')).toBeVisible()
      await expect(ready).not.toHaveAttribute('aria-busy', 'true')
      const readyBox = await ready.boundingBox()
      expect(readyBox!.height).toBe(32)
      const assertContentWidth = async () => {
        const dimensions = await ready.evaluate((button) => {
          const probe = button.cloneNode(true) as HTMLElement
          probe.style.cssText =
            'position:absolute;visibility:hidden;width:max-content;min-width:0;max-width:none'
          probe.setAttribute('aria-hidden', 'true')
          button.parentElement!.appendChild(probe)
          const intrinsic = probe.getBoundingClientRect().width
          probe.remove()
          return { actual: button.getBoundingClientRect().width, intrinsic }
        })
        expect(dimensions.actual).toBeCloseTo(dimensions.intrinsic, 1)
        const box = (await ready.boundingBox())!
        expect(box.x + box.width).toBeCloseTo(readyBox!.x + readyBox!.width, 1)
      }
      await assertContentWidth()
      if (!mobile) {
        const gaps = await withdrawals.locator('tbody tr').evaluateAll((rows) =>
          rows.map((row) => {
            const cells = [...row.querySelectorAll('td')].filter(
              (cell) => cell.getBoundingClientRect().width > 0
            )
            const value = cells[3]
              .querySelector('[data-testid="canonical-metric-value"]')!
              .getBoundingClientRect()
            const progress = cells[4].firstElementChild!.getBoundingClientRect()
            return progress.left - value.right
          })
        )
        for (const gap of gaps) expect(gap).toBeGreaterThanOrEqual(24)
      }
      await expect(pending).toHaveCount(0)
      await expect(
        page.getByTestId(`withdrawal-staked-pending${suffix}`)
      ).toHaveText('Available in 13d')
      const assertFeedbackGeometry = async () => {
        const box = (await withdrawal.boundingBox())!
        expect(box.height).toBe(readyBox!.height)
        if (!mobile)
          expect(box.x + box.width).toBeCloseTo(
            readyBox!.x + readyBox!.width,
            1
          )
        else {
          const cell = withdrawal.locator('xpath=ancestor::td')
          const cellBox = (await cell.boundingBox())!
          const identity = (await cell
            .getByTestId('canonical-entity-identity')
            .boundingBox())!
          if (box.y >= identity.y + identity.height)
            expect(box.x).toBeCloseTo(cellBox.x + 24, 1)
          else
            expect(box.x + box.width).toBeCloseTo(
              cellBox.x + cellBox.width - 24,
              1
            )
        }
      }
      await ready.focus()
      await page.keyboard.press('Enter')
      await expect(ready).toHaveCount(0)
      await expect(withdrawal).toHaveText('Withdrawing…')
      await expect(withdrawal).toBeFocused()
      await assertFeedbackGeometry()
      await capture('withdrawals-processing', withdrawals)
      await page.getByTestId('table-simulate-receipt').click()
      await expect(ready).toHaveCount(0)
      await expect(withdrawal).toHaveText('Withdrawn')
      await assertFeedbackGeometry()
      await capture('withdrawals-complete', withdrawals)
      await page.getByTestId('table-deadline').click()
      await expect(pending).toBeEnabled()
      await choosePreview('pressure')
      await capture('long-content')
      await choosePreview('loading')
      await expect(positions).toHaveAttribute('aria-busy', 'true')
      await capture('loading')
      await choosePreview('default')
      await page.getByTestId('table-state-yield').click()
      await capture('yield')
      await choosePreview('pressure')
      await capture('yield-long-content')
      await choosePreview('default')
      await page.getByTestId('table-family-index').click()
      if (width === 1400) {
        const compositions = page.getByTestId('table-family-compositions')
        for (const width of [639, 640, 1023, 1024]) {
          await compositions.evaluate((el, width) => {
            el.style.width = `${width}px`
          }, width)
          await capture(`boundary-${width}`)
          await capture(`withdrawals-boundary-${width}`, withdrawals)
          const sortMenu = positions.getByTestId('table-sort-menu')
          if (width >= 640 && width < 1024) {
            for (const [id, firstName] of [
              ['performance', 'CoinMarketCap 20 Index DTF'],
              ['pnl', 'CoinMarketCap 20 Index DTF'],
              ['cost', 'Open Stablecoin Index'],
              ['cap', 'CoinMarketCap 20 Index DTF'],
            ]) {
              await setCollapsedSort(id, 'asc')
              await expect(positions.locator('tbody tr').first()).toContainText(
                firstName
              )
            }
            await setCollapsedSort('value', 'desc')
          } else {
            if (width < 1024) await expect(sortMenu).toBeVisible()
            else await expect(sortMenu).toBeHidden()
          }
          await expect(
            page.getByTestId('withdraw-staked-ready-mobile')
          ).toHaveCount(1)
        }
        await compositions.evaluate((el) => {
          el.style.width = ''
        })
        await page.getByTestId('table-constrain').click()
        await expect(
          page.getByTestId('withdraw-staked-ready-mobile')
        ).toBeVisible()
        await capture('constrained')
        await capture('withdrawals-constrained', withdrawals)
        await choosePreview('pressure')
        await capture('constrained-long-content')
        await page.getByTestId('table-state-yield').click()
        await capture('yield-constrained-long-content')
        await choosePreview('default')
        await capture('yield-constrained')
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(width)
      expect(txLog).toHaveLength(0)
      if (width === 1400) {
        await page.goto('/internal/design-system/components/entity-identity')
        const identities = page.getByTestId('entity-identity-state-sheet')
        await expect(identities).toBeVisible()
        await assertBadgeEdges()
        await identities.scrollIntoViewIfNeeded()
        await page.screenshot({
          path: `/private/tmp/chain-badge-${theme}-identities.png`,
          animations: 'disabled',
        })
      }
    })
  }
}

test.describe('Retina chain badges', () => {
  test.use({ deviceScaleFactor: 2 })
  for (const theme of ['light', 'dark']) {
    test(`chain badge borders ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 1400, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto('/internal/design-system/components/entity-identity')
      const sheet = page.getByTestId('entity-identity-state-sheet')
      await expect(sheet).toBeVisible()
      const geometry = await sheet
        .getByTestId('canonical-chain-badged-logo')
        .evaluateAll((marks) =>
          marks.map((mark) => {
            const token = mark.querySelector('img')!.getBoundingClientRect()
            const badge = mark.querySelector(
              '[data-testid="canonical-chain-badge"]'
            )!
            const box = badge.getBoundingClientRect()
            const border = parseFloat(getComputedStyle(badge).borderRightWidth)
            return {
              width: box.width,
              border,
              right: box.right - token.right - border,
              bottom: box.bottom - token.bottom - border,
            }
          })
        )
      expect(geometry.length).toBeGreaterThan(0)
      for (const badge of geometry) {
        if (badge.width === 16) expect(badge.border).toBe(2)
        else expect([1, 1.5]).toContain(badge.border)
        expect(badge.right).toBeGreaterThanOrEqual(1)
        expect(badge.right).toBeLessThanOrEqual(1.5)
        expect(badge.bottom).toBeGreaterThanOrEqual(0)
        expect(badge.bottom).toBeLessThanOrEqual(0.5)
      }
      await sheet.scrollIntoViewIfNeeded()
      await page.screenshot({
        path: `/private/tmp/chain-badge-${theme}-retina.png`,
        animations: 'disabled',
      })
    })
  }
})
