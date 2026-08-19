import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
  COMPONENT_GROUPS,
  COMPONENT_ITEMS,
  getComponentItem,
} from '../component-catalog'
import { CURRENT_REVIEW, FOUNDATION_CONFORMANCE_AREAS } from '../current-review'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { containedSelectionRecipe } from '@/components/design-system-v1/contained-selection'

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
      designAuthority: 'exploratory',
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
      'checkbox',
      'tabs',
      'dialog',
      'badge',
      'entity-identity',
      'metric',
      'card',
    ])
  })

  it('makes the accepted contained-selection baseline consumable without claiming Tabs is complete', () => {
    expect(getComponentItem('tabs').item).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'current-baseline',
      implementationStatus: 'reusable-recipe',
      implementationSource:
        'src/components/design-system-v1/tab-presentation.ts',
      adoptionStatus: 'none',
    })
    expect(containedSelectionRecipe.compact.track).toContain('h-8')
    expect(containedSelectionRecipe.compact.item).toContain('h-7')
    expect(containedSelectionRecipe.default.track).toContain('h-11')
    expect(containedSelectionRecipe.default.item).toContain('h-10')
  })

  it('keeps every declared relationship navigable', () => {
    for (const item of COMPONENT_ITEMS) {
      for (const relationship of item.relationships ?? []) {
        expect(getComponentItem(relationship.id).item).toBeDefined()
      }
    }
  })

  it('blocks the contained form composition on its unaccepted single-choice prerequisite', () => {
    const input = getComponentItem('input').item

    expect(input).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'exploratory',
      implementationStatus: 'canonical-candidate',
      adoptionStatus: 'none',
      review: { status: 'blocked' },
    })
    expect(
      input?.review.dependencies.find(
        (dependency) => dependency.name === 'Single-choice pill group'
      )
    ).toMatchObject({ status: 'provisional' })
  })

  it('keeps compact form choice separate from navigation and mode switching', () => {
    const radio = getComponentItem('radio-group').item

    expect(radio).toMatchObject({
      outputStatus: 'rendered',
      designAuthority: 'exploratory',
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
})

describe('current review', () => {
  it('contains only a small typed queue of human judgments', () => {
    expect(CURRENT_REVIEW.map((item) => item.title)).toEqual([
      'Single-choice form control',
    ])

    for (const item of CURRENT_REVIEW) {
      expect(item.title).not.toBe('')
      expect(item.reason.length).toBeGreaterThan(20)
      expect(item.destination).toMatch(/^\/internal\/design-system\//)
      expect(getComponentItem(item.componentId).item).toBeDefined()
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
