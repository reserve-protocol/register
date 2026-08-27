import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
  COMPONENT_GROUPS,
  COMPONENT_ITEMS,
  getComponentItem,
} from '../component-catalog'
import { getFoundationItem } from '../foundation-catalog'
import { CURRENT_REVIEW, FOUNDATION_CONFORMANCE_AREAS } from '../current-review'
import { PRODUCT_FACING_REVIEWS } from '../product-facing-component-audit'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { containedSelectionRecipe } from '@/components/design-system-v1/contained-selection'
import { actionGroupRecipe } from '@/components/design-system-v1/action-group'
import { tabPresentationRecipe } from '@/components/design-system-v1/tab-presentation'
import { segmentedControlPresentationRecipe } from '@/components/design-system-v1/segmented-control-presentation'

describe('component contract registry', () => {
  it('uses unique ids so every contract remains directly addressable', () => {
    const ids = COMPONENT_ITEMS.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every group dependencies, states, and definition decisions', () => {
    for (const group of COMPONENT_GROUPS) {
      expect(group.foundationDependencies.length).toBeGreaterThan(0)
      expect(group.defaultStates.length).toBeGreaterThan(0)
      expect(group.expectedDecisions.length).toBeGreaterThan(0)
    }
  })

  it('gives every component enough information to start an audit or state sheet', () => {
    for (const item of COMPONENT_ITEMS) {
      expect(item.evidence.length).toBeGreaterThan(0)
      expect(item.decisionPrompts.length).toBeGreaterThan(0)
      expect(item.nextAction.length).toBeGreaterThan(10)
    }
  })

  it('routes transaction synthesis to named strong visual evidence without promoting it', () => {
    const transaction = getComponentItem('transaction-action').item
    const amount = getComponentItem('amount-field').item

    for (const item of [transaction, amount]) {
      expect(item?.evidence).toContainEqual(
        expect.stringContaining(
          'src/views/internal/design-system/zapper-modal-study.tsx'
        )
      )
      expect(item?.evidence).toContainEqual(
        expect.stringContaining('strong visual composition evidence')
      )
      expect(item?.evidence).toContainEqual(
        expect.stringContaining('not canonical authority')
      )
    }

    expect(transaction?.evidence).toContainEqual(
      expect.stringContaining(
        'src/views/index-dtf/components/zapper/zapper-wrapper.tsx'
      )
    )
    expect(transaction).toMatchObject({
      designAuthority: 'exploratory',
      implementationStatus: 'specimen',
      adoptionStatus: 'none',
    })
  })

  it('names the authoritative source for every reusable component or recipe', () => {
    for (const item of COMPONENT_ITEMS.filter(
      (candidate) =>
        candidate.implementationStatus === 'canonical-candidate' ||
        candidate.implementationStatus === 'reusable-recipe'
    )) {
      expect(item.implementationSource).toMatch(/^src\/components\//)
      expect(existsSync(resolve(item.implementationSource ?? ''))).toBe(true)
    }
  })

  it('keeps design authority independent from implementation and adoption', () => {
    expect(getComponentItem('button').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      adoptionStatus: 'none',
    })
    expect(getComponentItem('card').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'specimen',
      adoptionStatus: 'none',
    })
    expect(getComponentItem('radio-group').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      adoptionStatus: 'none',
    })

    expect(
      COMPONENT_ITEMS.filter(
        (item) => item.designAuthority === 'current-baseline'
      ).map((item) => item.id)
    ).toEqual([
      'button',
      'icon-button',
      'button-group',
      'input',
      'textarea',
      'select',
      'multi-select-filter',
      'search',
      'checkbox',
      'radio-group',
      'switch',
      'segmented-control',
      'global-navigation',
      'product-navigation',
      'link',
      'tabs',
      'pagination',
      'dialog',
      'popover',
      'dropdown-menu',
      'tooltip',
      'spinner',
      'skeleton',
      'empty-state',
      'badge',
      'entity-identity',
      'metric',
      'card',
      'copy-value',
      'accordion',
      'collapsible',
    ])
  })

  it('records contained Tabs as the accepted unadopted contract', () => {
    expect(getComponentItem('tabs').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      implementationSource: 'src/components/design-system-v1/tabs.tsx',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(containedSelectionRecipe.compact.track).toContain('h-8')
    expect(containedSelectionRecipe.compact.track).toContain('gap-0.5')
    expect(containedSelectionRecipe.compact.item).toContain('h-7')
    expect(containedSelectionRecipe.default.track).toContain('h-11')
    expect(containedSelectionRecipe.default.track).toContain('gap-0.5')
    expect(containedSelectionRecipe.default.item).toContain('h-10')
    expect(containedSelectionRecipe.layout.content.track).toContain('w-fit')
    expect(containedSelectionRecipe.layout.content.item).toContain('shrink-0')
    expect(containedSelectionRecipe.layout.full.track).toContain('w-full')
    expect(containedSelectionRecipe.layout.full.item).toContain('flex-1')
    expect(tabPresentationRecipe.layout).toBe(containedSelectionRecipe.layout)
    expect(tabPresentationRecipe.compact.list).toBe(
      containedSelectionRecipe.compact.track
    )
    expect(tabPresentationRecipe.default.list).toBe(
      containedSelectionRecipe.default.track
    )
  })

  it('records synthesized candidates at their actual authority without claiming adoption', () => {
    expect(getComponentItem('spinner').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })

    expect(getComponentItem('skeleton').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })

    expect(getComponentItem('segmented-control').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(getComponentItem('textarea').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(getComponentItem('switch').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(getComponentItem('pagination').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(getComponentItem('copy-value').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })

    expect(getComponentItem('empty-state').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(
      getComponentItem('copy-value').item?.review.dependencies
    ).not.toContainEqual(expect.objectContaining({ name: 'HelpTooltip' }))
  })

  it('keeps both Segmented Control presentations under mode-selection semantics', () => {
    expect(
      segmentedControlPresentationRecipe['text-only'].compact.item
    ).toContain('text-sm font-light')
    expect(
      segmentedControlPresentationRecipe['text-only'].default.item
    ).toContain('text-base font-light')
    expect(segmentedControlPresentationRecipe.contained.compact.track).toBe(
      containedSelectionRecipe.compact.track
    )
    expect(segmentedControlPresentationRecipe.contained.default.track).toBe(
      containedSelectionRecipe.default.track
    )
    expect(getComponentItem('segmented-control').item?.review.scope).toContain(
      'Text-only compact/default'
    )
  })

  it('keeps every declared relationship navigable', () => {
    for (const item of COMPONENT_ITEMS) {
      for (const relationship of item.relationships ?? []) {
        expect(getComponentItem(relationship.id).item).toBeDefined()
      }
    }
  })

  it('keeps the Field baseline independent from repeated form composition', () => {
    const input = getComponentItem('input').item

    expect(input).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(input?.review.dependencies).not.toContainEqual(
      expect.objectContaining({ name: 'Single-choice pill group' })
    )
  })

  it('encodes ActionGroup without adding another Button family', () => {
    expect(getComponentItem('button-group').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'reusable-recipe',
      implementationSource: 'src/components/design-system-v1/action-group.tsx',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(actionGroupRecipe.horizontal).toContain('gap-2')
    expect(actionGroupRecipe.horizontal).not.toContain('flex-wrap')
    expect(actionGroupRecipe.vertical).toContain('[&>*]:w-full')

    expect(
      PRODUCT_FACING_REVIEWS.find((review) => review.id === 'action-groups')
        ?.status
    ).toBe('complete')
    expect(
      PRODUCT_FACING_REVIEWS.find(
        (review) => review.id === 'contained-form-rows'
      )?.status
    ).toBe('complete')
  })

  it('keeps compact form choice separate from navigation and mode switching', () => {
    const radio = getComponentItem('radio-group').item

    expect(radio).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      adoptionStatus: 'none',
      review: { status: 'ready' },
      implementationSource:
        'src/components/design-system-v1/single-choice-group.tsx',
    })
    expect(
      radio?.relationships?.find(
        (relationship) => relationship.id === 'segmented-control'
      )?.note
    ).toContain('form value')
  })

  it('keeps the reviewed lifecycle contract canonical without claiming adoption', () => {
    const lifecycle = getComponentItem('badge').item

    expect(lifecycle).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      adoptionStatus: 'none',
      auditStatus: 'mapped',
      review: { status: 'ready' },
    })
    expect(lifecycle?.review.scope).toContain(
      'Category labels, counts, qualifiers, removable chips'
    )

    const table = getComponentItem('table').item
    expect(
      table?.review.dependencies.find(
        (dependency) => dependency.name === 'Lifecycle status pill'
      )
    ).toMatchObject({ status: 'canonical' })
  })

  it('keeps explanatory help reviewable without claiming other tooltip jobs', () => {
    const tooltip = getComponentItem('tooltip').item

    expect(tooltip).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      adoptionStatus: 'none',
      review: { status: 'ready' },
      implementationSource: 'src/components/design-system-v1/help-tooltip.tsx',
    })
    expect(tooltip?.review.scope).toContain('Truncated values')
  })

  it('accepts bounded-value Select without claiming Combobox or Menu', () => {
    const select = getComponentItem('select').item

    expect(select).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      adoptionStatus: 'none',
      review: { status: 'ready' },
      implementationSource: 'src/components/design-system-v1/select.tsx',
    })
    expect(select?.review.scope).toContain('Search, rich entity options')
    expect(
      PRODUCT_FACING_REVIEWS.find(
        (review) => review.id === 'value-and-action-popups'
      )?.status
    ).toBe('ready')
  })

  it('does not manufacture Combobox and keeps the real Search baseline separate', () => {
    const combobox = getComponentItem('combobox').item
    const search = getComponentItem('search').item

    expect(combobox).toMatchObject({
      status: 'not-needed',
      outputStatus: 'none',
      designAuthority: 'undefined',
      implementationStatus: 'none',
      auditStatus: 'mapped',
    })
    expect(combobox?.statusDetail).toContain(
      'No recurring generic Combobox job'
    )
    expect(search).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      implementationSource: 'src/components/design-system-v1/search-field.tsx',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(search?.review.scope).toContain('Result rows')
  })

  it('keeps action Menu separate from bounded and committed value selection', () => {
    const menu = getComponentItem('dropdown-menu').item

    expect(menu).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      implementationSource: 'src/components/design-system-v1/menu.tsx',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(menu?.review.scope).toContain('Value selection')
  })

  it('keeps Drawer exploratory without absorbing task or selector orchestration', () => {
    expect(getComponentItem('drawer').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'exploratory',
      implementationStatus: 'canonical-candidate',
      implementationSource: 'src/components/design-system-v1/drawer.tsx',
      adoptionStatus: 'none',
      review: { status: 'exploration' },
    })
    expect(getComponentItem('drawer').item?.review.scope).toContain(
      'Task lifecycle, selector rows, tabs, validation'
    )
  })

  it('accepts Link, Accordion, and Collapsible while keeping context-blocked Inline Message provisional and unadopted', () => {
    expect(getComponentItem('link').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      implementationSource: 'src/components/design-system-v1/link.tsx',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(getComponentItem('accordion').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      implementationSource: 'src/components/design-system-v1/accordion.tsx',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(getComponentItem('accordion').item?.review.scope).toContain(
      'Task-section headers'
    )
    expect(getComponentItem('collapsible').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      implementationSource: 'src/components/design-system-v1/collapsible.tsx',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(getComponentItem('alert').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'exploratory',
      implementationStatus: 'canonical-candidate',
      implementationSource:
        'src/components/design-system-v1/inline-message.tsx',
      adoptionStatus: 'none',
      review: { status: 'provisional' },
    })
  })

  it('keeps accepted navigation baselines separate and unadopted', () => {
    expect(getComponentItem('global-navigation').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      implementationSource: 'src/components/design-system-v1/navigation.tsx',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(getComponentItem('product-navigation').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'canonical-candidate',
      implementationSource: 'src/components/design-system-v1/navigation.tsx',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(
      getComponentItem('global-navigation').item?.relationships
    ).toContainEqual(expect.objectContaining({ id: 'product-navigation' }))
    expect(
      getComponentItem('product-navigation').item?.relationships
    ).toContainEqual(expect.objectContaining({ id: 'global-navigation' }))
    expect(getComponentItem('product-navigation').item?.review.scope).toContain(
      'route-preservation policy'
    )
  })
})

describe('current review', () => {
  it('contains only a small typed queue of human judgments', () => {
    expect(CURRENT_REVIEW).toHaveLength(1)
    expect(getFoundationItem('color')).toMatchObject({
      status: 'defined',
      designAuthority: 'current-baseline',
    })
    expect(getFoundationItem('radius')).toMatchObject({
      status: 'defined',
      designAuthority: 'current-baseline',
    })

    for (const item of CURRENT_REVIEW) {
      expect(item.title).not.toBe('')
      expect(item.reason.length).toBeGreaterThan(20)
      expect(item.destination).toMatch(/^\/internal\/design-system\//)
      if (item.target.kind === 'component') {
        expect(getComponentItem(item.target.id).item).toBeDefined()
      } else {
        expect(getFoundationItem(item.target.id)).toBeDefined()
      }
      expect([
        'visual decision',
        'canonical review',
        'real-screen validation',
      ]).toContain(item.type)
      expect(item.foundationConformance.map((claim) => claim.area)).toEqual(
        FOUNDATION_CONFORMANCE_AREAS
      )
      for (const claim of item.foundationConformance) {
        expect([
          'conforms',
          'declared-provisional',
          'not-applicable',
        ]).toContain(claim.status)
        expect(claim.detail.length).toBeGreaterThan(20)
        expect(claim.verification.length).toBeGreaterThan(10)
      }
    }
  })

  it('keeps the transaction truth spectrum exploratory and unadopted', () => {
    expect(getComponentItem('transaction-action').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'exploratory',
      implementationStatus: 'specimen',
      adoptionStatus: 'none',
      review: { status: 'ready' },
    })
    expect(CURRENT_REVIEW[0]).toMatchObject({
      target: { kind: 'component', id: 'transaction-action' },
      destination:
        '/internal/design-system/components/transaction-action#transaction-truth-spectrum',
      type: 'visual decision',
    })
  })

  it('keeps accepted layout relationships behind semantic recipes', () => {
    expect(v1LayoutRecipes).toEqual({
      inset: {
        ordinaryContent: 'p-6',
        nestedContent: 'p-4',
      },
      stack: {
        tightText: 'space-y-1',
        relatedContent: 'space-y-2',
        internalRegions: 'space-y-4',
        completeGroups: 'space-y-6',
        majorRegions: 'space-y-8',
      },
      cluster: {
        tightText: 'gap-1',
        relatedContent: 'gap-2',
        internalRegions: 'gap-4',
        completeGroups: 'gap-6',
      },
      seam: {
        subsection: 'gap-px',
        major: 'gap-0.5',
      },
    })
  })
})

describe('component adoption progress', () => {
  it('reserves the in-use gate for actual production adoption', async () => {
    const gatesFor = async (adoptionStatus: 'opt-in' | 'in-use') => {
      vi.resetModules()
      const { getComponentItem: getFreshComponentItem } =
        await import('../component-catalog')
      const item = getFreshComponentItem('button').item
      expect(item).toBeDefined()
      if (!item) return []

      item.adoptionStatus = adoptionStatus
      const { PROGRESS_GROUPS } = await import('../progress-data')
      return (
        PROGRESS_GROUPS.find((group) => group.id === 'components')?.items.find(
          (progressItem) => progressItem.id === item.id
        )?.gates ?? []
      )
    }

    await expect(gatesFor('opt-in')).resolves.toContain('applied')
    await expect(gatesFor('opt-in')).resolves.not.toContain('in-use')
    await expect(gatesFor('in-use')).resolves.toEqual(
      expect.arrayContaining(['applied', 'in-use'])
    )
  })
})
