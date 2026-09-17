import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  COMPONENT_GROUPS,
  COMPONENT_ITEMS,
  getComponentItem,
} from '../component-catalog'
import { CURRENT_REVIEW } from '../current-review'
import {
  COMPONENT_GROUP_MESSAGES,
  COMPONENT_NAME_MESSAGES,
  FOUNDATION_NAME_MESSAGES,
} from '../documentation-catalog-messages'
import { FOUNDATION_ITEMS } from '../foundation-catalog'
import {
  DOCUMENTATION_SEARCH_RECORDS,
  DOCUMENTATION_NAVIGATION,
  LEGACY_PATTERN_ALIASES,
  PATTERN_PRESENTATIONS,
  getChartPatternPresentation,
  getComponentPresentation,
  getPatternSourceItem,
  getWorkbenchActivity,
  searchDocumentation,
  type DocumentationNavigationGroup,
} from '../documentation-presentation'

describe('documentation presentation', () => {
  it('projects the approved human status without changing catalog authority', () => {
    expect(getComponentPresentation(getComponentItem('button').item!)).toEqual({
      design: 'accepted',
      code: 'reusable-module',
      production: 'not-in-production',
    })
    expect(getComponentPresentation(getComponentItem('drawer').item!)).toEqual({
      design: 'exploring',
      code: 'reusable-module',
      production: 'not-in-production',
    })
    expect(getComponentPresentation(getComponentItem('toast').item!)).toEqual({
      design: 'not-started',
      code: 'no-module',
      production: 'not-in-production',
    })
    expect(
      getComponentPresentation(getComponentItem('combobox').item!)
    ).toEqual({
      design: 'not-planned',
      code: 'no-module',
      production: 'not-in-production',
    })
  })

  it('indexes approved destinations, headings, and canonical pattern aliases', () => {
    const topLevelKeys = [
      'destination:start',
      'destination:foundations',
      'destination:components',
      'destination:patterns',
      'destination:workbench',
      'destination:records',
    ]
    expect(
      DOCUMENTATION_SEARCH_RECORDS.filter(({ sourceKey }) =>
        topLevelKeys.includes(sourceKey)
      ).map(({ sourceKey, route, destination }) => ({
        sourceKey,
        route,
        destination,
      }))
    ).toEqual([
      {
        sourceKey: 'destination:start',
        route: '/internal/design-system',
        destination: 'canonical',
      },
      {
        sourceKey: 'destination:foundations',
        route: '/internal/design-system/foundations',
        destination: 'canonical',
      },
      {
        sourceKey: 'destination:components',
        route: '/internal/design-system/components',
        destination: 'canonical',
      },
      {
        sourceKey: 'destination:patterns',
        route: '/internal/design-system/patterns',
        destination: 'canonical',
      },
      {
        sourceKey: 'destination:workbench',
        route: '/internal/design-system/workbench',
        destination: 'workbench',
      },
      {
        sourceKey: 'destination:records',
        route: '/internal/design-system/records',
        destination: 'records',
      },
    ])

    for (const group of COMPONENT_GROUPS) {
      expect(
        DOCUMENTATION_SEARCH_RECORDS.some(
          ({ route }) =>
            route === `/internal/design-system/components#${group.id}`
        )
      ).toBe(true)
    }

    for (const pattern of PATTERN_PRESENTATIONS) {
      expect(getPatternSourceItem(pattern.sourceKey).id).toBe(
        pattern.sourceKey.replace('component:', '')
      )
      expect(
        DOCUMENTATION_SEARCH_RECORDS.find(
          ({ route }) =>
            route === `/internal/design-system/patterns#${pattern.id}`
        )
      ).toMatchObject({
        sourceKey: `pattern:${pattern.id}`,
        destination: 'canonical',
      })
    }

    expect(LEGACY_PATTERN_ALIASES).toHaveLength(4)
  })

  it('covers every projected catalog identity with a localized descriptor', () => {
    expect(Object.keys(COMPONENT_GROUP_MESSAGES).sort()).toEqual(
      COMPONENT_GROUPS.map(({ id }) => id).sort()
    )
    expect(Object.keys(COMPONENT_NAME_MESSAGES).sort()).toEqual(
      COMPONENT_ITEMS.map(({ id }) => id).sort()
    )
    expect(Object.keys(FOUNDATION_NAME_MESSAGES).sort()).toEqual(
      FOUNDATION_ITEMS.map(({ id }) => id).sort()
    )
  })

  it('projects Charts from its canonical catalog source', () => {
    const chart = getChartPatternPresentation()
    expect(chart).toMatchObject({
      sourceKey: 'component:chart',
      route: '/internal/design-system/patterns#charts',
      item: { id: 'chart' },
      presentation: {
        design: 'accepted',
        production: 'not-in-production',
      },
    })
    expect(searchDocumentation('charts')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceKey: 'component:chart',
          route: '/internal/design-system/components#chart',
          destination: 'canonical',
        }),
        expect.objectContaining({
          sourceKey: 'pattern:charts',
          route: '/internal/design-system/patterns#charts',
          destination: 'canonical',
        }),
      ])
    )
    expect(chart.item.review.scope).toContain('Portfolio total/composition')
    const presentationSource = readFileSync(
      'src/views/internal/design-system/documentation-presentation.ts',
      'utf8'
    )
    expect(presentationSource).toContain('Portfolio total and composition')
    expect(presentationSource).toContain('governance records')
  })

  it('keeps navigation and search keyed to current catalog identities', () => {
    expect(DOCUMENTATION_NAVIGATION).toHaveLength(6)
    const componentResults = searchDocumentation('button')
    expect(componentResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceKey: 'component:button',
          route: '/internal/design-system/components#button',
        }),
      ])
    )
    const catalogKeys = new Set(
      COMPONENT_ITEMS.map(({ id }) => `component:${id}`)
    )
    for (const result of searchDocumentation('')) {
      const sourceKey = (result as { sourceKey: string }).sourceKey
      if (sourceKey.startsWith('component:')) {
        expect(catalogKeys.has(sourceKey), sourceKey).toBe(true)
      }
    }
  })

  it('projects component groups with directly navigable component anchors', () => {
    const components = DOCUMENTATION_NAVIGATION.find(
      ({ id }) => id === 'components'
    )
    expect(components && 'items' in components ? components.items : []).toEqual(
      COMPONENT_GROUPS.map((group) =>
        expect.objectContaining({
          id: group.id,
          route: `/internal/design-system/components#${group.id}`,
          items: group.items.map((item) =>
            expect.objectContaining({
              id: item.id,
              route: `/internal/design-system/components#${item.id}`,
            })
          ),
        })
      )
    )
  })

  it('projects complex pattern subsections as directly navigable anchors', () => {
    const patterns = DOCUMENTATION_NAVIGATION.find(
      ({ id }) => id === 'patterns'
    ) as DocumentationNavigationGroup | undefined
    const patternItems = patterns?.items

    expect(
      patternItems
        ?.find(({ id }) => id === 'charts')
        ?.items?.map(({ id }) => id)
    ).toEqual([
      'chart-overview',
      'chart-home',
      'chart-discover',
      'chart-yield',
      'chart-portfolio',
    ])
    expect(
      patternItems
        ?.find(({ id }) => id === 'tables')
        ?.items?.map(({ id }) => id)
    ).toEqual([
      'tables-current-rebalances',
      'tables-historical-rebalances',
      'tables-portfolio',
      'tables-holdings',
      'tables-discover',
      'tables-earn',
      'tables-governance',
    ])
    expect(
      patternItems
        ?.find(({ id }) => id === 'navigation')
        ?.items?.map(({ id }) => id)
    ).toEqual(['navigation-global', 'navigation-product', 'navigation-anatomy'])
  })

  it('routes the paused transaction family explorer through Workbench anchors', () => {
    const workbench = DOCUMENTATION_NAVIGATION.find(
      ({ id }) => id === 'workbench'
    ) as DocumentationNavigationGroup | undefined
    const transactionWorkbench = workbench?.items?.find(
      ({ id }) => id === 'transaction-workbench'
    )

    expect(workbench?.items?.slice(0, 2).map(({ id }) => id)).toEqual([
      'transaction-workbench',
      'current-review',
    ])
    expect(transactionWorkbench).toMatchObject({
      route: '/internal/design-system/workbench#transaction-workbench',
    })
    expect(
      transactionWorkbench?.items?.map(({ id, route }) => [id, route])
    ).toEqual([
      [
        'transactions-zapper',
        '/internal/design-system/workbench#transactions-zapper',
      ],
      [
        'transactions-automated',
        '/internal/design-system/workbench#transactions-automated',
      ],
      [
        'transactions-stake',
        '/internal/design-system/workbench#transactions-stake',
      ],
      [
        'transactions-vote-lock',
        '/internal/design-system/workbench#transactions-vote-lock',
      ],
      [
        'transactions-manual',
        '/internal/design-system/workbench#transactions-manual',
      ],
    ])
    expect(
      PATTERN_PRESENTATIONS.find(({ id }) => id === 'transactions')
        ?.workbenchRoute
    ).toBe('/internal/design-system/workbench#transaction-workbench')
    expect(getWorkbenchActivity('component:transaction-action')?.route).toBe(
      '/internal/design-system/workbench#transaction-workbench'
    )
  })

  it('retrieves components and foundations by their catalog descriptions', () => {
    const button = getComponentItem('button').item!
    const motion = FOUNDATION_ITEMS.find(({ id }) => id === 'motion')!

    expect(searchDocumentation(button.description)).toEqual([
      expect.objectContaining({
        sourceKey: 'component:button',
        route: '/internal/design-system/components#button',
      }),
    ])
    expect(searchDocumentation(motion.description)).toEqual([
      expect.objectContaining({
        sourceKey: 'foundation:motion',
        route: '/internal/design-system/foundations#motion',
      }),
    ])
  })

  it('routes casual browsing to overview anchors and ranks exact results first', () => {
    const foundations = DOCUMENTATION_NAVIGATION.find(
      ({ id }) => id === 'foundations'
    )
    expect(
      foundations && 'items' in foundations ? foundations.items : []
    ).toEqual(
      FOUNDATION_ITEMS.map((item) =>
        expect.objectContaining({
          id: item.id,
          route: `/internal/design-system/foundations#${item.id}`,
        })
      )
    )

    expect(searchDocumentation('Select')[0]).toMatchObject({
      sourceKey: 'component:select',
      route: '/internal/design-system/components#select',
    })
    expect(searchDocumentation('Chart')[0]).toMatchObject({
      route: '/internal/design-system/patterns#charts',
    })
    expect(searchDocumentation('Table')[0]).toMatchObject({
      route: '/internal/design-system/patterns#tables',
    })
    expect(searchDocumentation('Form')[0]).toMatchObject({
      sourceKey: 'pattern:forms',
      route: '/internal/design-system/patterns#forms',
    })
    expect(searchDocumentation('Navigation')[0]).toMatchObject({
      sourceKey: 'pattern:navigation',
      route: '/internal/design-system/patterns#navigation',
    })

    const presentationSource = readFileSync(
      'src/views/internal/design-system/documentation-presentation.ts',
      'utf8'
    )
    expect(presentationSource).toContain('tables: msg`Table`')
  })

  it('does not infer review activity from readiness metadata', () => {
    expect(CURRENT_REVIEW).toHaveLength(0)
    const transaction = getComponentItem('transaction-action').item!
    expect(getComponentPresentation(transaction).design).toBe('exploring')
    expect(getWorkbenchActivity('component:transaction-action')).toMatchObject({
      sourceKey: 'component:transaction-action',
      route: '/internal/design-system/workbench#transaction-workbench',
      activity: 'paused',
    })
    expect(getWorkbenchActivity('component:drawer')).toBeUndefined()
    const deferredBreadcrumb = getComponentItem('breadcrumb').item!
    expect(deferredBreadcrumb.review.status).toBe('deferred')
    expect(getComponentPresentation(deferredBreadcrumb).design).not.toBe(
      'not-planned'
    )
    expect(getWorkbenchActivity('component:breadcrumb')).toBeUndefined()
    expect(searchDocumentation('current review')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceKey: 'heading:current-review',
          route: '/internal/design-system/workbench#current-review',
        }),
      ])
    )
  })

  it('keeps the component overview free of state-sheet renderers', () => {
    const overview = readFileSync(
      'src/views/internal/design-system/canonical-components-overview.tsx',
      'utf8'
    )
    const overviewPage = readFileSync(
      'src/views/internal/design-system/documentation-components-page.tsx',
      'utf8'
    )
    const routes = readFileSync(
      'src/views/internal/design-system/index.tsx',
      'utf8'
    )
    expect(overview).not.toContain('component-visual-output')
    expect(overview).not.toContain('ComponentVisualOutput')
    expect(overviewPage).not.toContain('components-pages')
    expect(routes).toContain(
      "import ComponentDetail from './component-detail-entry'"
    )
    expect(routes).not.toContain('components-pages')
    expect(routes).not.toContain('standalone/component-detail')
  })
})
