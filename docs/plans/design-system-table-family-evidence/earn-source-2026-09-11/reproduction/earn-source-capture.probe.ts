import { test, expect, connectWallet } from '../../../../../e2e/fixtures/wallet'
import { encodeAbiParameters, encodeFunctionData, erc20Abi } from 'viem'
import { TEST_ADDRESS } from '../../../../../e2e/helpers/registry'
import { setYieldReplay } from '../../../../../e2e/helpers/rpc'
import { seedEarnSource, sourceDaos, sourceLcap } from './earn-source-data'
import {
  readReviewSource,
  assertUnchangedSource,
  watchReviewSource,
} from '../../../../../e2e/design-system/review-source'

test.use({ actionTimeout: 10_000, navigationTimeout: 20_000 })

test.beforeEach(({ overrides }) => {
  seedEarnSource(overrides)
})

for (const theme of ['light', 'dark']) {
  for (const width of [390, 1400]) {
    test(`Earn source ${theme} ${width}`, async ({ page, txLog }, info) => {
      const source = readReviewSource(process.cwd())
      const guard = watchReviewSource(process.cwd())
      try {
        await page.setViewportSize({ width, height: 900 })
        await page.addInitScript(
          (mode) => localStorage.setItem('theme-ui-color-mode', mode),
          theme
        )
        await page.goto('/earn/index-dtf')
        const surface = page.getByTestId('earn-index-dtf')
        const rows = surface.locator('tbody tr')
        await expect(rows).toHaveCount(sourceDaos.length)
        await expect(rows.first()).toContainText('vlRSR')
        await surface.locator('table').scrollIntoViewIfNeeded()
        await page.evaluate(() => document.fonts.ready)
        await info.attach('index-default', {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        })
        const shared = rows.filter({
          has: page.locator('td:nth-child(3) button'),
        })
        const governed = shared.locator('td').nth(2).locator('button')
        await governed.focus()
        await page.keyboard.press('Enter')
        const disclosure = page
          .locator('[data-radix-popper-content-wrapper]')
          .filter({ hasText: 'NEOCLOUD' })
        await expect(disclosure).toBeVisible()
        await expect(disclosure.locator('a')).toHaveCount(4)
        await info.attach('governed-open', {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        })
        await page.keyboard.press('Escape')
        const lcap = rows.filter({ hasText: sourceLcap.token.symbol })
        const help = lcap.locator('td').last().locator('button')
        await help.click()
        await expect(
          surface
            .locator('[data-state="open"]')
            .filter({ hasText: 'The displayed rate estimates' })
            .last()
        ).toBeVisible()
        await info.attach('rate-explanation', {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        })
        await lcap.locator('td').first().click()
        await expect(page.getByTestId('vote-lock-tab-lock')).toBeVisible()
        await info.attach('index-drawer', {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        })
        await page.keyboard.press('Escape')
        await expect(page.getByTestId('vote-lock-tab-lock')).toBeHidden()
        await page.goto('/earn/yield-dtf')
        const yieldSurface = page.getByTestId('earn-yield-dtf')
        const yieldRows = yieldSurface.locator('tbody tr')
        await expect(yieldRows).toHaveCount(2)
        await expect(yieldRows.first()).toContainText('RSR')
        await yieldSurface.locator('table').scrollIntoViewIfNeeded()
        await info.attach('yield-default', {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        })
        setYieldReplay(1)
        await yieldRows
          .filter({ hasText: 'eusdRSR' })
          .locator('td')
          .first()
          .click()
        await expect(page.getByRole('dialog')).toBeVisible()
        await info.attach('yield-drawer', {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        })
        await page.keyboard.press('Escape')
        expect(txLog).toHaveLength(0)
      } finally {
        guard.close()
        assertUnchangedSource(source, readReviewSource(process.cwd()), [
          ...guard.changes,
        ])
        await info.attach('public-source-digest', {
          body: Buffer.from(source.digest),
          contentType: 'text/plain',
        })
      }
    })
  }
}

test('Earn source wallet holdings', async ({
  page,
  overrides,
  txLog,
}, info) => {
  const source = readReviewSource(process.cwd())
  overrides.ethCall(
    sourceLcap.token.address,
    encodeFunctionData({
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [TEST_ADDRESS],
    }),
    encodeAbiParameters([{ type: 'uint256' }], [12345n * 10n ** 18n])
  )
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/earn/index-dtf')
  await connectWallet(page)
  const surface = page.getByTestId('earn-index-dtf')
  const row = surface
    .locator('tbody tr')
    .filter({ hasText: sourceLcap.token.symbol })
  await expect(row.locator('td')).toHaveCount(5)
  await expect(row.locator('td').nth(2)).toContainText('12,345')
  await row.scrollIntoViewIfNeeded()
  await info.attach('wallet-holdings', {
    body: await page.screenshot({ animations: 'disabled' }),
    contentType: 'image/png',
  })
  expect(txLog).toHaveLength(0)
  assertUnchangedSource(source, readReviewSource(process.cwd()))
  await info.attach('public-source-digest', {
    body: Buffer.from(source.digest),
    contentType: 'text/plain',
  })
})
