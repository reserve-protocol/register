import { expect, test } from '@playwright/test'

const story = (id: string, args = '') =>
  `/iframe.html?id=${id}&viewMode=story${args ? `&args=${args}` : ''}`

test('majority readings always represent For votes and identify ties', async ({
  page,
}) => {
  for (const [scenario, value, outcome] of [
    ['opposed', '40', 'No'],
    ['unanimous-opposition', '0', 'No'],
    ['tie', '50', 'Tied'],
    ['narrow-majority', '51', 'Yes'],
  ] as const) {
    await page.goto(
      story(
        'components-feedback-and-overlays-progress-indicator--playground',
        `scenario:${scenario}`
      )
    )
    const meter = page.getByRole('meter', { name: 'Majority support' })
    await expect(meter).toHaveAttribute('aria-valuenow', value)
    await expect(meter).toHaveAttribute(
      'aria-valuetext',
      `${outcome === 'Tied' ? 'Tied — ' : ''}For: ${value}%`
    )
    await expect(page.getByText(`${value}% For`, { exact: true })).toBeVisible()
    await expect(page.getByText(outcome, { exact: true })).toBeVisible()
  }
})

test('quorum presentations share status colors and zero challenge stays neutral', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    for (const [scenario, phase, value, closed] of [
      ['partial', 'current', '40', 'false'],
      ['quorum-reached', 'current', '100', 'false'],
      ['partial', 'final', '40', 'true'],
    ] as const) {
      await page.goto(
        story(
          'components-feedback-and-overlays-progress-indicator--playground',
          `scenario:${scenario};phase:${phase}`
        ) + `&globals=theme:${theme}`
      )
      const contextual = page.getByRole('meter', { name: 'Quorum' })
      await expect(contextual).toBeVisible()
      const expected = await contextual
        .locator('> div')
        .evaluate((el) => getComputedStyle(el).backgroundColor)
      const expectedText = await contextual
        .locator('xpath=..')
        .locator('svg')
        .first()
        .evaluate((el) => getComputedStyle(el).color)
      await page.goto(
        story(
          'components-feedback-and-overlays-progress-indicator--playground',
          `kind:threshold;value:${value};closed:${closed}`
        ) + `&globals=theme:${theme}`
      )
      const generic = page.getByRole('meter', { name: 'Quorum' })
      await expect(generic).toHaveAttribute('aria-valuenow', value)
      await expect(generic.locator('> div')).toHaveCSS(
        'background-color',
        expected
      )
      await expect(page.getByText(`${value}%`, { exact: true })).toHaveCSS(
        'color',
        expectedText
      )
    }
    await page.goto(
      story(
        'components-feedback-and-overlays-progress-indicator--playground',
        'scenario:optimistic-target-unavailable'
      ) + `&globals=theme:${theme}`
    )
    const unknown = page.getByRole('region', { name: 'Current votes' })
    await expect(unknown).toBeVisible()
    const neutral = await unknown
      .locator('svg')
      .evaluate((el) => getComputedStyle(el).color)
    await page.goto(
      story(
        'components-feedback-and-overlays-progress-indicator--playground',
        'scenario:optimistic-no-challenges'
      ) + `&globals=theme:${theme}`
    )
    await expect(
      page.getByRole('meter', { name: 'Challenge' })
    ).toHaveAttribute('aria-valuenow', '0')
    await expect(page.getByText('0%', { exact: true })).toHaveCSS(
      'color',
      neutral
    )
  }
})

test('progress rail geometry and readings remain consistent at their boundaries', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const theme of ['light', 'dark']) {
    for (const [args, role, label, value] of [
      ['kind:threshold;value:0', 'meter', 'Quorum', '0'],
      ['kind:threshold;value:1', 'meter', 'Quorum', '1'],
      ['kind:threshold;value:99', 'meter', 'Quorum', '99'],
      ['kind:threshold;value:100', 'meter', 'Quorum', '100'],
      ['kind:threshold;value:37;closed:true', 'meter', 'Quorum', '37'],
      ['kind:measured;completed:0', 'progressbar', 'Orders filled', '0'],
      ['kind:measured;completed:1', 'progressbar', 'Orders filled', '25'],
      ['kind:measured;completed:4', 'progressbar', 'Orders filled', '100'],
    ] as const) {
      await page.goto(
        story(
          'components-feedback-and-overlays-progress-indicator--playground',
          args
        ) + `&globals=theme:${theme}`
      )
      const rail = page.getByRole(role, { name: label })
      await expect(rail).toHaveAttribute('aria-valuenow', value)
      await expect(rail).toHaveCSS('height', '4px')
      await expect(rail).toHaveCSS('border-radius', '0px')
      await expect(rail.locator('> div')).toHaveCSS(
        'transition-property',
        'none'
      )
      if (args.includes('closed:true'))
        await expect(page.getByText('Quorum not reached')).toBeVisible()
      await rail.locator('..').screenshot({
        animations: 'disabled',
        path: test
          .info()
          .outputPath(
            `generic-${args.replaceAll(':', '-').replaceAll(';', '-')}-${theme}.png`
          ),
      })
    }
  }
})

test('progress proposals distinguish threshold, known fraction and waiting', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 640 })
  await page.goto(
    story(
      'components-feedback-and-overlays-progress-indicator--playground',
      'kind:threshold'
    )
  )
  await expect(page.getByRole('meter', { name: 'Quorum' })).toHaveAttribute(
    'aria-valuenow',
    '64'
  )
  await expect(page.getByRole('progressbar')).toHaveCount(0)
  await page.goto(
    story(
      'components-feedback-and-overlays-progress-indicator--measured-completion',
      'completed:3'
    )
  )
  await expect(
    page.getByRole('progressbar', { name: 'Orders filled' })
  ).toHaveAttribute('aria-valuenow', '75')
  await expect(page.getByText('3/4', { exact: true })).toBeVisible()
  await page.screenshot({
    animations: 'disabled',
    path: test.info().outputPath('measured-progress.png'),
  })
  await page.goto(
    story('components-feedback-and-overlays-progress-indicator--waiting')
  )
  await expect(
    page.getByRole('status', { name: 'Loading balances' })
  ).toBeVisible()
  await expect(page.getByRole('progressbar')).toHaveCount(0)
  await expect(page.getByRole('meter')).toHaveCount(0)
})
