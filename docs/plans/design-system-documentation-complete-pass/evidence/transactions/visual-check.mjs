import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const output = new URL('./captures/', import.meta.url)
await mkdir(output, { recursive: true })

const browser = await chromium.launch({ headless: true })
const results = []
for (const variant of [
  { name: 'desktop-light', width: 1400, height: 1000, dark: false },
  { name: 'desktop-dark', width: 1400, height: 1000, dark: true },
  { name: 'phone-light', width: 390, height: 844, dark: false },
  { name: 'phone-dark', width: 390, height: 844, dark: true },
  { name: 'narrow-controls', width: 320, height: 800, dark: false },
]) {
  const page = await browser.newPage({
    viewport: { width: variant.width, height: variant.height },
    colorScheme: variant.dark ? 'dark' : 'light',
  })
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.goto(
    'http://127.0.0.1:3066/internal/design-system/workbench#transaction-workbench',
    { waitUntil: 'domcontentloaded' }
  )
  await page.waitForSelector('#transactions-manual')
  await page.evaluate((dark) => {
    document.documentElement.classList.toggle('dark', dark)
  }, variant.dark)
  await page.locator('#transaction-workbench').screenshot({
    path: new URL(`${variant.name}.png`, output).pathname,
  })
  if (variant.name === 'desktop-light' || variant.name === 'phone-light') {
    for (const id of [
      'transactions-zapper',
      'transactions-automated',
      'transactions-stake',
      'transactions-vote-lock',
      'transactions-manual',
    ]) {
      await page.locator(`#${id}`).screenshot({
        path: new URL(`${variant.name}-${id}.png`, output).pathname,
      })
    }
  }
  const probe = await page.evaluate(() => {
    const app = document.getElementById('app-container')
    const root = document.getElementById('transaction-workbench')
    const familyIds = [
      'transactions-zapper',
      'transactions-automated',
      'transactions-stake',
      'transactions-vote-lock',
      'transactions-manual',
    ]
    return {
      familyOrder: familyIds.filter((id) => document.getElementById(id)),
      familyRects: familyIds.map((id) => {
        const rect = document.getElementById(id)?.getBoundingClientRect()
        return { id, top: rect?.top, height: rect?.height }
      }),
      specimens: root?.querySelectorAll(
        '[data-testid="transaction-current-specimen"]'
      ).length,
      auditIndexes: root?.querySelectorAll(
        '[data-testid="transaction-audit-index"]'
      ).length,
      pageOverflow: app ? app.scrollWidth > app.clientWidth : null,
      controlOverflow: Array.from(
        root?.querySelectorAll('[data-specimen-control-bar]') ?? []
      ).some((element) => element.scrollWidth > element.clientWidth),
    }
  })
  results.push({
    ...variant,
    ...probe,
    consoleErrors,
    pageErrors,
  })
  await page.close()
}
await browser.close()
process.stdout.write(JSON.stringify(results, null, 2))
