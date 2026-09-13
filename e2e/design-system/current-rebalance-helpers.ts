import {
  expect,
  type Page,
  type Locator,
  type TestInfo,
} from '@playwright/test'
import { test as base } from '../fixtures/base'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  readReviewSource,
  watchReviewSource,
  assertUnchangedSource,
} from './review-source'

export { expect }
export const test = base.extend<{ currentSource: void }>({
  currentSource: [
    async ({ baseURL }, use, info) => {
      const source = readReviewSource(process.cwd())
      const guard = watchReviewSource(process.cwd())
      try {
        await use()
      } finally {
        guard.close()
        assertUnchangedSource(source, readReviewSource(process.cwd()), [
          ...guard.changes,
        ])
        await info.attach('current-source', {
          body: JSON.stringify({ baseURL, ...source }),
          contentType: 'application/json',
        })
      }
    },
    { auto: true },
  ],
})
test.use({ actionTimeout: 10000 })

export async function currentSelect(
  page: Page,
  control: string,
  value: string
) {
  const trigger = page.getByTestId(`current-${control}`)
  if (!(await trigger.isVisible()))
    await page.getByText('Data and simulation', { exact: true }).click()
  await trigger.click()
  await page.getByTestId(`current-${control}-${value}`).click()
}

export async function currentCapture(
  page: Page,
  target: Locator,
  info: TestInfo,
  name: string
) {
  await target.evaluate((el) => {
    el.scrollIntoView({ block: 'start' })
    let parent = el.parentElement
    while (parent) {
      if (
        parent.scrollHeight > parent.clientHeight &&
        ['auto', 'scroll'].includes(getComputedStyle(parent).overflowY)
      ) {
        parent.scrollTop -= 85
        break
      }
      parent = parent.parentElement
    }
  })
  await page.mouse.move(0, 0)
  const directory = resolve(
    process.env.CURRENT_REBALANCE_CAPTURE_DIR ||
      'docs/plans/design-system-current-rebalance-workspace-evidence/final'
  )
  mkdirSync(directory, { recursive: true })
  await info.attach(name, {
    body: await page.screenshot({
      animations: 'disabled',
      path: resolve(directory, `${name}.png`),
    }),
    contentType: 'image/png',
  })
}

export async function realTarget(target: Locator) {
  await target.scrollIntoViewIfNeeded()
  const measure = () =>
    target.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      const x = rect.x + rect.width / 2
      return {
        height: rect.height,
        top: el.contains(document.elementFromPoint(x, rect.y + 2)),
        middle: el.contains(
          document.elementFromPoint(x, rect.y + rect.height / 2)
        ),
        bottom: el.contains(document.elementFromPoint(x, rect.bottom - 2)),
      }
    })
  await expect
    .poll(async () => {
      const { top, middle, bottom } = await measure()
      return { top, middle, bottom }
    })
    .toEqual({ top: true, middle: true, bottom: true })
  const measured = await measure()
  expect(measured.height).toBeGreaterThanOrEqual(44)
  expect(measured).toMatchObject({ top: true, middle: true, bottom: true })
}
