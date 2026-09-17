import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { WorkbenchOverviewPage } from '../documentation-pages'

vi.mock('../documentation-transaction-workbench', () => ({
  DocumentationTransactionWorkbench: () => (
    <section id="transaction-workbench" data-testid="transaction-workbench" />
  ),
}))

describe('Workbench documentation integration', () => {
  it('places the paused transaction explorer before review indexes', () => {
    render(
      <MemoryRouter initialEntries={['/internal/design-system/workbench']}>
        <WorkbenchOverviewPage />
      </MemoryRouter>
    )

    const workbench = screen.getByTestId('transaction-workbench')
    const currentReview = document.getElementById('current-review')!
    expect(workbench.compareDocumentPosition(currentReview)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
  })

  it('routes transaction activity back to the bounded Workbench explorer', () => {
    render(
      <MemoryRouter initialEntries={['/internal/design-system/workbench']}>
        <WorkbenchOverviewPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('link', { name: /Transaction systemPaused/i })
    ).toHaveAttribute(
      'href',
      '/internal/design-system/workbench#transaction-workbench'
    )
  })
})
