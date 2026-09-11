import { chromium } from '/Users/lill-kire/Code/register/node_modules/.pnpm/playwright@1.59.1/node_modules/playwright/index.mjs'
import fs from 'node:fs'
const out = process.env.CLAUDE_JOB_DIR + '/tmp/shots'
const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const base = 'http://127.0.0.1:3005'
const b = await chromium.launch()
for (const job of jobs) {
  const width = job.width ?? 1400, height = job.height ?? 900
  const ctx = await b.newContext({ viewport: { width, height }, colorScheme: job.dark ? 'dark' : 'light', reducedMotion: 'reduce' })
  if (job.dark) await ctx.addInitScript(() => { try { localStorage.setItem('theme-ui-color-mode', 'dark') } catch {} })
  const p = await ctx.newPage()
  const errors = []
  p.on('pageerror', e => errors.push('pageerror: ' + e.message.slice(0, 200)))
  p.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)) })
  try {
    await p.goto(base + job.url, { waitUntil: 'domcontentloaded' })
    await p.waitForTimeout(job.wait ?? 5000)
    if (job.dark) { await p.evaluate(() => document.documentElement.classList.add('dark')); await p.waitForTimeout(300) }
    for (const a of job.actions ?? []) {
      try {
        if (a.click) await p.locator(a.click).first().click({ timeout: 4000 })
        if (a.clickText) await p.getByText(a.clickText, { exact: a.exact ?? true }).first().click({ timeout: 4000 })
        if (a.clickRole) await p.getByRole(a.clickRole.role, { name: a.clickRole.name, exact: a.exact ?? false }).first().click({ timeout: 4000 })
        if (a.fill) await p.locator(a.fill.sel).first().fill(a.fill.value, { timeout: 4000 })
        if (a.hover) await p.locator(a.hover).first().hover({ timeout: 4000 })
        if (a.key) await p.keyboard.press(a.key)
        if (a.tab) for (let i = 0; i < a.tab; i++) await p.keyboard.press('Tab')
        if (a.eval) await p.evaluate(a.eval)
        await p.waitForTimeout(a.wait ?? 600)
      } catch (e) { errors.push('action failed: ' + JSON.stringify(a) + ' ' + e.message.split('\n')[0]) }
    }
    const scrollerInfo = await p.evaluate(() => {
      let best = null, bestH = document.documentElement.scrollHeight
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el)
        if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 10 && el.clientHeight > 300 && el.scrollHeight > bestH) { best = el; bestH = el.scrollHeight }
      }
      if (best) { best.setAttribute('data-audit-scroller', '1'); return { sel: '[data-audit-scroller]', docH: best.scrollHeight, top: best.getBoundingClientRect().top, active: document.activeElement?.tagName + '#' + (document.activeElement?.id || '') + '.' + (document.activeElement?.className || '').toString().slice(0, 40), scrollTop: best.scrollTop } }
      return { sel: null, docH: document.documentElement.scrollHeight, top: 0, active: document.activeElement?.tagName, scrollTop: window.scrollY }
    })
    const docH = scrollerInfo.docH
    const scrollTo = async (y) => { await p.evaluate(({ sel, y }) => { const el = sel ? document.querySelector(sel) : null; if (el) el.scrollTop = y; else window.scrollTo(0, y) }, { sel: scrollerInfo.sel, y }); await p.waitForTimeout(300) }
    const heads = await p.evaluate((sel) => { const el = sel ? document.querySelector(sel) : null; const off = el ? el.scrollTop - el.getBoundingClientRect().top : window.scrollY; return [...document.querySelectorAll('h1,h2')].map(h => `${h.tagName} y=${Math.round(h.getBoundingClientRect().top + off)} ${h.textContent.trim().slice(0, 60)}`) }, scrollerInfo.sel)
    const links = job.links ? await p.$$eval('a[href]', as => [...new Set(as.map(a => a.getAttribute('href')).filter(h => h.startsWith('/internal/design-system/')))]) : null
    if (job.mode === 'tiles') {
      const step = job.tile ?? (height - 150), max = job.maxTiles ?? 6
      const start = job.startY ?? 0
      for (let i = 0, y = start; i < max && y < docH; i++, y += step) {
        await scrollTo(y)
        await p.screenshot({ path: `${out}/${job.name}-t${i}.png` })
      }
    } else if (job.mode === 'element') {
      const el = p.locator(job.selector).nth(job.nth ?? 0)
      await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(250)
      await el.screenshot({ path: `${out}/${job.name}.png` })
    } else {
      if (job.scrollTo != null) { await scrollTo(job.scrollTo) }
      if (job.scrollToText) { try { await p.getByText(job.scrollToText, { exact: false }).first().scrollIntoViewIfNeeded(); await p.waitForTimeout(300) } catch (e) { errors.push('scrollToText failed: ' + job.scrollToText) } }
      await p.screenshot({ path: `${out}/${job.name}.png`, fullPage: !!job.fullPage })
    }
    console.log(`## ${job.name} url=${p.url().replace(base, '')} docH=${docH} vw=${width}${job.dark ? ' dark' : ''} scroller=${scrollerInfo.sel} initialScrollTop=${scrollerInfo.scrollTop} active=${scrollerInfo.active}`)
    if (job.headings !== false) console.log(heads.slice(0, job.maxHeads ?? 40).join('\n'))
    if (links) console.log('LINKS:\n' + links.join('\n'))
    if (errors.length) console.log('ERRORS:\n' + [...new Set(errors)].slice(0, 8).join('\n'))
  } catch (e) { console.log(`## ${job.name} FAILED ${e.message.split('\n')[0]}`) }
  await ctx.close()
}
await b.close()
