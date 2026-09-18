import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { matchesAny } from '../../../scripts/llm-workflow/lib/core.mjs'

const config = JSON.parse(readFileSync('llm-workflow.config.json', 'utf8'))
const rule = config.verify.find(
  (entry: { name: string }) => entry.name === 'design-system-browser'
)
const workflow = readFileSync('.github/workflows/design-system.yml', 'utf8')
const ciGlobs = [...workflow.matchAll(/^      - '([^']+)'$/gm)].map(
  (match) => match[1]
)

test('workflow and CI select canonical, fixture, style and dependency changes but not prose-only work', () => {
  for (const file of [
    'src/components/design-system-v1/field.tsx',
    'src/components/button/index.tsx',
    'src/components/icon-button/index.tsx',
    'src/components/checkbox/index.tsx',
    'src/components/dialog/index.tsx',
    'src/components/entity-identity/entity-identity.tsx',
    'src/components/metric/index.tsx',
    'src/components/lifecycle-status/index.tsx',
    'src/components/empty-state/index.tsx',
    'src/components/ui/v1-layout-recipes.ts',
    'src/views/internal/design-system/components-pages.tsx',
    'src/app.css',
    'public/fonts/font.woff2',
    'tailwind.config.ts',
    'playwright.design-system.config.ts',
    'pnpm-lock.yaml',
    'e2e/fixtures/base.ts',
    'e2e/helpers/rpc.ts',
  ]) {
    expect(matchesAny(file, rule.globs), file).toBe(true)
    expect(matchesAny(file, ciGlobs), file).toBe(true)
  }
  for (const file of [
    'docs/wiki/domains/design-system.md',
    'docs/wiki/domains/design-system-reference.md',
  ]) {
    expect(matchesAny(file, rule.globs), file).toBe(false)
    expect(matchesAny(file, ciGlobs), file).toBe(false)
  }
  expect(rule.commands).toContain('pnpm design-system:review')
  expect(workflow).toContain('run: pnpm design-system:review')
  expect(workflow).toContain('run: pnpm test:run')
  expect(workflow).not.toContain('run: pnpm design-system:capture')
  expect(workflow).toContain('retention-days: 30')
})
