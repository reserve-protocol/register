import { expect, test } from '@playwright/test'

const story = (id: string, args = '') =>
  `/iframe.html?id=${id}&viewMode=story${args ? `&args=${args}` : ''}`

test('proposal detail cards retain mobile insets and contain every row in both themes', async ({
  page,
}) => {
  test.setTimeout(120_000)
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 })
    for (const theme of ['light', 'dark']) {
      for (const scenario of [
        'unanimous',
        'no-votes',
        'early-voting',
        'partial',
        'near-quorum',
        'quorum-reached',
        'narrow-majority',
        'opposed',
        'unanimous-opposition',
        'tie',
        'abstain-only',
        'target-unavailable',
        'optimistic-no-challenges',
        'optimistic-challenge',
        'optimistic-threshold-reached',
        'optimistic-target-unavailable',
        'loading',
      ]) {
        await page.goto(
          story(
            'explorations-components-progress-indicator--playground',
            `scenario:${scenario}`
          ) + `&globals=theme:${theme}`
        )
        const region = page.getByRole('region', {
          name: 'Current votes',
          exact: true,
        })
        await expect(region).toBeVisible()
        const overflow = await region.evaluate((element) =>
          [...element.querySelectorAll('*')]
            .filter(
              (child) =>
                !child.closest('.sr-only') &&
                child.scrollWidth > child.clientWidth + 1
            )
            .map((child) => ({
              text: child.textContent,
              width: child.clientWidth,
              contentWidth: child.scrollWidth,
            }))
        )
        expect(overflow, `${scenario}, ${theme}, ${width}px`).toEqual([])
        const box = (await region.boundingBox())!
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(width + 1)
        if (scenario === 'unanimous') {
          const row = region
            .getByRole('meter', { name: 'Quorum' })
            .locator('../..')
          await expect(row).toHaveCSS(
            'padding-left',
            width < 640 ? '20px' : '24px'
          )
          await expect(row).toHaveCSS(
            'padding-top',
            width < 640 ? '20px' : '24px'
          )
        }
        for (const meter of await region.getByRole('meter').all()) {
          await expect(meter).toHaveCSS('height', '4px')
          await expect(meter).toHaveCSS('border-radius', '0px')
        }
        if (width === 390)
          await region.screenshot({
            animations: 'disabled',
            path: test.info().outputPath(`proposal-${scenario}-${theme}.png`),
          })
      }
    }
  }
})

test('every proposal snapshot retains its readings when voting becomes final', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.setViewportSize({ width: 390, height: 844 })
  for (const scenario of [
    'unanimous',
    'no-votes',
    'early-voting',
    'partial',
    'near-quorum',
    'quorum-reached',
    'narrow-majority',
    'opposed',
    'unanimous-opposition',
    'tie',
    'abstain-only',
    'target-unavailable',
    'optimistic-no-challenges',
    'optimistic-challenge',
    'optimistic-threshold-reached',
    'optimistic-target-unavailable',
    'loading',
  ]) {
    await page.goto(
      story(
        'explorations-components-progress-indicator--playground',
        `scenario:${scenario}`
      ) + '&globals=theme:dark'
    )
    const current = page.getByRole('region', {
      name: 'Current votes',
      exact: true,
    })
    await expect(current).toBeVisible()
    const readings = (await current.locator('> div').innerText()).replace(
      'Current votes',
      ''
    )
    const values = await current.getByRole('meter').evaluateAll((meters) =>
      meters.map((meter) => ({
        name: meter.getAttribute('aria-label'),
        value: meter.getAttribute('aria-valuenow'),
        detail: meter.getAttribute('aria-valuetext'),
      }))
    )
    await page.goto(
      story(
        'explorations-components-progress-indicator--playground',
        `scenario:${scenario};phase:final`
      ) + '&globals=theme:dark'
    )
    const final = page.getByRole('region', { name: 'Final votes', exact: true })
    await expect(final).toBeVisible()
    expect(
      (await final.locator('> div').innerText()).replace('Final votes', '')
    ).toBe(readings)
    expect(
      await final.getByRole('meter').evaluateAll((meters) =>
        meters.map((meter) => ({
          name: meter.getAttribute('aria-label'),
          value: meter.getAttribute('aria-valuenow'),
          detail: meter.getAttribute('aria-valuetext'),
        }))
      )
    ).toEqual(values)
    await final.screenshot({
      animations: 'disabled',
      path: test.info().outputPath(`proposal-${scenario}-final-dark.png`),
    })
  }
})

test('proposal criteria switch together between inline and left-aligned stacked readings', async ({
  page,
}) => {
  for (const [width, stacked] of [
    [320, true],
    [390, true],
    [415, true],
    [416, false],
    [417, false],
    [640, false],
    [1440, false],
  ] as const) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto(
      story('explorations-components-progress-indicator--playground')
    )
    for (const label of ['Quorum', 'Majority support']) {
      const header = page.getByText(label, { exact: true }).locator('..')
      const labelBox = (await header.locator('> span').nth(0).boundingBox())!
      const valueBox = (await header.locator('> span').nth(1).boundingBox())!
      if (stacked) {
        expect(valueBox.y, `${label} at ${width}px`).toBeGreaterThanOrEqual(
          labelBox.y + labelBox.height
        )
        expect(valueBox.x, `${label} left alignment at ${width}px`).toBeCloseTo(
          labelBox.x,
          0
        )
      } else {
        expect(valueBox.y, `${label} at ${width}px`).toBeCloseTo(labelBox.y, 0)
        expect(valueBox.x).toBeGreaterThan(labelBox.x + labelBox.width)
      }
    }
  }
})
