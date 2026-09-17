import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ENTRY_FILES = [
  'src/views/internal/design-system/standalone/index.html',
  'src/views/internal/design-system/standalone/index.tsx',
  'vite.design-system.config.ts',
] as const

const FORBIDDEN_STARTUP_IMPORTS = [
  "from './app'",
  "from '@/app'",
  "from 'state/chain'",
  "from '@/state/chain'",
  "from 'state/updater'",
  "from '@/state/updater'",
  'mixpanel-browser',
  '@sentry/react',
  'utils/referral',
  'components/layout',
] as const

describe('standalone design-system entry', () => {
  it('owns a separate HTML, React, and Vite entry', () => {
    expect(ENTRY_FILES.every((path) => existsSync(resolve(path)))).toBe(true)
  })

  it('does not import product startup boundaries', () => {
    const source = readFileSync(
      resolve('src/views/internal/design-system/standalone/index.tsx'),
      'utf8'
    )

    for (const forbiddenImport of FORBIDDEN_STARTUP_IMPORTS) {
      expect(source).not.toContain(forbiddenImport)
    }
  })

  it('swaps only documentation-owned product boundaries in the standalone build', () => {
    const config = readFileSync(resolve('vite.design-system.config.ts'), 'utf8')
    const productBoundary = readFileSync(
      resolve('src/views/internal/design-system/component-detail-entry.ts'),
      'utf8'
    )

    expect(config).toContain("find: './component-detail-entry'")
    expect(config).toContain("resolve(entryRoot, 'component-detail.tsx')")
    expect(config).toContain("find: '@/components/token-logo'")
    expect(config).toContain("resolve(entryRoot, 'token-logo.tsx')")
    expect(productBoundary).toContain(
      "export { ComponentDetail as default } from './components-pages'"
    )
  })

  it('keeps machine review metadata out of the primary detail header', () => {
    const detail = readFileSync(
      resolve(
        'src/views/internal/design-system/standalone/component-detail.tsx'
      ),
      'utf8'
    )

    expect(detail).not.toContain('CatalogBadges')
    expect(detail).not.toContain('ComponentReviewReadiness')
    expect(detail).toContain('DocumentationStatus')
    expect(detail).toContain('component-detail-job')
  })
})
