import { afterEach, expect, test, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

test('verification explicitly uses read-only snapshot mode', async () => {
  const { default: config } =
    await import('../../../playwright.design-system.config')
  expect(config.updateSnapshots).toBe('none')
})

test('owned preview accepts a free alternate port and remains strict', async () => {
  vi.stubEnv('DESIGN_SYSTEM_BASE_URL', '')
  vi.stubEnv('DESIGN_SYSTEM_PORT', '3019')
  const { default: config } =
    await import('../../../playwright.design-system.config')
  expect(config.use?.baseURL).toBe('http://127.0.0.1:3019')
  expect(config.webServer).toMatchObject({ reuseExistingServer: false })
  expect((config.webServer as { command: string }).command).toContain(
    '--strictPort'
  )
})

test('invalid ports fail before any server can start', async () => {
  vi.stubEnv('DESIGN_SYSTEM_PORT', '3019oops')
  await expect(
    import('../../../playwright.design-system.config')
  ).rejects.toThrow(/port/i)
})
