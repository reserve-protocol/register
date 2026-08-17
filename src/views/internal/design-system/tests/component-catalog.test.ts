import { describe, expect, it, vi } from 'vitest'
import {
  COMPONENT_GROUPS,
  COMPONENT_ITEMS,
  getComponentItem,
} from '../component-catalog'
import { CURRENT_REVIEW, FOUNDATION_CONFORMANCE_AREAS } from '../current-review'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'

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

  it('keeps every declared relationship navigable', () => {
    for (const item of COMPONENT_ITEMS) {
      for (const relationship of item.relationships ?? []) {
        expect(getComponentItem(relationship.id).item).toBeDefined()
      }
    }
  })
})

describe('current review', () => {
  it('contains only a small typed queue of human judgments', () => {
    expect(CURRENT_REVIEW.map((item) => item.title)).toEqual([])

    for (const item of CURRENT_REVIEW) {
      expect(item.title).not.toBe('')
      expect(item.reason.length).toBeGreaterThan(20)
      expect(item.destination).toMatch(/^\/internal\/design-system\//)
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
