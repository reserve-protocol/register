import { describe, expect, it } from 'vitest'

import { COMPONENT_ITEMS } from '../component-catalog'
import { DOCUMENTATION_COMPONENT_COVERAGE } from '../documentation-component-coverage'

describe('documentation component coverage record', () => {
  it('records a deliberate overview and canvas disposition for all 45 catalog entries', () => {
    expect(DOCUMENTATION_COMPONENT_COVERAGE).toHaveLength(45)
    expect(DOCUMENTATION_COMPONENT_COVERAGE.map(({ id }) => id)).toEqual(
      COMPONENT_ITEMS.map(({ id }) => id)
    )

    for (const entry of DOCUMENTATION_COMPONENT_COVERAGE) {
      expect(entry.overview).toBeTruthy()
      expect(entry.defaultDisposition).toBeTruthy()
      expect(entry.canvas.width).toBeTruthy()
      expect(entry.canvas.backdrop).toBeTruthy()
      expect(entry.canvas.padding).toBeTruthy()
      expect(entry.canvas.alignment).toBeTruthy()
      expect(entry.canvas.overflow).toBeTruthy()
      expect(entry.detailBoundary).toBeTruthy()

      if (entry.design === 'accepted') {
        expect(entry.acceptedAxes.length).toBeGreaterThan(0)
        expect(entry.overview).not.toBe('compact-status')
      }
    }
  })
})
