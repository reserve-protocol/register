import { expect, type Page } from '@playwright/test'

export async function expectHelpToStayOpen(page: Page) {
  await expect(page.getByRole('tooltip')).toBeVisible()
  // A first-tap flash passed the old assertion; sample the full 1.5s reproduction window.
  const held = await page.evaluate(
    () =>
      new Promise<boolean>((resolve) => {
        const start = performance.now()
        const sample = () => {
          if (!document.querySelector('[role="tooltip"]')) resolve(false)
          else if (performance.now() - start >= 1500) resolve(true)
          else requestAnimationFrame(sample)
        }
        sample()
      })
  )
  expect(held, 'help remains mounted until deliberately dismissed').toBe(true)
}
