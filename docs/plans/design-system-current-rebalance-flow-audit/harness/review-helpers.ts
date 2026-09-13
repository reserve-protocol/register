import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { advanceTime } from '../../../../e2e/helpers/clock'
import type { BoundaryRequest } from '../../../../e2e/helpers/requests'

const here = dirname(fileURLToPath(import.meta.url))
export const EVIDENCE_DIR = join(here, '..', 'evidence')

export async function shot(
  page: Page,
  area: string,
  name: string,
  options: { clip?: Locator } = {}
) {
  const dir = join(EVIDENCE_DIR, area)
  mkdirSync(dir, { recursive: true })
  const path = join(dir, `${name}.png`)
  await page.evaluate(() => document.fonts.ready)
  if (options.clip) await options.clip.screenshot({ path, animations: 'disabled' })
  else await page.screenshot({ path, animations: 'disabled' })
  return `evidence/${area}/${name}.png`
}

// Append-only observation log per area (single worker, sequential).
export function observations(area: string) {
  const dir = join(EVIDENCE_DIR, area)
  mkdirSync(dir, { recursive: true })
  const file = join(dir, 'observations.json')
  const load = (): Record<string, unknown> =>
    existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
  return {
    add(key: string, value: unknown) {
      const data = load()
      data[key] = value
      writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
    },
  }
}

export function fixtureFile(name: string, value: unknown) {
  const dir = join(EVIDENCE_DIR, 'fixtures')
  mkdirSync(dir, { recursive: true })
  writeFileSync(
    join(dir, `${name}.json`),
    JSON.stringify(value, (_k, v) => (typeof v === 'bigint' ? v.toString() : v), 2) + '\n'
  )
}

export const clean = (text: string | null | undefined) =>
  (text ?? '').trim().replace(/\s+/g, ' ')

export function setTheme(page: Page, theme: 'light' | 'dark') {
  return page.addInitScript(
    (mode) => localStorage.setItem('theme-ui-color-mode', mode),
    theme
  )
}

export function describeActive(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el || el === document.body) return 'body'
    const testId = el.getAttribute('data-testid')
    const label = el.getAttribute('aria-label')
    const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 50)
    return `${el.tagName.toLowerCase()}${testId ? `[testid=${testId}]` : ''}${
      label ? `[label=${label}]` : ''
    }${el.getAttribute('role') ? `[role=${el.getAttribute('role')}]` : ''}${
      el.getAttribute('href') ? `[href=${el.getAttribute('href')}]` : ''
    }: ${text}`
  })
}

export async function tabTrail(page: Page, count: number, from?: Locator) {
  if (from) await from.focus()
  const trail: string[] = [await describeActive(page)]
  for (let i = 0; i < count; i += 1) {
    await page.keyboard.press('Tab')
    trail.push(await describeActive(page))
  }
  return trail
}

// Data resolves in react-query flush rounds under the frozen clock: pump,
// wait for the list/proposal subgraph reads, pump again (same recipe as the
// tracked auction specs), then pump until the detail or list mounts.
export async function settle(page: Page, requests: BoundaryRequest[]) {
  await advanceTime(page, 5_000)
  await expect
    .poll(
      () =>
        requests.filter(
          (r) =>
            r.boundary === 'subgraph' &&
            ['getRebalances', 'GetIndexDtfProposals'].includes(r.operationName)
        ).length,
      { timeout: 20_000 }
    )
    .toBeGreaterThanOrEqual(2)
  await advanceTime(page, 5_000)
  await advanceTime(page, 5_000)
}

export async function pumpUntil(
  page: Page,
  predicate: () => Promise<boolean>,
  options: { stepMs?: number; maxSteps?: number } = {}
) {
  const step = options.stepMs ?? 5_000
  const max = options.maxSteps ?? 12
  for (let i = 0; i < max; i += 1) {
    if (await predicate()) return true
    await advanceTime(page, step)
  }
  return predicate()
}

const optionalText = async (page: Page, testId: string) => {
  const loc = page.getByTestId(testId)
  return (await loc.count()) ? clean(await loc.first().textContent()) : null
}

// textContent() on a missing locator waits for the action timeout; count first.
export const textOf = async (loc: Locator) =>
  (await loc.count()) ? clean(await loc.first().textContent()) : null

// One structured snapshot of every user-facing region of the rebalance detail.
export async function detailState(page: Page) {
  const root = page.getByTestId('dtf-auctions')
  const buttonState = async (testId: string) => {
    const loc = page.getByTestId(testId)
    if (!(await loc.count())) return null
    return { text: clean(await loc.first().textContent()), disabled: await loc.first().isDisabled() }
  }
  const pillLoc = root.locator('[data-testid="auctions-rebalance-header"] .rounded-full span')
  const headerPill = (await pillLoc.count()) ? await pillLoc.last().textContent() : null
  const progress = await root.evaluate((el) => {
    const h4s = [...el.querySelectorAll('h4')]
    const pick = (label: string) => {
      const h4 = h4s.find((h) => (h.textContent ?? '').includes(label))
      return h4?.parentElement?.querySelector('h1')?.textContent?.trim() ?? null
    }
    return { execution: pick('Execution progress'), nextTarget: pick('Next auction target') }
  })
  const overview = await root.evaluate((el) => {
    const rows = [...el.querySelectorAll('span')]
    const find = (label: string) => {
      const span = rows.find((s) => (s.textContent ?? '').trim() === label)
      const container = span?.closest('div.flex.items-center')?.parentElement
      return container ? (container.textContent ?? '').trim().replace(/\s+/g, ' ') : null
    }
    return {
      totalValueTraded: find('Total value traded:'),
      deviation: find('Current basket deviation:'),
      weightsSaved: find('Weights saved:'),
    }
  })
  const actionOverview = await root.evaluate((el) => {
    const h4s = [...el.querySelectorAll('h4')]
    const cell = (label: string) => {
      const h4 = h4s.find((h) => (h.textContent ?? '').trim() === label)
      const parent = h4?.parentElement
      if (!parent) return null
      return {
        text: (parent.textContent ?? '').trim().replace(/\s+/g, ' '),
        logos: parent.querySelectorAll('img').length,
        skeleton: !!parent.querySelector('[class*="animate-pulse"]'),
      }
    }
    return { estTradeValue: cell('Est. trade value:'), selling: cell('Selling:'), buying: cell('Buying:') }
  })
  const roundEl = page.getByTestId('auctions-round')
  const round = (await roundEl.count())
    ? { title: clean(await roundEl.textContent()), round: await roundEl.getAttribute('data-round'), description: await textOf(roundEl.locator('xpath=following-sibling::p')) }
    : null
  const auctionsRegion = await root.evaluate((el) => {
    const h4 = [...el.querySelectorAll('h4')].find((h) => /^Auction \d+$/.test((h.textContent ?? '').trim()))
    if (!h4) return null
    const card = h4.closest('.rounded-3xl')
    return {
      title: (h4.textContent ?? '').trim(),
      subtitle: (h4.nextElementSibling?.textContent ?? '').trim(),
      pill: (card?.querySelector('.bg-primary.text-primary-foreground.rounded-full span')?.textContent ?? '').trim(),
      chart: !!card?.querySelector('.recharts-wrapper'),
      bidDots: card?.querySelectorAll('.recharts-reference-dot').length ?? 0,
    }
  })
  const liquidity = await root.evaluate((el) => {
    const label = [...el.querySelectorAll('span')].find((s) => (s.textContent ?? '').trim() === 'Liquidity')
    const panel = label?.closest('.rounded-3xl')
    if (!panel) return null
    return {
      text: (panel.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 600),
      alerts: [...panel.querySelectorAll('[role="alert"]')].map((a) => (a.textContent ?? '').trim().replace(/\s+/g, ' ')),
      badges: [...panel.querySelectorAll('span')].map((s) => (s.textContent ?? '').trim()).filter((t) => /liquidity|Zapper error|Tradeable|Limited|Market closed|Simulation/.test(t)),
    }
  })
  const cowbot = await root.evaluate((el) => {
    const h4 = [...el.querySelectorAll('h4')].find((h) => (h.textContent ?? '').includes('CowSwap Auction Filler'))
    return h4 ? (h4.closest('.rounded-3xl')?.textContent ?? '').trim().replace(/\s+/g, ' ') : null
  })
  return {
    title: await optionalText(page, 'auctions-rebalance-title'),
    headerPill: headerPill?.trim() ?? null,
    error: await optionalText(page, 'auctions-rebalance-error'),
    cowbotBanner: (await root.getByText('Do not close this tab').count()) > 0,
    progress,
    overview,
    round,
    actionOverview,
    launch: await buttonState('auctions-launch-btn'),
    community: await buttonState('auctions-community-launch-btn'),
    priceUnavailable: await optionalText(page, 'auctions-price-unavailable'),
    communityUnavailable: (await root.getByText('Community launch is not available').count()) > 0,
    permissionlessCountdown: await textOf(root.locator('button:has-text("Permissionless in:")')),
    manageWeightsCard: (await root.getByText('Specify Exact Basket Weights').count()) > 0,
    auctions: auctionsRegion,
    liquidity,
    cowbot,
    completed: await optionalText(page, 'auctions-rebalance-completed'),
    debugPanel: (await root.getByText('Rebalance Percent:').count()) > 0,
    toasts: await page.locator('[data-sonner-toast]').allTextContents(),
  }
}

export const horizontalFit = (page: Page) =>
  page.evaluate(() => {
    const header =
      document.querySelector('[data-testid="auctions-rebalance-header"]') ??
      document.querySelector('[data-testid="auctions-rebalance-completed"]') ??
      document.querySelector('[data-testid="auctions-rebalance-list"]')
    const column = header?.closest('.md\\:w-\\[480px\\], [data-testid="auctions-rebalance-completed"], [data-testid="auctions-rebalance-list"]') ?? header
    const rect = column?.getBoundingClientRect()
    const overflowing = [...document.querySelectorAll('[data-testid="dtf-auctions"] *')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1)
      })
      .slice(0, 6)
      .map((el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''}:${Math.round(el.getBoundingClientRect().left)}..${Math.round(el.getBoundingClientRect().right)}`)
    return {
      viewport: window.innerWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      columnLeft: rect ? Math.round(rect.left) : null,
      columnRight: rect ? Math.round(rect.right) : null,
      columnWidth: rect ? Math.round(rect.width) : null,
      overflowing,
    }
  })
