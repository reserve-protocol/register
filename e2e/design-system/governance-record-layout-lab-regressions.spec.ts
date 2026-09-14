import { test, expect, currentCapture } from './current-rebalance-helpers'

for (const theme of ['light', 'dark']) {
  test(`governance narrow grouping ${theme}`, async ({ page, txLog }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto('/internal/design-system/components/table')
    const records = page.locator('[data-record-kind="governance"]')
    await expect(records).toHaveCount(13)
    await page.evaluate(() => document.fonts.ready)
    const content = await records.allTextContents()
    for (const width of [320, 390, 527, 528, 767, 768, 1400]) {
      await page.setViewportSize({ width, height: 900 })
      const contested = records.filter({
        has: page.locator('[data-proposal-qualifier="contested"]'),
      })
      await currentCapture(
        page,
        contested,
        info,
        `governance-layout-${theme}-${width}`
      )
      for (const record of await records.all()) {
        const geometry = await record.evaluate((el) => {
          const box = el.getBoundingClientRect()
          const style = getComputedStyle(el)
          const available =
            box.width -
            parseFloat(style.paddingLeft) -
            parseFloat(style.paddingRight)
          const title = el.querySelector('h4')!.getBoundingClientRect()
          const qualifier = el
            .querySelector('[data-proposal-qualifier]')
            ?.getBoundingClientRect()
          const quorum = el
            .querySelector(
              '[data-decision-evidence="standard"] [data-testid="proposal-evidence-value"]'
            )
            ?.getBoundingClientRect()
          const votes = el
            .querySelector('[data-testid="proposal-vote-distribution"]')
            ?.getBoundingClientRect()
          const divider = el
            .querySelector('[data-testid="proposal-evidence-divider"]')
            ?.getBoundingClientRect()
          const evidence = el
            .querySelector('[data-decision-evidence]')
            ?.getBoundingClientRect()
          const statuses = el
            .querySelector('[data-testid="lifecycle-status-pill"]')
            ?.parentElement?.getBoundingClientRect()
          return {
            available,
            titleWidth: title.width,
            qualifierAbove: !qualifier || qualifier.bottom <= title.top - 7,
            dividerVisible: !!divider?.height,
            evidenceAligned:
              !quorum || !votes || Math.abs(quorum.y - votes.y) < 1,
            evidenceFollowsStatus:
              !evidence || !statuses || evidence.top >= statuses.bottom + 15,
            overflow: el.scrollWidth - el.clientWidth,
          }
        })
        expect.soft(geometry.overflow).toBeLessThanOrEqual(1)
        if (geometry.available < 448) {
          expect
            .soft(
              geometry.evidenceFollowsStatus,
              'narrow evidence follows status'
            )
            .toBe(true)
          expect
            .soft(
              geometry.qualifierAbove,
              'qualifier precedes the full-width narrow title'
            )
            .toBe(true)
          if (await record.locator('[data-proposal-qualifier]').count())
            expect.soft(geometry.titleWidth).toBeCloseTo(geometry.available, 0)
          expect
            .soft(
              geometry.dividerVisible,
              'no orphan evidence divider in stacked layout'
            )
            .toBe(false)
        } else if (
          await record.locator('[data-decision-evidence="standard"]').count()
        ) {
          expect.soft(geometry.dividerVisible).toBe(true)
          expect.soft(geometry.evidenceAligned).toBe(true)
        }
      }
      expect(await records.allTextContents()).toEqual(content)
    }
    expect(txLog).toHaveLength(0)
  })

  test(`governance constrained control and hover ${theme}`, async ({
    page,
    txLog,
  }, info) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto('/internal/design-system/components/table')
    const section = page.locator(
      '[aria-labelledby="proposal-record-review-title"]'
    )
    const records = section.locator('[data-record-kind="governance"]')
    await expect(records).toHaveCount(13)
    const content = await records.allTextContents()
    const earn = page.getByTestId('earn-composition')
    const earnWidth = (await earn.boundingBox())!.width
    const control = section.getByRole('switch', {
      name: 'Constrained proposal column',
    })
    await expect(control).toBeVisible()
    await control.focus()
    await page.keyboard.press('Space')
    await expect(control).toBeChecked()
    await expect(records).toHaveCount(13)
    expect((await records.first().boundingBox())!.width).toBe(390)
    expect((await earn.boundingBox())!.width).toBe(earnWidth)
    const active = records
      .filter({ has: page.locator('[data-decision-evidence="standard"]') })
      .first()
    const quorum = active.getByTestId('proposal-evidence-value')
    const votes = active.getByTestId('proposal-vote-distribution')
    const quorumBox = (await quorum.boundingBox())!
    const votesBox = (await votes.boundingBox())!
    expect(votesBox.x).toBeGreaterThan(quorumBox.x + quorumBox.width)
    expect(votesBox.y).toBeCloseTo(
      quorumBox.y + quorumBox.height - votesBox.height,
      0
    )
    await expect(active.getByText('Votes', { exact: true })).toBeVisible()
    await currentCapture(page, active, info, `governance-constrained-${theme}`)
    await active.hover()
    const hover = await active.evaluate((el) => {
      const row = getComputedStyle(el)
      const parent = getComputedStyle(el.parentElement!)
      return {
        background: row.backgroundColor,
        parent: parent.backgroundColor,
        card: row.getPropertyValue('--card'),
        foreground: row.getPropertyValue('--foreground'),
      }
    })
    expect(hover.background).not.toBe('rgba(0, 0, 0, 0)')
    expect(hover.background).not.toContain('rgba(')
    expect(hover.parent).not.toBe('rgba(0, 0, 0, 0)')
    await info.attach(`governance-hover-${theme}`, {
      body: await active.screenshot(),
      contentType: 'image/png',
    })
    await control.uncheck()
    expect((await records.first().boundingBox())!.width).toBeGreaterThan(390)
    expect(await records.allTextContents()).toEqual(content)
    expect(txLog).toHaveLength(0)
  })

  test(`governance review notes and navigation ${theme}`, async ({
    page,
    txLog,
  }, info) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto('/internal/design-system/components/table')
    const section = page.locator(
      '[aria-labelledby="proposal-record-review-title"]'
    )
    const aside = section.locator('aside')
    await expect(aside).toBeVisible()
    await currentCapture(page, section, info, `governance-notes-${theme}`)
    const emptySpace = await aside.evaluate((el) => {
      const last = el.lastElementChild!.getBoundingClientRect()
      return (
        el.getBoundingClientRect().bottom -
        last.bottom -
        parseFloat(getComputedStyle(el).paddingBottom) -
        parseFloat(getComputedStyle(el).borderBottomWidth)
      )
    })
    expect(
      emptySpace,
      'review notes use content height, not the entire list height'
    ).toBeLessThanOrEqual(1)
    const records = section.locator('[data-record-kind="governance"]')
    await records.first().getByTestId('proposal-record-link').focus()
    await page.keyboard.press('Tab')
    await expect(
      records.first().getByTestId('proposal-help').getByRole('button')
    ).toBeFocused()
    await page.keyboard.press('Escape')
    await page.keyboard.press('Tab')
    await expect(
      records.nth(1).getByTestId('proposal-record-link')
    ).toBeFocused()
    await expect(
      records.nth(1).getByTestId('proposal-record-link')
    ).toHaveAttribute('href', '/bsc/index-dtf/cmc20/governance')
    const opened = page.waitForEvent('popup')
    await page.keyboard.press('Enter')
    const popup = await opened
    await expect(popup).toHaveURL(/\/bsc\/index-dtf\/cmc20\/governance$/)
    await popup.close()
    expect(txLog).toHaveLength(0)
  })
}
