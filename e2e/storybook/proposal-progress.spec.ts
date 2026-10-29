import { expect, test } from '@playwright/test'

const story = (id: string, args = '') =>
  `/iframe.html?id=${id}&viewMode=story${args ? `&args=${args}` : ''}`

test('proposal detail progress stacks quorum, majority and vote totals', async ({
  page,
}) => {
  await page.goto(
    story('components-feedback-and-overlays-progress-indicator--playground')
  )
  await expect(
    page.getByRole('heading', { name: 'Current votes' })
  ).toBeVisible()
  await expect(page.getByRole('meter', { name: 'Quorum' })).toHaveAttribute(
    'aria-valuenow',
    '100'
  )
  await expect(page.getByText('87.91M of 11.34M')).toBeVisible()
  await expect(
    page.getByRole('meter', { name: 'Majority support' })
  ).toHaveAttribute('aria-valuetext', 'For: 100%')
  await expect(page.getByText('88M', { exact: true })).toBeVisible()
  await expect(page.getByText('Against', { exact: true })).toBeVisible()
  await expect(page.getByText('Abstain', { exact: true })).toBeVisible()
  await page.goto(
    story(
      'components-feedback-and-overlays-progress-indicator--playground',
      'phase:final'
    )
  )
  await expect(page.getByRole('heading', { name: 'Final votes' })).toBeVisible()
  await expect(page.getByText('87.91M of 11.34M')).toBeVisible()
  await expect(page.getByText('88M', { exact: true })).toBeVisible()
})

test('proposal detail scenarios preserve truthful voting and challenge readings', async ({
  page,
}) => {
  for (const [scenario, quorum, majority, forVotes, outcome] of [
    ['early-voting', '1', 'For: 100%', '50K', 'Yes'],
    ['partial', '40', 'For: 60%', '3M', 'Yes'],
    ['near-quorum', '99', 'For: 60%', '60M', 'Yes'],
    ['quorum-reached', '100', 'For: 90%', '9M', 'Yes'],
    ['narrow-majority', '100', 'For: 51%', '51M', 'Yes'],
    ['opposed', '100', 'For: 40%', '4M', 'No'],
    ['unanimous-opposition', '100', 'For: 0%', '0', 'No'],
    ['tie', '100', 'Tied — For: 50%', '5M', 'Tied'],
  ]) {
    await page.goto(
      story(
        'components-feedback-and-overlays-progress-indicator--playground',
        `scenario:${scenario}`
      )
    )
    await expect(page.getByRole('meter', { name: 'Quorum' })).toHaveAttribute(
      'aria-valuenow',
      quorum
    )
    await expect(
      page.getByRole('meter', { name: 'Majority support' })
    ).toHaveAttribute('aria-valuetext', majority)
    await expect(
      page.getByText('For', { exact: true }).locator('..')
    ).toContainText(forVotes)
    await expect(page.getByText(outcome, { exact: true })).toBeVisible()
  }
  for (const [scenario, quorum] of [
    ['no-votes', '0'],
    ['abstain-only', '30'],
  ]) {
    await page.goto(
      story(
        'components-feedback-and-overlays-progress-indicator--playground',
        `scenario:${scenario}`
      )
    )
    await expect(page.getByRole('meter', { name: 'Quorum' })).toHaveAttribute(
      'aria-valuenow',
      quorum
    )
    await expect(
      page.getByRole('meter', { name: 'Majority support' })
    ).toHaveCount(0)
    await expect(
      page.getByText('No directional votes', { exact: true })
    ).toBeAttached()
    await expect(page.getByText('—', { exact: true })).toHaveAttribute(
      'aria-hidden',
      'true'
    )
    await expect(page.getByText(/^(Yes|No)$/)).toHaveCount(0)
  }
  for (const scenario of [
    'target-unavailable',
    'optimistic-target-unavailable',
  ]) {
    await page.goto(
      story(
        'components-feedback-and-overlays-progress-indicator--playground',
        `scenario:${scenario}`
      )
    )
    await expect(
      page.getByText('Target unavailable', { exact: true })
    ).toBeVisible()
    await expect(
      page.getByText(scenario === 'target-unavailable' ? '4M' : '3.5M', {
        exact: true,
      })
    ).toBeVisible()
    await expect(page.getByText(/of Unavailable$/)).toHaveCount(0)
    await expect(
      page.getByRole('meter', { name: /^(Quorum|Challenge)$/ })
    ).toHaveCount(0)
    await expect(page.getByText('0%', { exact: true })).toHaveCount(0)
  }
  for (const [scenario, percent] of [
    ['optimistic-no-challenges', '0'],
    ['optimistic-challenge', '35'],
    ['optimistic-threshold-reached', '100'],
  ]) {
    await page.goto(
      story(
        'components-feedback-and-overlays-progress-indicator--playground',
        `scenario:${scenario}`
      )
    )
    await expect(
      page.getByRole('meter', { name: 'Challenge' })
    ).toHaveAttribute('aria-valuenow', percent)
    await expect(page.getByRole('meter')).toHaveCount(1)
    await expect(
      page.getByText(/^(Majority support|For|Against|Abstain)$/)
    ).toHaveCount(0)
  }
  await page.goto(
    story(
      'components-feedback-and-overlays-progress-indicator--playground',
      'scenario:loading'
    )
  )
  await expect(
    page.getByRole('status', { name: 'Loading record' })
  ).toBeVisible()
  await expect(page.getByRole('meter')).toHaveCount(0)
  await expect(page.getByText('0', { exact: true })).toHaveCount(0)
})

test('proposal detail Docs controls preserve tallies when finalizing a snapshot', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(
    '/iframe.html?id=components-feedback-and-overlays-progress-indicator--docs&viewMode=docs'
  )
  const interactive = page.locator('.storybook-docs-interactive').first()
  await interactive
    .getByRole('row', { name: /^scenario/ })
    .getByRole('combobox')
    .selectOption({ label: 'Partial quorum' })
  const meter = interactive.getByRole('meter', { name: 'Quorum' })
  await expect(meter).toHaveAttribute('aria-valuenow', '40')
  const liveColor = await meter
    .locator('> div')
    .evaluate((element) => getComputedStyle(element).backgroundColor)
  const finalPhase = interactive.getByRole('radio', {
    name: 'Final votes',
    exact: true,
  })
  await finalPhase.click()
  await expect(finalPhase).toBeChecked()
  await expect(
    interactive.getByRole('heading', { name: 'Final votes' })
  ).toBeVisible()
  await expect(meter).toHaveAttribute('aria-valuenow', '40')
  await expect(interactive.getByText('4M of 10M')).toBeVisible()
  await expect(
    interactive.getByText('For', { exact: true }).locator('..')
  ).toContainText('3M')
  expect(
    await meter
      .locator('> div')
      .evaluate((element) => getComputedStyle(element).backgroundColor)
  ).not.toBe(liveColor)
  const currentPhase = interactive.getByRole('radio', {
    name: 'Current votes',
    exact: true,
  })
  await currentPhase.click()
  await expect(currentPhase).toBeChecked()
  await expect(
    interactive.getByRole('heading', { name: 'Current votes' })
  ).toBeVisible()
  await expect(meter).toHaveAttribute('aria-valuenow', '40')
  await expect(
    interactive.getByRole('row', { name: /^scenario/ }).getByRole('combobox')
  ).toHaveValue('Partial quorum')
})
