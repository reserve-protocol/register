import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { arch, platform, release } from 'node:os'
import { join } from 'node:path'
import { expect, test } from '../fixtures/base'
import {
  assertUnchangedSource,
  readReviewSource,
  requireReviewAttachments,
  watchReviewSource,
} from './review-source'

for (const theme of ['light', 'dark']) {
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 1400, height: 900 },
  ]) {
    test(`source-bound viewport capture: ${theme} ${viewport.width}`, async ({
      page,
      browser,
    }, testInfo) => {
      expect(
        process.env.DESIGN_SYSTEM_BASE_URL,
        'Use the owned server and DESIGN_SYSTEM_PORT for source-bound capture'
      ).toBeFalsy()
      const root = process.cwd()
      const guard = watchReviewSource(root)
      const before = readReviewSource(root)
      const views: unknown[] = []
      const capture = async (name: string) => {
        await page.evaluate(() => document.fonts.ready)
        await expect
          .poll(
            () =>
              page.locator('img').evaluateAll((images) =>
                images
                  .filter((image) => {
                    const box = image.getBoundingClientRect()
                    return (
                      box.width > 0 &&
                      box.height > 0 &&
                      box.bottom > 0 &&
                      box.top < innerHeight &&
                      box.right > 0 &&
                      box.left < innerWidth
                    )
                  })
                  .every(
                    (image) =>
                      image instanceof HTMLImageElement &&
                      image.complete &&
                      image.naturalWidth > 0
                  )
              ),
            { message: `Visible images ready for ${name}` }
          )
          .toBe(true)
        if (theme === 'dark') {
          await expect(page.locator('html')).toHaveClass(/\bdark\b/)
        } else {
          await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
        }
        const screenshot = await page.screenshot({ animations: 'disabled' })
        views.push({
          name,
          url: page.url(),
          metrics: await page.evaluate(() => ({
            renderedTheme: document.documentElement.classList.contains('dark')
              ? 'dark'
              : 'light',
            scrollY: window.scrollY,
            scrollContainers: [...document.querySelectorAll('*')]
              .filter((element) =>
                /auto|scroll/.test(getComputedStyle(element).overflowY)
              )
              .map((element) => ({
                tag: element.tagName,
                id: element.id,
                className: element.className,
                scrollTop: element.scrollTop,
                clientHeight: element.clientHeight,
                scrollHeight: element.scrollHeight,
              })),
            scrollWidth: document.documentElement.scrollWidth,
            viewport: { width: innerWidth, height: innerHeight },
            activeElement:
              document.activeElement?.getAttribute('data-testid') ??
              document.activeElement?.tagName,
            controls: [
              ...document.querySelectorAll(
                'button, input, label, [role="option"]'
              ),
            ]
              .filter((element) => element.getBoundingClientRect().height > 0)
              .slice(0, 80)
              .map((element) => {
                const rect = element.getBoundingClientRect()
                const css = getComputedStyle(element)
                return {
                  tag: element.tagName,
                  text: element.textContent?.trim(),
                  x: rect.x,
                  y: rect.y,
                  width: rect.width,
                  height: rect.height,
                  fontSize: css.fontSize,
                  fontWeight: css.fontWeight,
                  lineHeight: css.lineHeight,
                  color: css.color,
                  background: css.backgroundColor,
                  padding: css.padding,
                  gap: css.gap,
                  borderRadius: css.borderRadius,
                  borderColor: css.borderColor,
                  outline: css.outline,
                  boxShadow: css.boxShadow,
                }
              }),
            typography: [
              ...document.querySelectorAll(
                '[data-testid="typography-review-role-map"] div.min-w-0 > p:first-child'
              ),
            ].map((element) => {
              const css = getComputedStyle(element)
              const rect = element.getBoundingClientRect()
              return {
                text: element.textContent,
                fontFamily: css.fontFamily,
                fontSize: css.fontSize,
                fontWeight: css.fontWeight,
                lineHeight: css.lineHeight,
                letterSpacing: css.letterSpacing,
                color: css.color,
                width: rect.width,
                height: rect.height,
              }
            }),
          })),
        })
        await testInfo.attach(name, {
          body: screenshot,
          contentType: 'image/png',
        })
      }
      try {
        await page.setViewportSize(viewport)
        await page.addInitScript(
          (theme) => localStorage.setItem('theme-ui-color-mode', theme),
          theme
        )
        await page.goto('/internal/design-system/components')
        await expect(
          page.getByTestId('canonical-component-overview')
        ).toBeVisible()
        await capture('overview')

        await page.goto('/internal/design-system/components/button')
        const button = page.getByTestId('design-system-focus-button')
        await expect(button).toBeVisible()
        await button.focus()
        await expect(button).toBeFocused()
        await capture('button-focus')

        await page.goto('/internal/design-system/components/select')
        const select = page
          .getByTestId('select-state-sheet')
          .getByRole('combobox')
          .first()
        await select.click()
        await expect(page.getByRole('listbox')).toBeVisible()
        await capture('select-open')
        await page.keyboard.press('Escape')
        await expect(select).toBeFocused()

        for (const [id, route] of [
          ['checkbox', 'checkbox'],
          ['switch', 'switch'],
          ['field', 'input'],
          ['inline-message', 'alert'],
          ['lifecycle-status', 'badge'],
          ['entity-identity', 'entity-identity'],
          ['metric', 'metric'],
          ['link', 'link'],
        ]) {
          await page.goto(`/internal/design-system/components/${route}`)
          await expect(
            page.getByTestId(`component-detail-${route}`)
          ).toBeVisible()
          const sheet = page.getByTestId(`${id}-state-sheet`)
          await expect(sheet).toBeVisible()
          await sheet.scrollIntoViewIfNeeded()
          await capture(id)
          if (id === 'checkbox' || id === 'switch') {
            const control = sheet
              .getByRole(id)
              .filter({ visible: true })
              .first()
            await control.focus()
            await expect(control).toBeFocused()
            await capture(`${id}-focus`)
            const previous = await control.getAttribute('aria-checked')
            await page.keyboard.press('Space')
            await expect(control).not.toHaveAttribute('aria-checked', previous!)
            await capture(`${id}-changed`)
          }
        }

        await page.goto('/internal/design-system/foundations/typography')
        const samples = page
          .getByTestId('typography-review-role-map')
          .locator('div.min-w-0 > p:first-child')
        await expect(samples).toHaveCount(10)
        for (const [index, name] of [
          [0, 'typography-display'],
          [4, 'typography-panel'],
          [9, 'typography-auxiliary'],
        ] as const) {
          await samples.nth(index).scrollIntoViewIfNeeded()
          await capture(name)
        }
      } finally {
        const after = readReviewSource(root)
        guard.close()
        assertUnchangedSource(before, after, [...guard.changes])
        await testInfo.attach('source', {
          contentType: 'application/json',
          body: Buffer.from(
            JSON.stringify(
              {
                revision: execFileSync('git', ['rev-parse', 'HEAD'], {
                  cwd: root,
                  encoding: 'utf8',
                }).trim(),
                root,
                baseURL: testInfo.project.use.baseURL,
                launch:
                  'Playwright-owned strict-port Vite server; no external URL',
                node: process.version,
                packageManager: execFileSync('pnpm', ['--version'], {
                  cwd: root,
                  encoding: 'utf8',
                }).trim(),
                dependencies: Object.fromEntries(
                  [
                    '@playwright/test',
                    'vite',
                    'react',
                    'react-dom',
                    'tailwindcss',
                    '@lingui/core',
                  ].map((name) => [
                    name,
                    JSON.parse(
                      readFileSync(
                        join(root, 'node_modules', name, 'package.json'),
                        'utf8'
                      )
                    ).version,
                  ])
                ),
                browser: browser.version(),
                platform: platform(),
                release: release(),
                arch: arch(),
                theme,
                viewport,
                before,
                afterDigest: after.digest,
                privateConfigurationUnchanged: true,
                observedSourceChanges: [...guard.changes],
                views,
                exclusions: [
                  'No full-content capture CSS',
                  'No pixel-baseline approval',
                  'No motion judgment',
                  'Not all lab states',
                  'Source stability is checked during each test, not Vite startup',
                  'Installed dependency versions are recorded, not binary-attested',
                  'VITE_E2E configuration and default-deny remote asset mocks are active',
                  'Environment fingerprints remain in memory; public source digest excludes environment files',
                ],
              },
              null,
              2
            )
          ),
        })
      }
      requireReviewAttachments(
        testInfo.attachments.map((item) => item.name),
        [
          'overview',
          'button-focus',
          'select-open',
          'checkbox',
          'checkbox-focus',
          'checkbox-changed',
          'switch',
          'switch-focus',
          'switch-changed',
          'field',
          'inline-message',
          'lifecycle-status',
          'entity-identity',
          'metric',
          'link',
          'typography-display',
          'typography-panel',
          'typography-auxiliary',
          'source',
        ]
      )
    })
  }
}
