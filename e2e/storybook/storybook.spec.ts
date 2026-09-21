import { expect, test, type Page } from '@playwright/test'

interface StoryIndexEntry {
  id: string
  name: string
  title: string
  type: string
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
  await openStory(page, 'components-button--states')

  const destructive = page.getByRole('button', { name: 'Delete' })
  await destructive.focus()
  await page.keyboard.press('Tab')

  await expect(page.getByRole('button', { name: 'Saving' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Unavailable' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'More actions' })).toBeFocused()
})

test('dialog keeps focus within the overlay and returns it to the trigger', async ({
  page,
}) => {
  await openStory(page, 'components-dialog--playground')

  const trigger = page.getByRole('button', { name: 'Open simulation' })
  await trigger.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  const close = page.getByRole('button', { name: 'Close dialog' })
  const simulate = page.getByRole('button', { name: 'Simulate' })
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(simulate).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('Docs, live Controls and accessibility results are available', async ({
  page,
}) => {
  await page.goto('/?path=/story/components-checkbox--checkbox-playground')
  const frame = page.frameLocator('#storybook-preview-iframe')
  const checkbox = frame.getByRole('checkbox', {
    name: 'Include governance assets',
  })
  await expect(checkbox).toBeVisible()
  await page.locator('label[for="control-disabled"]').click()
  await expect(checkbox).toBeDisabled()
  await page.getByRole('tab', { name: 'Code', exact: true }).click()
  await expect(
    page.getByText('<Checkbox', { exact: false }).first()
  ).toBeVisible()
  await page.getByRole('tab', { name: /Accessibility/ }).click()
  await expect(page.getByRole('tab', { name: /Violations/ })).toBeVisible()
  await page.goto('/?path=/docs/components-button--docs')
  await expect(
    frame.getByRole('heading', { name: 'Button', exact: true })
  ).toBeVisible()
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

test('eligibility long content stays readable with its action reachable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openStory(page, 'components-dialog--long-content')
  await page.getByRole('button', { name: 'Open eligibility' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(
    dialog.getByRole('button', { name: 'Confirm', exact: true })
  ).toBeInViewport()
  await expect(dialog.getByRole('checkbox')).toHaveCount(3)
})

test('all preserved transaction states render through their live control', async ({
  page,
  baseURL,
}) => {
  test.setTimeout(90_000)
  const checkIsolation = await observeIsolation(page, new URL(baseURL!).origin)
  for (const id of [
    'patterns-transactions-zapper-and-rfq--quote-review',
    'patterns-transactions-manual-issuance--mint-requirements',
    'patterns-transactions-automated-issuance--quote-ready',
    'patterns-transactions-stake-and-delegate--stake-amount',
    'patterns-transactions-vote-lock-and-delegation--lock-amount',
  ]) {
    await page.goto(`/?path=/story/${id}`)
    const control = page.locator('#control-state')
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
    'patterns-transactions-stake-and-delegate--stake-amount',
    'patterns-transactions-vote-lock-and-delegation--lock-amount',
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
