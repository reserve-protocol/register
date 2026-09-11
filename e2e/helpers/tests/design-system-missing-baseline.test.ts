import { spawnSync } from 'node:child_process'
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { expect, test } from 'vitest'

const require = createRequire(import.meta.url)

test('a real missing snapshot fails without creating a replacement', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'register-baseline-test-'))
  const config = path.resolve('playwright.design-system.config.ts')
  const playwright = require.resolve('@playwright/test')
  try {
    writeFileSync(
      path.join(directory, 'probe.config.ts'),
      `
      import base from ${JSON.stringify(config)}
      export default { ...base, testDir: ${JSON.stringify(directory)},
        testMatch: 'probe.spec.ts', reporter: [['list']], webServer: undefined,
        outputDir: ${JSON.stringify(path.join(directory, 'output'))},
        snapshotPathTemplate: '{testDir}/baselines/{arg}{ext}',
        projects: [{ name: 'missing-baseline' }] }
    `
    )
    writeFileSync(
      path.join(directory, 'probe.spec.ts'),
      `
      import { test, expect } from ${JSON.stringify(playwright)}
      test('missing baseline', () => expect('synthetic proof').toMatchSnapshot('missing.txt'))
    `
    )
    const result = spawnSync(
      process.execPath,
      [
        require.resolve('@playwright/test/cli'),
        'test',
        '--config',
        path.join(directory, 'probe.config.ts'),
      ],
      {
        encoding: 'utf8',
        timeout: 30_000,
        env: { ...process.env, FORCE_COLOR: '0' },
      }
    )
    expect(result.error).toBeUndefined()
    expect(result.status).toBe(1)
    expect(result.stdout + result.stderr).toMatch(
      /snapshot.*(?:doesn't exist|does not exist)/i
    )
    expect(readdirSync(directory)).not.toContain('baselines')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}, 35_000)
