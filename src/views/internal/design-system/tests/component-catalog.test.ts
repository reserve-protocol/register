import { describe, expect, it } from 'vitest'
import {
  COMPONENT_GROUPS,
  COMPONENT_ITEMS,
  getComponentItem,
} from '../component-catalog'

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
