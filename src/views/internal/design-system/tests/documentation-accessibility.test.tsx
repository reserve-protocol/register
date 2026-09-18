import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import DocumentationSearch from '../documentation-search'
import LabShell from '../lab-shell'

const sectionContext = vi.hoisted(() => ({
  activeSectionId: 'button',
  activeSectionPath: ['actions', 'button'],
  navigateToSection: vi.fn(),
  sections: [
    { id: 'actions', label: 'Actions', path: ['actions'] },
    { id: 'button', label: 'Button', path: ['actions', 'button'] },
    {
      id: 'icon-button',
      label: 'Icon button',
      path: ['actions', 'icon-button'],
    },
    { id: 'feedback', label: 'Feedback', path: ['feedback'] },
    { id: 'alert', label: 'Alert', path: ['feedback', 'alert'] },
  ],
}))

vi.mock('../documentation-section-observer', () => ({
  DocumentationSectionProvider: ({ children }: { children: ReactNode }) =>
    children,
  useDocumentationSection: () => sectionContext,
}))

afterEach(() => {
  cleanup()
  sectionContext.navigateToSection.mockClear()
})

describe('documentation accessibility controls', () => {
  it('reports an empty search result while the query remains visible', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/internal/design-system']}>
        <DocumentationSearch inputId="documentation-search-test" />
      </MemoryRouter>
    )

    const search = screen.getByRole('combobox', {
      name: 'Search design system',
    })
    await user.type(search, 'zzzz-no-match')

    expect(search).toHaveValue('zzzz-no-match')
    expect(search).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('No results found.')
  })

  it('offers a keyboard skip link to the documentation content', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/internal/design-system']}>
        <LabShell>
          <p>Documentation content</p>
        </LabShell>
      </MemoryRouter>
    )

    const skipLink = screen.getByRole('link', {
      name: 'Skip to main content',
    })
    const content = document.getElementById('documentation-main-content')

    expect(skipLink).toHaveAttribute('href', '#documentation-main-content')
    expect(content).toHaveAttribute('tabindex', '-1')

    await user.tab()
    expect(skipLink).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(content).toHaveFocus()
  })
})
