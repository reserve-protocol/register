import { expect, test, type Page } from '@playwright/test'

const DIRECT_ROUTES = [
  ['/internal/design-system', 'documentation-start'],
  ['/internal/design-system/foundations', 'foundations-overview'],
  ['/internal/design-system/components', 'components-overview'],
  ['/internal/design-system/patterns', 'patterns-overview'],
  ['/internal/design-system/components/button', 'component-detail-button'],
  ['/internal/design-system/workbench', 'workbench-overview'],
  ['/internal/design-system/records', 'internal-records-overview'],
] as const

const isLoopback = (url: string) => {
  const hostname = new URL(url).hostname
  return hostname === '127.0.0.1' || hostname === 'localhost'
}

const installProviderTrace = async (page: Page) => {
  await page.addInitScript(() => {
    const methods: string[] = []
    const provider = {
      request: async ({ method }: { method: string }) => {
        methods.push(method)
        if (method === 'eth_accounts' || method === 'eth_requestAccounts') {
          return []
        }
        return null
      },
      on: () => undefined,
      removeListener: () => undefined,
    }

    Reflect.set(window, '__standaloneProviderMethods', methods)
    Reflect.set(window, 'ethereum', provider)
  })
}

test.describe('standalone design-system entry', () => {
  for (const [routePath, testId] of [
    ['/internal/design-system', 'documentation-start'],
    ['/internal/design-system/foundations', 'foundations-overview'],
    ['/internal/design-system/components', 'components-overview'],
    ['/internal/design-system/patterns', 'patterns-overview'],
    ['/internal/design-system/workbench', 'workbench-overview'],
    ['/internal/design-system/components/button', 'component-detail-button'],
    ['/internal/design-system/components/chart', 'component-detail-chart'],
  ] as const) {
    test(`boots ${routePath} without product network or wallet startup`, async ({
      page,
    }) => {
      const externalAttempts = new Set<string>()
      const webSockets = new Set<string>()

      await installProviderTrace(page)
      page.on('request', (request) => {
        if (!isLoopback(request.url())) externalAttempts.add(request.url())
      })
      page.on('websocket', (socket) => {
        if (!isLoopback(socket.url())) webSockets.add(socket.url())
      })
      await page.route('**/*', async (route) => {
        if (isLoopback(route.request().url())) {
          await route.continue()
          return
        }
        await route.abort('blockedbyclient')
      })

      await page.goto(routePath, { waitUntil: 'networkidle' })

      expect(
        await page.evaluate(() =>
          Reflect.get(window, '__standaloneProviderMethods')
        )
      ).toEqual([])
      expect([...externalAttempts]).toEqual([])
      expect([...webSockets]).toEqual([])
      await expect(page.locator('[data-runtime="standalone"]')).toBeVisible()
      await expect(page.getByTestId(testId)).toBeVisible()
    })
  }

  test('reloads protected documentation routes directly', async ({ page }) => {
    for (const [path, testId] of DIRECT_ROUTES) {
      await page.goto(path)
      await expect(page.getByTestId(testId)).toBeVisible()
      await page.reload()
      await expect(page.getByTestId(testId)).toBeVisible()
    }

    await page.goto('/internal/design-system/patterns/tables')
    await expect(page).toHaveURL(
      /\/internal\/design-system\/components\/table$/
    )
    await expect(page.getByTestId('component-detail-table')).toBeVisible()

    await page.evaluate(() => {
      localStorage.setItem('register.locale', JSON.stringify('es'))
    })
    await page.goto('/internal/design-system/components/chart')
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    await expect(page.getByTestId('component-detail-chart')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Chart' })).toBeVisible()
    await expect(
      page.getByRole('link', {
        name: 'Open pattern documentation',
      })
    ).toBeVisible()
  })

  test('keeps every rendered documentation family inside the standalone asset boundary', async ({
    page,
  }) => {
    const externalAttempts = new Set<string>()
    const webSockets = new Set<string>()
    const localAssetFailures = new Set<string>()

    await installProviderTrace(page)
    page.on('request', (request) => {
      if (!isLoopback(request.url())) externalAttempts.add(request.url())
    })
    page.on('response', (response) => {
      const url = response.url()
      if (isLoopback(url) && response.status() >= 400 && isAssetUrl(url)) {
        localAssetFailures.add(`${response.status()} ${url}`)
      }
    })
    page.on('requestfailed', (request) => {
      if (isLoopback(request.url()) && isAssetUrl(request.url())) {
        localAssetFailures.add(
          `${request.failure()?.errorText ?? 'request failed'} ${request.url()}`
        )
      }
    })
    page.on('websocket', (socket) => {
      if (!isLoopback(socket.url())) webSockets.add(socket.url())
    })
    await page.route('**/*', async (route) => {
      if (isLoopback(route.request().url())) {
        await route.continue()
        return
      }
      await route.abort('blockedbyclient')
    })

    for (const [routePath, familyTestId] of DOCUMENTATION_FAMILY_ROUTES) {
      await page.goto(routePath, { waitUntil: 'networkidle' })
      for (const family of await page.getByTestId(familyTestId).all()) {
        await family.scrollIntoViewIfNeeded()
      }
      await page.waitForLoadState('networkidle')
      const tokenLogos = page.locator('[data-documentation-token-logo]')
      if ((await tokenLogos.count()) > 0) {
        await expect
          .poll(() =>
            tokenLogos.evaluateAll((images) =>
              images.every(
                (image) =>
                  image instanceof HTMLImageElement &&
                  image.complete &&
                  image.naturalWidth > 0
              )
            )
          )
          .toBe(true)
      }
    }

    const desktopProduct = page.getByTestId('navigation-product-desktop')
    await desktopProduct.scrollIntoViewIfNeeded()
    await desktopProduct.getByLabel('Product identity').click()
    await page.getByRole('option', { name: 'PHOTON' }).click()
    await desktopProduct
      .getByRole('group', { name: 'Desktop Product state' })
      .getByText('Switcher', { exact: true })
      .click()
    await expect(
      desktopProduct.locator('[data-documentation-provider-safe-mark]')
    ).toHaveCount(DOCUMENTATION_DESKTOP_SWITCHER_MARK_COUNT)

    const constrainedProduct = page.getByTestId(
      'navigation-product-constrained'
    )
    await constrainedProduct.scrollIntoViewIfNeeded()
    await constrainedProduct.getByLabel('Product identity').click()
    await page.getByRole('option', { name: 'NEOCLOUD' }).click()
    await constrainedProduct
      .getByRole('group', { name: 'Constrained Product state' })
      .getByText('Switcher', { exact: true })
      .click()
    await expect(
      constrainedProduct.locator('[data-documentation-provider-safe-mark]')
    ).toHaveCount(DOCUMENTATION_SWITCHER_MARK_COUNT)
    await expect(
      page.locator('[data-documentation-provider-safe-mark] img')
    ).toHaveCount(0)

    await expect.poll(() => externalAttempts.size).toBe(0)
    expect([...localAssetFailures]).toEqual([])
    expect([...webSockets]).toEqual([])
    expect(
      await page.evaluate(() =>
        Reflect.get(window, '__standaloneProviderMethods')
      )
    ).toEqual([])
  })
})

const DOCUMENTATION_SWITCHER_MARK_COUNT = 16
const DOCUMENTATION_DESKTOP_SWITCHER_MARK_COUNT = 16
const isAssetUrl = (url: string) =>
  /\.(?:avif|gif|jpe?g|otf|png|svg|webp|woff2?)(?:\?|$)/i.test(url)
const DOCUMENTATION_FAMILY_ROUTES = [
  ['/internal/design-system/foundations', 'foundation-reference-section'],
  ['/internal/design-system/components', 'component-reference-section'],
  ['/internal/design-system/patterns', 'pattern-reference-section'],
] as const
