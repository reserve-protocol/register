import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import StandaloneComponentDetail from '../standalone/component-detail'

afterEach(cleanup)

const destinations = {
  chart: '/internal/design-system/patterns#charts',
  table: '/internal/design-system/patterns#tables',
  'global-navigation': '/internal/design-system/patterns#navigation-global',
  'product-navigation': '/internal/design-system/patterns#navigation-product',
  'transaction-action':
    '/internal/design-system/workbench#transaction-workbench',
}

describe('standalone component detail routing', () => {
  for (const [componentId, destination] of Object.entries(destinations)) {
    it(`returns ${componentId} compatibility records to the canonical surface`, () => {
      render(
        <MemoryRouter
          initialEntries={[`/internal/design-system/components/${componentId}`]}
        >
          <Routes>
            <Route
              path="/internal/design-system/components/:componentId"
              element={<StandaloneComponentDetail />}
            />
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByTestId('standalone-canonical-return')).toHaveAttribute(
        'href',
        destination
      )
    })
  }
})
