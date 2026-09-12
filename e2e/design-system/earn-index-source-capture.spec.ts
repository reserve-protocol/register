import { test, expect } from '../fixtures/base'
import { seedIndexEarn, sourceDaos, sourceLcap } from './earn-source-data'
import { readReviewSource, assertUnchangedSource } from './review-source'

test.use({ actionTimeout: 10_000, navigationTimeout: 20_000 })

for (const theme of ['light', 'dark']) {
  for (const width of [390, 1400]) {
    test(`Earn Index list ${theme} ${width}`, async ({
      page,
      overrides,
      txLog,
    }, info) => {
      const source = readReviewSource(process.cwd())
      seedIndexEarn(overrides)
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript((mode) => {
        localStorage.setItem('theme-ui-color-mode', mode)
      }, theme)
      await page.goto('/earn/index-dtf')
      const surface = page.getByTestId('earn-index-dtf')
      const rows = surface.locator('tbody tr')
      await expect(rows).toHaveCount(sourceDaos.length)
      for (const item of sourceDaos)
        await expect(
          rows.filter({ hasText: item.token.symbol })
        ).not.toHaveCount(0)
      await expect(rows.first().locator('td')).toHaveCount(4)
      const highestRate = [...sourceDaos].sort((a, b) => b.apr - a.apr)[0]
      await expect(rows.first()).toContainText(highestRate.token.symbol)
      await expect(rows.first().locator('td').nth(1)).toContainText(
        Math.round(highestRate.lockedAmountUsd).toLocaleString('en-US')
      )
      await surface.locator('table').scrollIntoViewIfNeeded()
      await page.evaluate(() => document.fonts.ready)
      await info.attach('index-default', {
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
  }
}

for (const width of [390, 1400]) {
  test(`Earn Index loading and empty ${width}`, async ({
    page,
    overrides,
    txLog,
  }, info) => {
    const source = readReviewSource(process.cwd())
    seedIndexEarn(overrides)
    const request = overrides.holds.add({
      boundary: 'api',
      pathname: '/dtf/daos',
    })
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/earn/index-dtf')
    await expect.poll(() => request.hits).toBeGreaterThan(0)
    const surface = page.getByTestId('earn-index-dtf')
    const rows = surface.locator('tbody tr')
    await expect(rows).toHaveCount(5)
    await expect(rows.first()).not.toContainText('vlRSR')
    await surface.locator('table').scrollIntoViewIfNeeded()
    await info.attach('index-loading', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    request.release()
    await expect(rows).toHaveCount(4)
    await surface.getByRole('textbox').fill('no-matching-fixture-asset')
    await expect(rows).toHaveCount(1)
    await expect(rows.locator('td')).toHaveAttribute('colspan', '4')
    await info.attach('index-empty-filter', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    await surface.getByRole('textbox').clear()
    await expect(rows).toHaveCount(4)
    expect(txLog).toHaveLength(0)
    assertUnchangedSource(source, readReviewSource(process.cwd()))
    await info.attach('public-source-digest', {
      body: Buffer.from(source.digest),
      contentType: 'text/plain',
    })
  })
}

for (const width of [390, 1400]) {
  test(`Earn Index disclosure and help ${width}`, async ({
    page,
    overrides,
    txLog,
  }, info) => {
    const source = readReviewSource(process.cwd())
    seedIndexEarn(overrides)
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/earn/index-dtf')
    const surface = page.getByTestId('earn-index-dtf')
    const rows = surface.locator('tbody tr')
    await expect(rows).toHaveCount(4)
    const trigger = rows.locator('td:nth-child(3) button')
    await expect(trigger).toHaveCount(1)
    await trigger.focus()
    const disclosure = page
      .locator('[data-radix-popper-content-wrapper]')
      .filter({ has: page.locator('a') })
    await expect(disclosure).toBeVisible()
    await expect(disclosure.locator('a')).toHaveCount(4)
    await info.attach('governed-open', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    const hrefs = await disclosure
      .locator('a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')))
    expect(hrefs.every((href) => href?.startsWith('/bsc/index-dtf/'))).toBe(
      true
    )
    await page.keyboard.press('Escape')
    await expect(disclosure).toBeHidden()
    const help = rows
      .filter({ hasText: sourceLcap.token.symbol })
      .locator('td')
      .last()
      .locator('button')
    await help.focus()
    await page.keyboard.press('Enter')
    const answer = surface.locator('[role="region"][data-state="open"]')
    await expect(answer).toContainText('approximately the last 30 days')
    await expect(page.getByTestId('vote-lock-tab-lock')).toBeHidden()
    await answer.scrollIntoViewIfNeeded()
    await info.attach('rate-explanation', {
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
}
