import { expect, test, type Page } from '@playwright/test'

interface StoryIndexEntry {
  id: string
  name: string
  title: string
  type: string
  tags?: string[]
}

interface StoryIndex {
  entries: Record<string, StoryIndexEntry>
}

const storyUrl = (id: string, theme: 'light' | 'dark' = 'light') =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`

const openStory = async (
  page: Page,
  id: string,
  theme: 'light' | 'dark' = 'light'
) => {
  await page.goto(storyUrl(id, theme))
  await expect
    .poll(() => page.locator('#storybook-root > *').count())
    .toBeGreaterThan(0)
  await page.evaluate(() => document.fonts.ready)
}

const observeIsolation = async (page: Page, origin: string) => {
  const errors: string[] = []
  const externalRequests: string[] = []
  const websocketAttempts: string[] = []

  await page.addInitScript(() => {
    const calls: string[] = []
    Reflect.set(window, '__storybookWalletCalls', calls)
    Reflect.defineProperty(window, 'ethereum', {
      configurable: true,
      value: {
        isMetaMask: true,
        on: () => undefined,
        removeListener: () => undefined,
        request: async ({ method }: { method: string }) => {
          calls.push(method)
          return null
        },
      },
    })
  })

  page.on('pageerror', (error) =>
    errors.push(`${page.url()}: ${error.message}`)
  )
  page.on('console', (message) => {
    if (message.type() === 'error')
      errors.push(`${page.url()}: ${message.text()}`)
  })
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.protocol.startsWith('http') && url.origin !== origin) {
      externalRequests.push(`${page.url()}: ${request.url()}`)
    }
  })
  page.on('websocket', (websocket) => websocketAttempts.push(websocket.url()))

  return async () => {
    const walletCalls = (
      await Promise.all(
        page
          .frames()
          .map((frame) =>
            frame.evaluate(
              () =>
                (Reflect.get(window, '__storybookWalletCalls') as string[]) ??
                []
            )
          )
      )
    ).flat()
    expect(errors).toEqual([])
    expect(externalRequests).toEqual([])
    expect(walletCalls).toEqual([])
    expect(websocketAttempts).toEqual([])
  }
}

test('every story renders without product runtime requests', async ({
  page,
  request,
  baseURL,
}) => {
  const response = await request.get('/index.json')
  expect(response.ok()).toBe(true)
  const index = (await response.json()) as StoryIndex
  const stories = Object.values(index.entries).filter(
    (entry) => entry.type === 'story'
  )
  test.setTimeout(Math.max(60_000, stories.length * 3_000))
  const checkIsolation = await observeIsolation(page, new URL(baseURL!).origin)

  expect(stories.length).toBeGreaterThan(0)
  for (const story of stories) {
    await test.step(`${story.title} / ${story.name}`, async () => {
      await openStory(page, story.id)
      await checkIsolation()
    })
  }
})

test('keyboard focus skips disabled actions', async ({ page }) => {
  await openStory(page, 'components-actions-button--system')

  await page
    .getByRole('row', { name: /Default/ })
    .getByRole('button', { name: 'Delete' })
    .focus()
  await page.keyboard.press('Tab')

  const states = page
    .getByRole('heading', { name: 'States · default size' })
    .locator('..')
  await expect(states.getByRole('button', { name: 'Create' })).toBeDisabled()
  await expect(states.getByRole('button', { name: 'Creating' })).toBeDisabled()
  await expect(
    page
      .getByRole('heading', { name: 'Icon placement' })
      .locator('..')
      .getByRole('button', { name: 'Create' })
  ).toBeFocused()
})

test('shared toast can be reopened and shows existing product feedback', async ({
  page,
}) => {
  await openStory(page, 'components-feedback-and-overlays-toast--playground')
  await expect(page.getByText('Address copied to clipboard')).toBeVisible()
  await page.getByRole('button', { name: 'Show sample toast' }).click()
  await expect(
    page.getByText('Address copied to clipboard').first()
  ).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(
    `${storyUrl('components-feedback-and-overlays-toast--playground')}&args=example:copy-error;stacked:true`
  )
  await expect(page.getByText('Unable to copy address')).toBeVisible()
  await expect(page.getByText('Withdrawal successful')).toBeVisible()
  const errorToast = page
    .locator('[data-sonner-toast]')
    .filter({ hasText: 'Unable to copy address' })
  const closeButton = errorToast.getByRole('button', { name: 'Close toast' })
  const geometry = await errorToast.evaluate((toastElement) => {
    const toastBox = toastElement.getBoundingClientRect()
    const closeBox = toastElement
      .querySelector('button[aria-label="Close toast"]')!
      .getBoundingClientRect()
    return {
      toast: {
        x: toastBox.x,
        y: toastBox.y,
        right: toastBox.right,
        bottom: toastBox.bottom,
        width: toastBox.width,
      },
      close: {
        x: closeBox.x,
        y: closeBox.y,
        right: closeBox.right,
        bottom: closeBox.bottom,
      },
    }
  })
  expect(geometry.toast.x).toBeGreaterThanOrEqual(0)
  expect(geometry.toast.right).toBeLessThanOrEqual(390)
  expect(geometry.close.x).toBeGreaterThan(
    geometry.toast.x + geometry.toast.width / 2
  )
  expect(geometry.close.right).toBeLessThanOrEqual(geometry.toast.right)
  expect(geometry.close.y).toBeGreaterThanOrEqual(geometry.toast.y)
  expect(geometry.close.bottom).toBeLessThanOrEqual(geometry.toast.bottom)

  await closeButton.click()
  await expect(errorToast).toHaveCount(0)
  await page.getByRole('button', { name: 'Show sample toast' }).click()
  await expect(errorToast).toBeVisible()

  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto(
    `${storyUrl('components-feedback-and-overlays-toast--playground')}&args=example:proposal-created`
  )
  await expect(page.getByText('Proposal created!')).toBeVisible()
  await expect(
    page.getByText('Reserve Optimistic Governor Upgrade proposal created')
  ).toBeVisible()
  const detailedToast = page
    .locator('[data-sonner-toast]')
    .filter({ hasText: 'Proposal created!' })
  const detailedBox = await detailedToast.boundingBox()
  const reopenBox = await page
    .getByRole('button', { name: 'Show sample toast' })
    .boundingBox()
  expect(detailedBox).not.toBeNull()
  expect(reopenBox).not.toBeNull()
  expect(detailedBox!.y + detailedBox!.height).toBeLessThan(reopenBox!.y)
  const detailedAlignment = await detailedToast.evaluate((toastElement) => {
    const midpoint = (selector: string) => {
      const element = toastElement.querySelector(selector)!
      const bounds = element.getBoundingClientRect()
      return bounds.y + bounds.height / 2
    }
    return {
      icon: midpoint('[data-icon]'),
      content: midpoint('[data-content]'),
      close: midpoint('[data-close-button]'),
    }
  })
  expect(
    Math.abs(detailedAlignment.icon - detailedAlignment.content)
  ).toBeLessThan(2)
  expect(
    Math.abs(detailedAlignment.close - detailedAlignment.content)
  ).toBeLessThan(2)

  await page.goto(
    `${storyUrl('components-feedback-and-overlays-toast--playground')}&args=example:transaction-reverted`
  )
  await expect(page.getByText('Transaction reverted')).toBeVisible()
  await expect(page.getByText('Unknown error')).toBeVisible()
  const transactionToast = page
    .locator('[data-sonner-toast]')
    .filter({ hasText: 'Transaction reverted' })
  const titleHeight = await transactionToast
    .locator('[data-title]')
    .evaluate((title) => title.getBoundingClientRect().height)
  expect(titleHeight).toBeLessThanOrEqual(24)
})

test('hidden stacked toasts cannot receive keyboard focus', async ({
  page,
}) => {
  await page.goto(
    `${storyUrl('components-feedback-and-overlays-toast--playground')}&args=stacked:true`
  )
  await page.getByRole('button', { name: 'Show sample toast' }).click()
  await expect(
    page.locator('[data-sonner-toast][data-visible="false"]')
  ).toHaveCount(1)

  await page.getByRole('button', { name: 'Show sample toast' }).focus()
  for (let step = 0; step < 8; step++) {
    await page.keyboard.press('Tab')
    const focusedHiddenToast = await page.evaluate(() =>
      Boolean(
        document.activeElement?.closest(
          '[data-sonner-toast][data-visible="false"]'
        )
      )
    )
    expect(focusedHiddenToast).toBe(false)
  }
})

test('brief and detailed toasts follow their dismissal timing', async ({
  page,
}) => {
  test.setTimeout(30_000)
  const toasts = page.locator('[data-sonner-toast]')

  await openStory(page, 'components-feedback-and-overlays-toast--playground')
  await page.getByRole('button', { name: 'Show sample toast' }).click()
  await page.mouse.move(0, 0)
  await expect(toasts).toHaveCount(2)
  const briefStart = Date.now()
  await expect(toasts).toHaveCount(1, { timeout: 7_000 })
  expect(Date.now() - briefStart).toBeGreaterThanOrEqual(4_000)

  await page.goto(
    `${storyUrl('components-feedback-and-overlays-toast--playground')}&args=example:transaction-reverted`
  )
  await page.getByRole('button', { name: 'Show sample toast' }).click()
  await page.mouse.move(0, 0)
  await expect(toasts).toHaveCount(2)
  const detailedStart = Date.now()
  await expect(toasts).toHaveCount(1, { timeout: 10_000 })
  expect(Date.now() - detailedStart).toBeGreaterThanOrEqual(7_000)
})

test('Holdings Docs stays short while the full story remains available', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=patterns-market-holdings--docs&viewMode=docs'
  )
  const docs = page.locator('.sbdocs-content')
  const table = docs.getByRole('table', { name: 'Exposure holdings' })
  await expect(table.getByRole('row')).toHaveCount(4)
  await expect(docs.getByRole('heading', { name: 'STORIES' })).toHaveCount(0)

  await openStory(page, 'patterns-market-holdings--exposure')
  await expect(
    page.getByRole('table', { name: 'Exposure holdings' }).getByRole('row')
  ).toHaveCount(19)
})

test('focused market controls follow the selected chart and auction layout', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=patterns-market-charts-product-families--docs&viewMode=docs'
  )
  await expect(page.getByRole('combobox', { name: 'metric' })).toHaveCount(0)
  await page.getByRole('combobox', { name: 'family' }).selectOption('portfolio')
  await expect(
    page.getByRole('switch', { name: 'portfolioEmpty' })
  ).toBeVisible()
  await expect(page.getByRole('switch', { name: 'composition' })).toBeVisible()
  await page
    .getByRole('combobox', { name: 'family' })
    .selectOption('yield-price')
  await expect(page.getByRole('switch', { name: 'priceEmpty' })).toBeVisible()
  await page
    .getByRole('combobox', { name: 'family' })
    .selectOption('yield-metrics')
  await expect(page.getByRole('combobox', { name: 'metric' })).toBeVisible()
  await expect(page.getByRole('switch', { name: 'metricEmpty' })).toBeVisible()
  await expect(page.getByRole('switch', { name: 'composition' })).toHaveCount(0)

  await page.goto(
    '/iframe.html?id=patterns-market-auctions-history--docs&viewMode=docs'
  )
  await expect(page.getByRole('radio', { name: 'restricted' })).toHaveCount(0)
  await page.getByRole('radio', { name: 'browse' }).check()
  await expect(page.getByRole('radio', { name: 'restricted' })).toBeVisible()
  await expect(
    page.getByRole('combobox', { name: 'browseState' })
  ).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'tableState' })).toHaveCount(
    0
  )

  await page.goto(
    '/iframe.html?id=patterns-market-earn-and-owned-positions--docs&viewMode=docs'
  )
  const family = page.getByRole('combobox', { name: 'family' })
  const state = page.getByRole('combobox', { name: 'state' })
  await expect(state.locator('option')).toHaveCount(6)
  await expect(page.getByRole('switch', { name: 'indexWallet' })).toBeVisible()
  await family.selectOption('yield')
  await expect(page.getByRole('switch', { name: 'yieldWallet' })).toBeVisible()
  await family.selectOption('owned-lock')
  await expect(page.getByRole('switch', { name: 'indexWallet' })).toHaveCount(0)
  await expect(page.getByRole('switch', { name: 'yieldWallet' })).toHaveCount(0)
})

test('exploratory slider updates with the keyboard and respects disabled', async ({
  page,
}) => {
  await openStory(page, 'explorations-components-slider--playground')
  const slider = page.getByRole('slider', { name: 'Rebalance Percent' })
  await expect(slider).toHaveAttribute('aria-valuenow', '50')
  await slider.focus()
  await page.keyboard.press('ArrowRight')
  await expect(slider).toHaveAttribute('aria-valuenow', '51')
  await expect(page.locator('output')).toHaveText('51%')
  const track = page.locator('[data-orientation="horizontal"]').first()
  const trackBox = await track.boundingBox()
  expect(trackBox).not.toBeNull()
  await track.click({
    position: { x: trackBox!.width * 0.75, y: trackBox!.height / 2 },
  })
  await expect
    .poll(async () => Number(await slider.getAttribute('aria-valuenow')))
    .toBeGreaterThan(65)

  await page.goto(
    `${storyUrl('explorations-components-slider--playground')}&args=disabled:true`
  )
  await expect(
    page.getByRole('slider', { name: 'Rebalance Percent' })
  ).toBeDisabled()
})

test('exploratory progress exposes the numeric reading and outcome', async ({
  page,
}) => {
  await openStory(page, 'explorations-components-progress-indicator--threshold')
  const progress = page.getByRole('meter', { name: 'Quorum' })
  await expect(progress).toHaveAttribute('aria-valuenow', '64')
  await expect(page.getByText('64%')).toBeVisible()

  await page.goto(
    `${storyUrl('explorations-components-progress-indicator--playground')}&args=kind:threshold;value:100`
  )
  await expect(page.getByRole('meter', { name: 'Quorum' })).toHaveAttribute(
    'aria-valuenow',
    '100'
  )
  await expect(page.getByText('100%')).toBeVisible()

  await page.goto(
    `${storyUrl('explorations-components-progress-indicator--playground')}&args=kind:threshold;closed:true;value:37`
  )
  await expect(page.getByRole('meter', { name: 'Quorum' })).toHaveAttribute(
    'aria-valuenow',
    '37'
  )
  await expect(page.getByText('Quorum not reached')).toBeVisible()
})

test('paired progress and slider readings use one text size and line height', async ({
  page,
}) => {
  for (const { id, label, value } of [
    {
      id: 'explorations-components-progress-indicator--threshold',
      label: 'Quorum',
      value: '64%',
    },
    {
      id: 'explorations-components-slider--playground',
      label: 'Rebalance Percent',
      value: '50%',
    },
  ]) {
    await openStory(page, id)
    const typography = async (text: string) =>
      page.getByText(text, { exact: true }).evaluate((element) => {
        const style = getComputedStyle(element)
        return { fontSize: style.fontSize, lineHeight: style.lineHeight }
      })

    expect(await typography(label), `${id} label/value typography`).toEqual(
      await typography(value)
    )
  }
})

test('short pattern stories fill the canvas and center the example', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openStory(page, 'patterns-market-governance-records--waiting-period')

  const surface = page.locator('#storybook-root > * > *')
  const example = page.getByText('September 2026 Rebalance')
  const surfaceBox = await surface.boundingBox()
  const exampleBox = await example.boundingBox()

  expect(surfaceBox).not.toBeNull()
  expect(exampleBox).not.toBeNull()
  expect(surfaceBox!.height).toBeGreaterThanOrEqual(900)
  expect(exampleBox!.y).toBeGreaterThan(250)
  expect(exampleBox!.y).toBeLessThan(650)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(example).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)

  await page.goto(
    '/iframe.html?id=patterns-market-governance-records--docs&viewMode=docs'
  )
  const docsExample = page.locator('[data-story-surface="centered"]').first()
  await expect(docsExample).toBeVisible()
  expect((await docsExample.boundingBox())!.height).toBeLessThan(500)
})

test('dialog keeps focus within the overlay and returns it to the trigger', async ({
  page,
}) => {
  await openStory(page, 'components-feedback-and-overlays-dialog--shell')

  const trigger = page.getByRole('button', { name: 'Simulation config' })
  await trigger.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  for (let step = 0; step < 8; step += 1) {
    await page.keyboard.press('Tab')
    await expect
      .poll(() =>
        dialog.evaluate((element) => element.contains(document.activeElement))
      )
      .toBe(true)
  }

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('Docs, live Controls and accessibility results are available', async ({
  page,
}) => {
  await page.goto(
    '/?path=/story/components-fields-and-selection-checkbox--checkbox-playground'
  )
  const frame = page.frameLocator('#storybook-preview-iframe')
  const checkbox = frame.getByRole('checkbox', {
    name: 'Include governance assets',
  })
  await expect(checkbox).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Show addon panel' })
  ).toBeVisible()
  await expect(
    page.getByRole('tab', { name: 'Code', exact: true })
  ).toBeHidden()
  await expect(
    page.getByText(/setup checklist|what's new|onboarding/i)
  ).toHaveCount(0)

  await page.getByRole('button', { name: 'Show addon panel' }).click()
  await page.locator('label[for="control-disabled"]').click()
  await expect(checkbox).toBeDisabled()
  await page.getByRole('tab', { name: 'Code', exact: true }).click()
  await expect(
    page.getByText('<Checkbox', { exact: false }).first()
  ).toBeVisible()
  await page.getByRole('tab', { name: /Accessibility/ }).click()
  await expect(page.getByRole('tab', { name: /Violations/ })).toBeVisible()
  await page.goto('/?path=/docs/components-actions-button--docs')
  await expect(
    frame.getByRole('heading', { name: 'Button', exact: true })
  ).toBeVisible()
})

test('component Docs controls update their interactive examples', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=components-actions-button--docs&viewMode=docs'
  )
  await expect(
    page.getByRole('heading', { name: 'Interactive example' })
  ).toBeVisible()
  await page.getByText('True', { exact: true }).first().click()
  await expect(
    page.getByRole('button', { name: 'Continue' }).last()
  ).toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Continue' }).first()
  ).toBeEnabled()
  await expect(
    page.locator('table [data-tone="primary"][data-size="micro"]')
  ).toBeEnabled()

  await page.goto(
    '/iframe.html?id=components-actions-icon-button--docs&viewMode=docs'
  )
  await page.getByText('quiet', { exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'More actions' })
  ).toHaveAttribute('data-tone', 'quiet')

  await page.goto(
    '/iframe.html?id=components-actions-action-group--docs&viewMode=docs'
  )
  await page.getByText('vertical', { exact: true }).click()
  await expect(
    page.getByTestId('canonical-action-group').last()
  ).toHaveAttribute('data-direction', 'vertical')
})

test('component Docs keep editable examples with their controls and show distinct states once', async ({
  page,
  request,
}) => {
  const response = await request.get('/index.json')
  const index = (await response.json()) as StoryIndex
  const titles = [
    'Components/Navigation and disclosure/Collapsible',
    'Components/Feedback and overlays/Drawer',
    'Components/Data display/Entity identity',
    'Components/Feedback and overlays/Help tooltip',
    'Components/Data display/Lifecycle status',
    'Components/Actions/Link',
    'Components/Fields and selection/Multi select filter',
    'Components/Feedback and overlays/Popover',
    'Components/Fields and selection/Search',
    'Components/Fields and selection/Single choice',
    'Components/Navigation and disclosure/Tabs',
    'Components/Fields and selection/Textarea',
    'Components/Feedback and overlays/Loading',
    'Components/Data display/Metric',
    'Components/Feedback and overlays/Inline message',
    'Components/Fields and selection/Select',
    'Components/Fields and selection/Switch',
    'Components/Fields and selection/Text input',
    'Components/Fields and selection/Checkbox',
  ]

  test.setTimeout(120_000)
  for (const title of titles) {
    const entries = Object.values(index.entries).filter(
      (entry) => entry.title === title
    )
    const docs = entries.find((entry) => entry.type === 'docs')
    const playground = entries.filter(
      (entry) => entry.type === 'story' && /playground/i.test(entry.name)
    )
    expect(docs, `${title} Docs`).toBeDefined()
    expect(playground, `${title} Playground story`).toHaveLength(1)
    expect(playground[0].tags, `${title} Playground visibility`).not.toContain(
      'dev'
    )

    await test.step(title, async () => {
      await page.goto(`/iframe.html?id=${docs!.id}&viewMode=docs`)
      await expect(
        page.getByRole('heading', { name: 'Interactive example' })
      ).toHaveCount(1)
      await expect(
        page.getByRole('heading', { name: /Playground/i })
      ).toHaveCount(0)
    })
  }

  await page.goto(
    '/iframe.html?id=components-data-display-metric--docs&viewMode=docs'
  )
  await page
    .getByRole('row', { name: /label string/ })
    .getByRole('textbox')
    .fill('Total supply')
  await expect(
    page.getByText('Total supply', { exact: true }).first()
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Missing value' })
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Loading' })).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Interactive example' })
  ).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() => ({
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      }))
    )
    .toEqual({ pageWidth: 390, viewportWidth: 390 })
})

test('transaction Docs place the state control against the preview it updates', async ({
  page,
}) => {
  const pages = [
    'automated-issuance',
    'manual-issuance',
    'stake-and-delegate',
    'vote-lock-and-delegation',
    'zapper-and-rfq',
  ]

  for (const name of pages) {
    await page.goto(
      `/iframe.html?id=patterns-transactions-in-progress-${name}--docs&viewMode=docs`
    )
    const group = page.locator('.storybook-docs-interactive')
    const control = group.locator('.docblock-argstable')
    const preview = group.locator('.sbdocs-preview')
    await expect(control).toBeVisible()
    await expect(preview).toBeVisible()

    const controlBox = await control.boundingBox()
    const previewBox = await preview.boundingBox()
    expect(controlBox).not.toBeNull()
    expect(previewBox).not.toBeNull()
    expect(previewBox!.y - (controlBox!.y + controlBox!.height)).toBeLessThan(4)
  }

  await page.goto(
    '/iframe.html?id=patterns-transactions-in-progress-manual-issuance--docs&viewMode=docs'
  )
  const group = page.locator('.storybook-docs-interactive')
  await group.locator('select').selectOption({ label: 'Wallet disconnected' })
  await expect(
    group.getByRole('button', { name: 'Connect Wallet' })
  ).toBeVisible()
})

test('Discover Docs start with a desktop table and make narrower views explicit', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(
    '/iframe.html?id=patterns-market-discover--docs&viewMode=docs'
  )

  await expect(page.getByRole('heading', { name: 'Discover' })).toBeVisible()
  const table = page.getByRole('table', { name: 'Discover DTF sample' })
  await expect(table).toBeVisible()
  await expect(table.locator('tbody tr')).toHaveCount(2)
  await expect(
    page.locator('[data-slot="table-family-container"]')
  ).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Stories' })).toHaveCount(0)
  await expect(page.getByRole('radio', { name: 'table' })).toBeChecked()
  await page.getByRole('combobox', { name: 'state' }).selectOption('loading')
  await expect(page.getByRole('status')).toContainText('Loading DTF sample')

  await page.setViewportSize({ width: 960, height: 844 })
  await page.reload()
  await expect(table).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() => ({
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      }))
    )
    .toEqual({ pageWidth: 960, viewportWidth: 960 })

  await page.getByRole('radio', { name: 'cards' }).check()
  await expect(
    page.getByRole('list', { name: 'Discover DTF sample' })
  ).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('radio', { name: 'phone' }).check()
  await expect
    .poll(() =>
      page.evaluate(() => ({
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      }))
    )
    .toEqual({ pageWidth: 390, viewportWidth: 390 })

  await page.setViewportSize({ width: 900, height: 900 })
  await openStory(page, 'patterns-market-discover--table')
  await expect(
    page.getByRole('table', { name: 'Discover DTF sample' })
  ).toBeVisible()
})

test('wide market Docs lead with desktop table layouts', async ({ page }) => {
  for (const width of [1600, 960]) {
    await page.setViewportSize({ width, height: 900 })
    for (const id of [
      'patterns-market-discover--docs',
      'patterns-market-portfolio-tables--docs',
      'patterns-market-holdings--docs',
      'patterns-market-earn-and-owned-positions--docs',
      'patterns-market-auctions-current--docs',
      'patterns-market-auctions-history--docs',
    ]) {
      await test.step(`${width}px ${id}`, async () => {
        await page.goto(`/iframe.html?id=${id}&viewMode=docs`)
        const preview = page.locator('.sbdocs-preview').first()
        await expect(preview.getByRole('table').first()).toBeVisible()
        await expect
          .soft(
            preview.getByRole('columnheader').first(),
            `${width}px ${id} should show desktop columns`
          )
          .toBeVisible({ timeout: 1000 })
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth
          )
        ).toBe(true)
      })
    }
  }
})

test('Discover state stories show only the rows needed for each example', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 700 })

  for (const [id, count] of [
    ['patterns-market-discover--missing-data', 2],
    ['patterns-market-discover--inactive', 1],
    ['patterns-market-discover--long-content', 1],
    ['patterns-market-discover--loading', 1],
    ['patterns-market-discover--phone-cards', 1],
  ] as const) {
    await test.step(id, async () => {
      await openStory(page, id)
      await expect(
        page
          .getByRole('list', { name: 'Discover DTF sample' })
          .getByRole('listitem')
      ).toHaveCount(count)
    })
  }

  await openStory(page, 'patterns-market-discover--missing-data')
  await expect(page.getByText('No data').first()).toBeVisible()
  await expect(page.getByText('$0.00').first()).toBeVisible()

  await openStory(page, 'patterns-market-discover--inactive')
  await expect(page.getByText('BTC ETH DCA Index')).toBeVisible()
  await expect(page.getByText('Inactive', { exact: true })).toBeVisible()
  const inactiveList = page.getByRole('list', { name: 'Discover DTF sample' })
  const listWidth = (await inactiveList.boundingBox())!.width
  const cardWidth = (await inactiveList.getByRole('listitem').boundingBox())!
    .width
  expect(cardWidth / listWidth).toBeGreaterThan(0.9)
})

test('Discover featured card shows its transcript and launch chart', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 700 })
  await openStory(page, 'patterns-market-discover--feature-cards')

  const card = page.locator('[data-story-featured-card] > a')
  await expect(card).toHaveCount(1)
  await expect(card).toContainText('The Reserve AI Infrastructure DTF')
  await expect(card).not.toContainText('Market Cap:')
  await expect
    .poll(() => card.locator('.recharts-area').count())
    .toBeGreaterThan(1)
  await expect
    .poll(() =>
      card.evaluate((element) => getComputedStyle(element).borderRadius)
    )
    .toBe('0px')
  const bounds = (await card.boundingBox())!
  expect(bounds.x).toBeGreaterThanOrEqual(0)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390)
})

test('core action overviews cover supported variants and states', async ({
  page,
  request,
}) => {
  const response = await request.get('/index.json')
  const index = (await response.json()) as StoryIndex

  for (const title of [
    'Components/Actions/Button',
    'Components/Actions/Icon button',
  ]) {
    const names = Object.values(index.entries)
      .filter((entry) => entry.type === 'story' && entry.title === title)
      .map((entry) => entry.name)
    expect(names[0]).toBe('System')
  }

  await openStory(page, 'components-actions-button--system')
  const buttonMatrix = page.locator('table')
  await expect(buttonMatrix.getByTestId('canonical-button')).toHaveCount(12)
  for (const size of ['micro', 'compact', 'default']) {
    await expect(buttonMatrix.locator(`[data-size="${size}"]`)).toHaveCount(4)
  }
  for (const [tone, label] of [
    ['primary', 'Create'],
    ['secondary', 'Edit'],
    ['quiet', 'Details'],
    ['destructive', 'Delete'],
  ]) {
    await expect(buttonMatrix.locator(`[data-tone="${tone}"]`)).toHaveCount(3)
    await expect(
      buttonMatrix.locator(`[data-tone="${tone}"]`).first()
    ).toHaveText(label)
  }
  const states = page
    .getByRole('heading', { name: 'States · default size' })
    .locator('..')
  await expect(states.getByRole('button', { name: 'Create' })).toBeDisabled()
  await expect(states.getByRole('button', { name: 'Creating' })).toBeDisabled()

  await openStory(page, 'components-actions-icon-button--system')
  const iconMatrix = page.locator('table')
  await expect(iconMatrix.getByTestId('canonical-icon-button')).toHaveCount(36)
  for (const size of ['micro', 'compact', 'default']) {
    await expect(iconMatrix.locator(`[data-size="${size}"]`)).toHaveCount(12)
  }
  for (const tone of ['primary', 'secondary', 'quiet', 'destructive']) {
    await expect(iconMatrix.locator(`[data-tone="${tone}"]`)).toHaveCount(9)
  }

  await openStory(page, 'components-actions-action-group--behavior')
  const groups = page.getByTestId('canonical-action-group')
  await expect(groups).toHaveCount(2)
  const [
    horizontalWidth,
    horizontalButtonWidth,
    verticalWidth,
    verticalButtonWidth,
  ] = await Promise.all([
    groups.nth(0).evaluate((item) => item.getBoundingClientRect().width),
    groups
      .nth(0)
      .getByRole('button')
      .first()
      .evaluate((item) => item.getBoundingClientRect().width),
    groups.nth(1).evaluate((item) => item.getBoundingClientRect().width),
    groups
      .nth(1)
      .getByRole('button')
      .first()
      .evaluate((item) => item.getBoundingClientRect().width),
  ])
  expect(horizontalButtonWidth).toBeLessThan(horizontalWidth / 2)
  expect(verticalButtonWidth).toBeCloseTo(verticalWidth, 0)
})

test('wide patterns use the available canvas without host framing', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })

  for (const id of [
    'patterns-market-portfolio-tables--index-positions',
    'patterns-market-holdings--exposure',
    'patterns-market-discover--table',
    'patterns-market-earn-and-owned-positions--index-governance',
    'patterns-market-auctions-current--all-table-states',
    'patterns-market-auctions-history--completed-and-expired',
    'patterns-navigation--desktop',
  ]) {
    await test.step(id, async () => {
      await openStory(page, id)
      const surface = page.locator('[data-story-surface="neutral"]')
      const content = surface.locator('[data-story-content]')
      await expect(surface).toBeVisible()
      await expect(content).toBeVisible()

      const presentation = await surface.evaluate((element) => {
        const surfaceStyle = getComputedStyle(element)
        const content = element.querySelector<HTMLElement>(
          '[data-story-content]'
        )!
        return {
          borderRadius: surfaceStyle.borderRadius,
          borderWidth: surfaceStyle.borderWidth,
          contentWidth: content.getBoundingClientRect().width,
          viewportWidth: document.documentElement.clientWidth,
          pageWidth: document.documentElement.scrollWidth,
        }
      })

      expect(presentation.borderRadius).toBe('0px')
      expect(presentation.borderWidth).toBe('0px')
      expect(presentation.contentWidth).toBeGreaterThan(1200)
      expect(presentation.pageWidth).toBeLessThanOrEqual(
        presentation.viewportWidth + 1
      )
    })
  }
})

test('Docs controls sit directly above the preview they change', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })

  for (const id of [
    'patterns-market-portfolio-tables--docs',
    'patterns-market-holdings--docs',
    'components-data-display-metric--docs',
  ]) {
    await page.goto(`/iframe.html?id=${id}&viewMode=docs`)
    const controls = page.locator('.docblock-argstable').first()
    const preview = page.locator('.sbdocs-preview').first()
    await expect(controls).toBeVisible()
    await expect(preview).toBeVisible()
    const controlBox = await controls.boundingBox()
    const previewBox = await preview.boundingBox()
    const gap = previewBox!.y - controlBox!.y - controlBox!.height
    expect(gap).toBeGreaterThanOrEqual(-1)
    expect(gap).toBeLessThanOrEqual(2)
  }

  await page.goto(
    '/iframe.html?id=patterns-market-portfolio-tables--docs&viewMode=docs'
  )
  const preview = page.locator('.sbdocs-preview').first()
  const positions = preview.getByRole('table', { name: 'Index DTF Positions' })
  const withdrawals = preview.getByRole('table', {
    name: 'Pending Withdrawals',
  })
  await expect(positions.locator('tbody tr')).toHaveCount(3)
  await expect(withdrawals.locator('tbody tr')).toHaveCount(2)
  await expect(
    positions.locator('tbody tr').first().locator('td').first()
  ).toBeHidden()
  await page.getByRole('radio', { name: 'phone' }).first().check()
  await expect(
    positions.locator('tbody tr').first().locator('td').first()
  ).toBeVisible()
  await page.getByRole('radio', { name: 'yield' }).first().check()
  await expect(
    preview.getByRole('table', { name: 'Yield DTF Positions' })
  ).toBeVisible()
})

test('standalone portfolio stories retain full rows and expansion', async ({
  page,
}) => {
  await openStory(page, 'patterns-market-portfolio-tables--index-positions')
  const positions = page.getByRole('table', { name: 'Index DTF Positions' })
  const withdrawals = page.getByRole('table', { name: 'Pending Withdrawals' })

  await expect(positions.locator('tbody tr')).toHaveCount(5)
  await page
    .getByTestId('table-family-positions')
    .getByRole('button', { name: 'Show all (6)' })
    .click()
  await expect(positions.locator('tbody tr')).toHaveCount(6)
  await expect(withdrawals.locator('tbody tr')).toHaveCount(5)
  await page
    .getByTestId('table-family-withdrawals')
    .getByRole('button', { name: 'Show all (6)' })
    .click()
  await expect(withdrawals.locator('tbody tr')).toHaveCount(6)
})

test('complex pattern Docs use the space without padding out navigation specimens', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1800, height: 1000 })
  await page.goto('/iframe.html?id=patterns-navigation--docs&viewMode=docs')

  const docsContent = page.locator('.sbdocs-content')
  await expect(docsContent).toBeVisible()
  expect(
    await docsContent.evaluate(
      (element) => element.getBoundingClientRect().width
    )
  ).toBeGreaterThanOrEqual(1300)
  await expect(page.getByText('Performance', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Index details', { exact: true })).toHaveCount(0)

  const surface = page.locator('[data-story-surface="neutral"]').first()
  const shell = page.getByTestId('coordinated-navigation-desktop').first()
  const rail = page.getByTestId('product-navigation-rail-shell').first()
  await expect(rail).toBeVisible()
  expect(
    await rail.evaluate((element) => element.getBoundingClientRect().height)
  ).toBeGreaterThanOrEqual(600)
  expect(
    (await surface.boundingBox())!.height - (await shell.boundingBox())!.height
  ).toBeLessThan(80)

  for (const id of [
    'patterns-transactions-in-progress-automated-issuance--docs',
    'patterns-transactions-in-progress-manual-issuance--docs',
  ]) {
    await page.goto(`/iframe.html?id=${id}&viewMode=docs`)
    await expect(page.locator('.sbdocs-content')).toBeVisible()
    expect(
      await page
        .locator('.sbdocs-content')
        .evaluate((element) => element.getBoundingClientRect().width)
    ).toBeGreaterThanOrEqual(1300)
  }

  await page.setViewportSize({ width: 1200, height: 900 })
  await openStory(page, 'patterns-navigation--desktop')
  expect(
    await page
      .getByTestId('coordinated-navigation-desktop')
      .evaluate((element) => element.scrollWidth - element.clientWidth)
  ).toBeLessThanOrEqual(1)
  await page.setViewportSize({ width: 1100, height: 900 })
  await page.getByTestId('global-navigation-overflow-trigger').click()
  await expect(
    page.getByTestId('global-navigation-overflow').getByText('Portfolio')
  ).toBeVisible()
  await page.keyboard.press('Escape')

  for (const width of [1024, 900]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page
        .getByTestId('coordinated-navigation-desktop')
        .evaluate((element) => element.scrollWidth - element.clientWidth)
    ).toBeLessThanOrEqual(1)
  }
})

for (const [name, id, specimenId] of [
  [
    'manual mint',
    'patterns-transactions-in-progress-manual-issuance--docs',
    'manual-issuance-workspace',
  ],
  [
    'automated mint',
    'patterns-transactions-in-progress-automated-issuance--docs',
    'automated-mint-workspace',
  ],
] as const) {
  test(`${name} Docs frame the two-column example with balanced space`, async ({
    page,
  }) => {
    await page.goto(`/iframe.html?id=${id}&viewMode=docs`)

    const preview = page.locator('.sbdocs-preview').first()
    const surface = preview.locator('[data-story-surface="neutral"]')
    const specimen = surface.getByTestId(specimenId)
    for (const width of [1200, 1800]) {
      await page.setViewportSize({ width, height: 1000 })
      await expect(specimen).toBeVisible()

      const frame = (await surface.boundingBox())!
      const content = (await specimen.boundingBox())!
      const gaps = {
        top: content.y - frame.y,
        right: frame.x + frame.width - content.x - content.width,
        bottom: frame.y + frame.height - content.y - content.height,
        left: content.x - frame.x,
      }

      for (const gap of Object.values(gaps)) {
        expect(gap).toBeGreaterThanOrEqual(16)
        expect(gap).toBeLessThanOrEqual(40)
      }
      expect(Math.abs(gaps.left - gaps.right)).toBeLessThanOrEqual(2)
      expect(Math.abs(gaps.top - gaps.bottom)).toBeLessThanOrEqual(2)
    }
    expect(
      await surface.evaluate(
        (element) => getComputedStyle(element).backgroundColor
      )
    ).not.toBe('rgba(0, 0, 0, 0)')
  })
}

test('top navigation separates from the product surface with beige substrate', async ({
  page,
}) => {
  for (const theme of ['light', 'dark'] as const) {
    await openStory(page, 'patterns-navigation--desktop', theme)
    const header = page.getByTestId('global-navigation')
    await expect(header).toBeVisible()
    const seam = await header.evaluate((element) => {
      const product = element.nextElementSibling!
      const headerBox = element.getBoundingClientRect()
      const productBox = product.getBoundingClientRect()
      const gapY = headerBox.bottom + 1
      const gapSurface = document.elementFromPoint(
        headerBox.left + headerBox.width / 2,
        gapY
      )!

      return {
        borderWidth: getComputedStyle(element).borderBottomWidth,
        gap: productBox.top - headerBox.bottom,
        gapColor: getComputedStyle(gapSurface).backgroundColor,
        substrateColor: getComputedStyle(product).backgroundColor,
      }
    })
    expect(seam.borderWidth).toBe('0px')
    expect(seam.gap).toBe(2)
    expect(seam.gapColor).toBe(seam.substrateColor)
  }
})

test('mobile global headers leave structural separators to their host', async ({
  page,
}) => {
  for (const theme of ['light', 'dark'] as const) {
    await openStory(page, 'patterns-navigation--mobile-global', theme)
    const header = page
      .getByTestId('mobile-global-preview')
      .locator('header')
      .first()
    await expect(header).toBeVisible()
    const separator = await header.evaluate((element) => ({
      border: getComputedStyle(element).borderBottomWidth,
      after: getComputedStyle(element, '::after').content,
    }))
    expect(separator.border).toBe('0px')
    expect(['none', 'normal']).toContain(separator.after)
  }
})

test('navigation hover keeps its surface cue without underlining labels', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 })
  for (const theme of ['light', 'dark'] as const) {
    await openStory(page, 'patterns-navigation--desktop', theme)
    for (const name of ['Participate & Earn', 'Swap']) {
      const destination = page.getByRole('link', { name, exact: true })
      await page.mouse.move(0, 0)
      const surface =
        name === 'Swap'
          ? destination.locator(
              '[data-slot="product-navigation-icon-surface"] > span'
            )
          : destination
      const resting = await surface.evaluate(
        (element) => getComputedStyle(element).backgroundColor
      )
      await destination.hover()
      await expect(destination).toHaveCSS('text-decoration-line', 'none')
      await expect
        .poll(() =>
          surface.evaluate(
            (element) => getComputedStyle(element).backgroundColor
          )
        )
        .not.toBe(resting)
    }
  }
})

test('mobile navigation specimens show navigation without invented page content', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })

  await openStory(page, 'patterns-navigation--mobile-global')
  const globalSpecimen = page.getByTestId('mobile-global-navigation-specimen')
  const globalPreview = page.getByTestId('mobile-global-preview')
  const globalTrigger = globalSpecimen.getByRole('button', {
    name: 'Open global navigation',
    exact: true,
  })
  await expect(globalTrigger).toBeVisible()
  await expect(globalSpecimen.getByText('Application page')).toHaveCount(0)
  await expect(globalSpecimen.locator('h3')).toHaveCount(0)
  expect((await globalPreview.boundingBox())!.height).toBeLessThan(160)
  await globalTrigger.click()
  await expect(
    globalPreview.getByRole('button', { name: 'Close global navigation' })
  ).toBeVisible()
  expect((await globalPreview.boundingBox())!.height).toBeGreaterThan(500)

  await openStory(page, 'patterns-navigation--mobile-product')
  const productSpecimen = page.getByTestId('mobile-product-navigation-specimen')
  await expect(
    productSpecimen.getByRole('button', { name: /Switch DTF, current/ })
  ).toBeVisible()
  await expect(productSpecimen.getByText('Proposal activity')).toHaveCount(0)
  await expect(productSpecimen.locator('h3')).toHaveCount(0)
  expect((await productSpecimen.boundingBox())!.height).toBeLessThan(250)
  await productSpecimen
    .getByRole('button', { name: 'Open CMC20 page navigation' })
    .click()
  await expect(page.getByRole('dialog', { name: 'CMC20 pages' })).toBeVisible()
  expect((await productSpecimen.boundingBox())!.height).toBeGreaterThan(500)
})

test('wide table patterns collapse without host overflow on phones', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })

  for (const id of [
    'patterns-market-portfolio-tables--index-positions',
    'patterns-market-holdings--exposure',
    'patterns-market-discover--table',
    'patterns-market-earn-and-owned-positions--index-governance',
    'patterns-market-auctions-current--all-table-states',
    'patterns-market-auctions-history--completed-and-expired',
  ]) {
    await test.step(id, async () => {
      await openStory(page, id)
      await expect
        .poll(() =>
          page.evaluate(() => ({
            pageWidth: document.documentElement.scrollWidth,
            viewportWidth: document.documentElement.clientWidth,
          }))
        )
        .toEqual({ pageWidth: 390, viewportWidth: 390 })
    })
  }
})

test('transactions expose one in-progress parent and retain status metadata', async ({
  request,
}) => {
  const response = await request.get('/index.json')
  const index = (await response.json()) as StoryIndex

  for (const id of [
    'patterns-transactions-in-progress-zapper-and-rfq--quote-review',
    'patterns-transactions-in-progress-manual-issuance--mint-requirements',
    'patterns-transactions-in-progress-automated-issuance--quote-ready',
    'patterns-transactions-in-progress-stake-and-delegate--stake-amount',
    'patterns-transactions-in-progress-vote-lock-and-delegation--lock-amount',
  ]) {
    expect(index.entries[id]).toMatchObject({
      title: expect.stringContaining('Transactions (In progress)/'),
      tags: expect.arrayContaining(['in-progress']),
    })
  }
})

test('component stories are grouped for quick scanning', async ({
  request,
}) => {
  const response = await request.get('/index.json')
  const index = (await response.json()) as StoryIndex
  const componentTitles = Object.values(index.entries)
    .filter((entry) => entry.type === 'story')
    .map((entry) => entry.title)
    .filter((title) => title.startsWith('Components/'))

  for (const group of [
    'Actions',
    'Fields and selection',
    'Navigation and disclosure',
    'Feedback and overlays',
    'Data display',
  ]) {
    expect(
      componentTitles.some((title) => title.startsWith(`Components/${group}/`))
    ).toBe(true)
  }

  expect(componentTitles.every((title) => title.split('/').length >= 3)).toBe(
    true
  )
})

test('component Docs avoid duplicate sidebar pages', async ({ page }) => {
  await page.goto('/?path=/docs/components-actions-button--docs')

  const sidebar = page.locator('#storybook-explorer-tree')
  for (const component of ['button', 'icon-button', 'action-group']) {
    await expect(
      sidebar.locator(`[id="components-actions-${component}--docs"]`)
    ).toBeVisible()
    await expect(
      sidebar.locator(
        `[id^="components-actions-${component}--"]:not([id$="--docs"])`
      )
    ).toHaveCount(0)
  }
})

test('auction story groups name the lifecycle and keep the alternative workspace in explorations', async ({
  request,
}) => {
  const response = await request.get('/index.json')
  const index = (await response.json()) as StoryIndex
  const entries = Object.values(index.entries)
  const activeAuctionEntries = entries.filter(
    (entry) =>
      entry.type === 'story' &&
      entry.title === 'Patterns/Market/Auctions/Active and upcoming auctions'
  )
  const completedAuctionEntries = entries.filter(
    (entry) =>
      entry.type === 'story' &&
      entry.title === 'Patterns/Market/Auctions/Completed and expired auctions'
  )
  const explorationEntries = entries.filter(
    (entry) =>
      entry.type === 'story' &&
      entry.title === 'Explorations/Auctions/Auction detail workspace'
  )

  expect(activeAuctionEntries).toHaveLength(3)
  expect(activeAuctionEntries.map((entry) => entry.name)).toEqual(
    expect.arrayContaining(['All table states', 'Restricted', 'Permissionless'])
  )
  expect(completedAuctionEntries.length).toBeGreaterThan(0)
  expect(explorationEntries.length).toBeGreaterThan(0)
  expect(
    explorationEntries.every((entry) => entry.tags?.includes('in-progress'))
  ).toBe(true)
  expect(
    index.entries['patterns-market-auctions-current--all-table-states']
  ).toBeDefined()
  expect(
    index.entries['patterns-market-auctions-history--completed-and-expired']
  ).toBeDefined()
  expect(
    index.entries['explorations-auctions-current-auction-flow--ready']
  ).toBeDefined()
})

test('mobile product navigation switches DTFs', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openStory(page, 'patterns-navigation--mobile-product')
  await page.getByRole('button', { name: /Switch DTF, current/ }).click()
  const drawer = page.getByRole('dialog', { name: 'Switch DTF' })
  await expect(drawer).toBeVisible()
  await drawer.getByRole('link', { name: /^LCAP/ }).click()
  await expect(drawer).toBeHidden()
  await expect(
    page.getByRole('button', { name: /Switch DTF, current/ })
  ).not.toHaveAccessibleName(/CMC20/)
})

test('inline eligibility keeps its confirmations and action reachable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openStory(page, 'components-feedback-and-overlays-dialog--long-content')
  await page.getByRole('button', { name: 'Open eligibility' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toHaveAccessibleName('Verify your eligibility')
  await expect(
    dialog.getByRole('button', { name: 'Confirm', exact: true })
  ).toBeInViewport()
  await expect(dialog.getByRole('checkbox')).toHaveCount(3)
  await expect(
    dialog.getByRole('list', { name: 'Jurisdiction-Based Prohibitions:' })
  ).toBeVisible()
  await dialog.screenshot({
    animations: 'disabled',
    path: test.info().outputPath('eligibility-inline-mobile.png'),
  })
})

test('all preserved transaction states render through their live control', async ({
  page,
  baseURL,
}) => {
  test.setTimeout(90_000)
  const checkIsolation = await observeIsolation(page, new URL(baseURL!).origin)
  for (const id of [
    'patterns-transactions-in-progress-zapper-and-rfq--quote-review',
    'patterns-transactions-in-progress-manual-issuance--mint-requirements',
    'patterns-transactions-in-progress-automated-issuance--quote-ready',
    'patterns-transactions-in-progress-stake-and-delegate--stake-amount',
    'patterns-transactions-in-progress-vote-lock-and-delegation--lock-amount',
  ]) {
    await page.goto(`/?path=/story/${id}`)
    const control = page.locator('#control-state')
    const showAddonPanel = page.getByRole('button', {
      name: 'Show addon panel',
    })
    if (await showAddonPanel.isVisible()) {
      await showAddonPanel.click()
    }
    await expect(control).toBeVisible()
    const options = await control
      .locator('option:not([disabled])')
      .evaluateAll((items) =>
        items
          .map((item) => ({
            value: (item as HTMLOptionElement).value,
            label: item.textContent ?? '',
          }))
          .filter((item) => item.value !== '')
      )
    expect(options.length).toBeGreaterThan(0)
    for (const option of options) {
      await test.step(`${id}: ${option.label}`, async () => {
        await control.selectOption(option.value)
        const frame = page.frameLocator('#storybook-preview-iframe')
        await expect(frame.locator('#storybook-root > *').first()).toBeVisible()
        await frame
          .locator('#storybook-root')
          .evaluate(
            () =>
              new Promise<void>((resolve) =>
                requestAnimationFrame(() =>
                  requestAnimationFrame(() => resolve())
                )
              )
          )
        await expect(frame.locator('.sb-errordisplay')).toBeHidden()
        await checkIsolation()
      })
    }
  }
})

test('initially open transaction dialogs receive and retain keyboard focus', async ({
  page,
}) => {
  for (const id of [
    'patterns-transactions-in-progress-stake-and-delegate--stake-amount',
    'patterns-transactions-in-progress-vote-lock-and-delegation--lock-amount',
  ]) {
    await openStory(page, id)
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeFocused()
    await page.keyboard.press('Tab')
    await expect
      .poll(() =>
        dialog.evaluate((element) => element.contains(document.activeElement))
      )
      .toBe(true)
    await page.keyboard.press('Shift+Tab')
    await expect
      .poll(() =>
        dialog.evaluate((element) => element.contains(document.activeElement))
      )
      .toBe(true)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  }
})

test('transaction modal examples reopen without a fabricated launch card', async ({
  page,
}) => {
  for (const [id, triggerLabel] of [
    [
      'patterns-transactions-in-progress-stake-and-delegate--delegation-failure',
      'Stake RSR',
    ],
    [
      'patterns-transactions-in-progress-vote-lock-and-delegation--delegation-updated',
      'Vote-lock $RSR',
    ],
  ]) {
    await openStory(page, id)
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    const trigger = page.getByRole('button', {
      name: triggerLabel,
      exact: true,
    })
    await expect(trigger).toBeVisible()
    await expect(trigger).toBeFocused()
    await expect(page.getByText('Exchange rate')).toHaveCount(0)

    await trigger.click()
    await expect(dialog).toBeVisible()
  }
})

test('processing delegation keeps space below the locked amount before the next surface', async ({
  page,
}) => {
  const id =
    'patterns-transactions-in-progress-vote-lock-and-delegation--sequential-delegation'
  for (const state of ['Normal signing', 'Fast signing']) {
    await page.goto(`${storyUrl(id)}&args=state:${encodeURIComponent(state)}`)

    const content = page.getByTestId('vote-lock-process-content-frame')
    const lockedAmount = page.getByTestId('delegation-locked-context')
    await expect(lockedAmount).toBeVisible()
    await expect(
      page.getByText(state === 'Normal signing' ? 'Upcoming' : 'Complete', {
        exact: true,
      })
    ).toBeVisible()
    await expect(
      page.getByTestId('vote-lock-process-button-region')
    ).toHaveCount(0)

    const contentBox = (await content.boundingBox())!
    const amountBox = (await lockedAmount.boundingBox())!
    expect(
      contentBox.y + contentBox.height - amountBox.y - amountBox.height
    ).toBeGreaterThanOrEqual(16)
  }
})

for (const [name, id, state, contentId, detailId] of [
  [
    'vote-lock',
    'patterns-transactions-in-progress-vote-lock-and-delegation--lock-amount',
    'Lock processing',
    'vote-lock-process-content-frame',
    'vote-lock-exchange-rate',
  ],
  [
    'stake',
    'patterns-transactions-in-progress-stake-and-delegate--stake-amount',
    'Stake processing',
    'stake-process-content-frame',
    'stake-task-fact',
  ],
] as const) {
  test(`${name} processing keeps space below its final detail`, async ({
    page,
  }) => {
    await page.goto(`${storyUrl(id)}&args=state:${encodeURIComponent(state)}`)
    const content = page.getByTestId(contentId)
    const detail = page.getByTestId(detailId).last()
    await expect(content).toBeVisible()
    await expect(detail).toBeVisible()

    const contentBox = (await content.boundingBox())!
    const detailBox = (await detail.boundingBox())!
    expect(
      contentBox.y + contentBox.height - detailBox.y - detailBox.height
    ).toBeGreaterThanOrEqual(16)
  })
}

test('table empty and unavailable states use their owners and loading rows share one alignment', async ({
  page,
}) => {
  for (const [id, title] of [
    [
      'patterns-market-earn-and-owned-positions--empty',
      'No opportunities to show',
    ],
    [
      'patterns-market-portfolio-tables--empty',
      'No Reserve activity found in this wallet',
    ],
  ]) {
    await openStory(page, id)
    const empty = page.getByTestId('canonical-empty-state')
    await expect(empty).toContainText(title)
    await expect(page.locator('#storybook-root')).not.toContainText(
      'No results.'
    )
  }
  await openStory(page, 'patterns-market-holdings--unavailable')
  await expect(page.getByTestId('canonical-inline-message')).toContainText(
    'Holdings unavailable'
  )
  await expect(page.getByTestId('canonical-empty-state')).toHaveCount(0)
  await openStory(page, 'patterns-market-portfolio-tables--empty')
  await expect(
    page.getByRole('heading', {
      name: 'No Reserve activity found in this wallet',
    })
  ).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  const actions = page.getByTestId('canonical-empty-state').getByRole('button')
  const [first, second] = [
    (await actions.nth(0).boundingBox())!,
    (await actions.nth(1).boundingBox())!,
  ]
  expect(first.width).toBe(second.width)
  expect(second.y).toBeGreaterThan(first.y)
  await page.setViewportSize({ width: 1280, height: 900 })
  await openStory(page, 'patterns-market-holdings--loading')
  const tops = await page.evaluate(() => {
    const row = [...document.querySelectorAll('tr')].find(
      (r) =>
        r.getBoundingClientRect().height > 0 &&
        r.querySelector('[data-testid=v1-skeleton]')
    )!
    return [...row.querySelectorAll('td')]
      .filter((td) => td.getBoundingClientRect().height > 0)
      .slice(1)
      .map((td) =>
        Math.round(
          td.querySelector('[data-testid=v1-skeleton]')!.getBoundingClientRect()
            .top
        )
      )
  })
  expect(new Set(tops).size).toBe(1)
})

test('destructive menu text, field errors and unchecked checkbox borders keep accessible contrast', async ({
  page,
}) => {
  const contrast = (pair: [string, string]) =>
    page.evaluate(([fg, bg]) => {
      const lum = (color: string) => {
        const values = color.match(/[\d.]+/g)!.map(Number)
        const channels = color.startsWith('color(')
          ? values.slice(0, 3)
          : values.slice(0, 3).map((value) => value / 255)
        const [r, g, b] = channels.map((value) =>
          value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
        )
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }
      const [light, dark] = [lum(fg), lum(bg)].sort((a, b) => b - a)
      return (light + 0.05) / (dark + 0.05)
    }, pair)
  for (const theme of ['light', 'dark'] as const) {
    await openStory(page, 'components-actions-menu--actions', theme)
    await page
      .getByRole('button', { name: 'More actions', exact: true })
      .click()
    const destructive = page.getByRole('menuitem', { name: 'Delete' })
    const menuColors = await destructive.evaluate((item) => {
      const surface = item.closest('[role=menu]')!
      return [
        getComputedStyle(item).color,
        getComputedStyle(surface).backgroundColor,
      ] as [string, string]
    })
    expect(await contrast(menuColors)).toBeGreaterThanOrEqual(4.5)
    await openStory(
      page,
      'components-fields-and-selection-checkbox--checkbox-playground',
      theme
    )
    const mark = page.getByTestId('canonical-checkbox-mark').first()
    await expect(
      page.getByTestId('canonical-checkbox').first()
    ).toHaveAttribute('data-state', 'unchecked')
    const boxColors = await mark.evaluate(
      (box) =>
        [
          getComputedStyle(box).borderTopColor,
          getComputedStyle(box).backgroundColor,
        ] as [string, string]
    )
    expect(await contrast(boxColors)).toBeGreaterThanOrEqual(3)
    await openStory(
      page,
      'components-fields-and-selection-text-input--states',
      theme
    )
    const errorColors = await page
      .locator('#allocation-error')
      .evaluate((message) => {
        let surface: Element | null = message
        while (
          surface &&
          getComputedStyle(surface).backgroundColor === 'rgba(0, 0, 0, 0)'
        )
          surface = surface.parentElement
        return [
          getComputedStyle(message).color,
          getComputedStyle(surface ?? document.body).backgroundColor,
        ] as [string, string]
      })
    expect(await contrast(errorColors)).toBeGreaterThanOrEqual(4.5)
  }
})

test('entity identity truncates long names and performance text clears light surface contrast', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openStory(page, 'components-data-display-entity-identity--long-name')
  const identity = page.getByTestId('canonical-entity-identity')
  const fit = await identity.evaluate((element) => {
    const name = element.querySelector<HTMLElement>(
      '[data-slot=entity-identity-name]'
    )!
    return {
      right: element.getBoundingClientRect().right,
      container: element.parentElement!.getBoundingClientRect().right,
      truncated: name.scrollWidth > name.clientWidth,
    }
  })
  expect(fit.right).toBeLessThanOrEqual(fit.container + 0.5)
  expect(fit.truncated).toBe(true)
  await page.setViewportSize({ width: 1280, height: 900 })
  for (const story of ['positive', 'negative']) {
    await openStory(page, `components-data-display-performance-value--${story}`)
    for (const surface of ['bg-interactive-content-hover', 'bg-secondary']) {
      const ratio = await page
        .locator('[data-slot=performance-value]')
        .evaluate((element, surfaceClass) => {
          const probe = document.createElement('div')
          probe.className = surfaceClass
          document.body.append(probe)
          const parse = (color: string) => {
            const values = color.match(/[\d.]+/g)!.map(Number)
            return color.startsWith('color(')
              ? values.slice(0, 3)
              : values.slice(0, 3).map((value) => value / 255)
          }
          const lum = (color: string) => {
            const [r, g, b] = parse(color).map((value) =>
              value <= 0.03928
                ? value / 12.92
                : ((value + 0.055) / 1.055) ** 2.4
            )
            return 0.2126 * r + 0.7152 * g + 0.0722 * b
          }
          const [light, dark] = [
            lum(getComputedStyle(element).color),
            lum(getComputedStyle(probe).backgroundColor),
          ].sort((a, b) => b - a)
          probe.remove()
          return (light + 0.05) / (dark + 0.05)
        }, surface)
      expect(ratio, `${story} on ${surface}`).toBeGreaterThanOrEqual(4.5)
    }
  }
})

test('disclosure and tooltip motion follow the scale and reduced motion', async ({
  page,
}) => {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    await page.emulateMedia({ reducedMotion })
    await openStory(
      page,
      'components-navigation-and-disclosure-accordion--sections'
    )
    await page.getByRole('button', { name: 'Governance', exact: true }).click()
    const disclosure = await page
      .getByRole('region', { name: 'Governance' })
      .evaluate((element) => {
        const style = getComputedStyle(element)
        return [style.animationName, style.animationDuration]
      })
    expect(disclosure).toEqual(
      reducedMotion === 'reduce' ? ['none', '0s'] : ['accordion-down', '0.18s']
    )

    await openStory(
      page,
      'components-feedback-and-overlays-help-tooltip--playground'
    )
    await page.getByRole('button', { name: 'About governance delay' }).click()
    const tooltip = await page
      .locator('[data-radix-popper-content-wrapper] > [data-state]')
      .first()
      .evaluate((element) => {
        const style = getComputedStyle(element)
        return [style.animationName, style.animationDuration]
      })
    expect(tooltip).toEqual(
      reducedMotion === 'reduce' ? ['none', '0s'] : ['enter', '0.18s']
    )
  }
})

test('contained track items show an unclipped inset focus ring', async ({
  page,
}) => {
  for (const [id, name] of [
    ['components-navigation-and-disclosure-tabs--compact', 'Exposure'],
    ['components-navigation-and-disclosure-segmented-control--contained', '1W'],
  ] as const) {
    await openStory(page, id)
    await page.keyboard.press('Tab')
    const ring = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement
      return {
        name: element.textContent,
        focused: element.matches(':focus-visible'),
        shadow: getComputedStyle(element).boxShadow,
      }
    })
    expect(ring).toMatchObject({ name, focused: true })
    expect(ring.shadow).toContain('inset')
  }
})

test('overlays use the motion scale and stop animating under reduced motion', async ({
  page,
}) => {
  const overlays = [
    ['components-actions-menu--actions', 'More actions', 'menu', '0.18s'],
    [
      'components-feedback-and-overlays-popover--playground',
      'View mandate',
      'dialog',
      '0.18s',
    ],
    [
      'components-feedback-and-overlays-dialog--whitepaper-information',
      'Review CFB Whitepaper',
      'dialog',
      '0.24s',
    ],
  ] as const
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    await page.emulateMedia({ reducedMotion })
    for (const [id, opener, role, duration] of overlays) {
      await openStory(page, id)
      await page.getByRole('button', { name: opener, exact: true }).click()
      const motion = await page
        .getByRole(role)
        .first()
        .evaluate((element) => {
          const style = getComputedStyle(element)
          return [style.animationName, style.animationDuration]
        })
      expect(motion).toEqual(
        reducedMotion === 'reduce' ? ['none', '0s'] : ['enter', duration]
      )
      await page.keyboard.press('Escape')
    }
  }
})

test('activity chart inspection drives the header and legend, and layouts keep their baseline', async ({
  page,
}) => {
  const id = 'dashboard-unreviewed-activity-chart'
  await openStory(page, `${id}--playground`)
  const value = page.getByTestId('chart-panel-value')
  const deposits = page.locator('[data-category="deposits"] dd')
  const total = await value.textContent()
  const depositsTotal = await deposits.textContent()
  const partialOpacity = () =>
    page
      .locator('rect[data-partial]')
      .evaluateAll((rects) => rects.map((r) => r.getAttribute('fill-opacity')))

  expect(new Set(await partialOpacity())).toEqual(new Set(['0.5']))

  const plot = page.getByRole('group', { name: /by category/ })
  await plot.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByText(/so far$/)).toBeVisible()
  expect(new Set(await partialOpacity())).toEqual(new Set(['1']))
  await expect(page.locator('output')).toContainText('so far')

  await page.keyboard.press('ArrowLeft')
  await expect(value).not.toHaveText(total!)
  await expect(deposits).not.toHaveText(depositsTotal!)
  expect(
    await page.locator('rect[fill-opacity="0.5"]:not([data-partial])').count()
  ).toBeGreaterThan(0)

  await plot.blur()
  await expect(value).toHaveText(total!)
  await expect(deposits).toHaveText(depositsTotal!)

  const withdrawalEdges = () =>
    page.evaluate(() => {
      const baseline = Number(
        document
          .querySelector('.recharts-reference-line line')
          ?.getAttribute('y1')
      )
      const rects = [
        ...document.querySelectorAll('rect[fill="hsl(var(--series-2))"]'),
      ].map((rect) => ({
        top: Number(rect.getAttribute('y')),
        bottom:
          Number(rect.getAttribute('y')) + Number(rect.getAttribute('height')),
      }))
      return {
        count: rects.length,
        above: rects.every((rect) => rect.bottom <= baseline),
        below: rects.every((rect) => rect.top >= baseline),
      }
    })

  expect(await withdrawalEdges()).toMatchObject({ above: true, below: false })
  await openStory(page, `${id}--diverging`)
  const diverging = await withdrawalEdges()
  expect(diverging.count).toBeGreaterThan(0)
  expect(diverging).toMatchObject({ above: false, below: true })

  await openStory(page, `${id}--empty`)
  await expect(page.getByTestId('chart-panel-value')).toHaveText('$0')
  await openStory(page, `${id}--unavailable`)
  await expect(page.getByTestId('chart-panel-value')).toHaveText('—')
})

test('one dashboard period control scopes every activity panel', async ({
  page,
}) => {
  await openStory(page, 'dashboard-unreviewed-eusd-activity-layout--playground')
  await page.getByRole('radio', { name: '7D' }).click()
  for (const measure of ['volume', 'count']) {
    const panel = page.getByTestId(`activity-dashboard-${measure}`)
    await expect(panel).toContainText('Last 7 days')
    await expect(
      panel.locator('.recharts-bar').first().locator('rect')
    ).toHaveCount(7)
  }
})
