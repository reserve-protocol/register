import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { WorkbenchOverviewPage } from '../documentation-pages'

describe('Workbench documentation integration', () => {
  it('keeps the transaction explorer on the Patterns page', () => {
    render(
      <MemoryRouter initialEntries={['/internal/design-system/workbench']}>
        <WorkbenchOverviewPage />
      </MemoryRouter>
    )

    expect(screen.queryByTestId('transaction-workbench')).toBeNull()
    expect(document.getElementById('current-review')).toBeVisible()
  })

  it('routes paused transaction activity to its Patterns section', () => {
    render(
      <MemoryRouter initialEntries={['/internal/design-system/workbench']}>
        <WorkbenchOverviewPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('link', { name: /Transaction systemPaused/i })
    ).toHaveAttribute('href', '/internal/design-system/patterns#transactions')
  })
})
