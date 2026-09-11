import { test, expect } from '/Users/lill-kire/Code/register/e2e/fixtures/base'

for (const theme of ['light', 'dark']) for (const width of [375, 1400]) {
  test(`${theme} ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(theme => localStorage.setItem('theme-ui-color-mode', theme), theme)
    await page.goto('/display-preferences.html')
    const host = page.getByTestId('evaluation-host')
    await expect(host.getByRole('heading', { name: 'Display preferences', exact: true })).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await testInfo.attach('initial', { body: await page.screenshot(), contentType: 'image/png' })
    const first = host.getByRole('combobox', { name: 'Number format', exact: true })
    const second = host.getByRole('combobox', { name: 'Time zone', exact: true })
    for (const trigger of [first, second]) {
      await trigger.focus()
      await trigger.press('ArrowDown')
      await expect(page.getByRole('listbox')).toBeVisible()
      await expect(page.getByRole('option').first()).toBeFocused()
      const box = await page.getByRole('listbox').boundingBox()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(width)
      await page.keyboard.press('End')
      await expect(page.getByRole('option').last()).toBeFocused()
      await page.keyboard.press('Enter')
    }
    await expect(first).toContainText('1.234,56')
    await expect(second).toContainText('UTC')
    const save = host.getByRole('button', { name: 'Save preferences', exact: true })
    const feedback = host.getByText('Preferences saved', { exact: true })
    await save.click()
    await expect(feedback).toBeVisible()
    await expect(host.getByRole('status').filter({ hasText: 'Preferences saved' }).first()).toBeVisible()
    await testInfo.attach('saved', { body: await page.screenshot(), contentType: 'image/png' })
    await testInfo.attach('geometry', { body: Buffer.from(JSON.stringify(await host.evaluate(element => ({
      width: element.getBoundingClientRect().width,
      scrollWidth: element.scrollWidth,
      children: [...element.querySelectorAll('button,[role="status"]')].map(child => ({ text: child.textContent, rect: child.getBoundingClientRect().toJSON() })),
    })))), contentType: 'application/json' })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await second.focus()
    await second.press('ArrowDown')
    await expect(page.getByRole('option').last()).toBeFocused()
    await page.keyboard.press('Home')
    await expect(page.getByRole('option').first()).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(feedback).not.toBeVisible()
    await save.click()
    await expect(feedback).toBeVisible()
    await host.getByRole('button', { name: 'Reset', exact: true }).click()
    await expect(first).toContainText('1,234.56')
    await expect(second).toContainText('Local time')
    await expect(feedback).not.toBeVisible()
    await page.reload()
    await expect(first).toContainText('1,234.56')
    await expect(second).toContainText('Local time')
    await expect(feedback).not.toBeVisible()
  })
}
