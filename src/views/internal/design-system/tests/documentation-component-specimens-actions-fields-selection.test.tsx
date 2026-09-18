import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import { ActionComponentSpecimen } from '../documentation-component-specimens-actions'
import { FieldComponentSpecimen } from '../documentation-component-specimens-fields'
import { SelectionComponentSpecimen } from '../documentation-component-specimens-selection'

afterEach(cleanup)

const renderFieldSpecimen = (itemId: string) =>
  render(
    <MemoryRouter>
      <FieldComponentSpecimen itemId={itemId} />
    </MemoryRouter>
  )

describe('Actions documentation specimens', () => {
  it('shows the accepted Compact Icon Button tones and important states only', () => {
    render(<ActionComponentSpecimen itemId="icon-button" />)

    const specimens = screen.getAllByTestId('canonical-icon-button')

    expect(specimens).toHaveLength(6)
    expect(
      specimens.every((specimen) => specimen.dataset.size === 'compact')
    ).toBe(true)
    expect(specimens.map((specimen) => specimen.dataset.tone)).toEqual([
      'primary',
      'secondary',
      'quiet',
      'destructive',
      'secondary',
      'secondary',
    ])
    expect(
      screen.getByRole('button', { name: 'Settings unavailable' })
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Saving settings' })
    ).toHaveAttribute('aria-busy', 'true')
    expect(document.querySelector('[data-size="micro"]')).toBeNull()
    expect(document.querySelector('[data-size="default"]')).toBeNull()
  })

  it('shows all three accepted Action Group recipes', () => {
    render(<ActionComponentSpecimen itemId="button-group" />)

    expect(screen.getByText('Related actions')).toBeVisible()
    expect(screen.getByText('Destructive confirmation')).toBeVisible()
    expect(screen.getByText('Narrow task')).toBeVisible()

    const groups = screen.getAllByTestId('canonical-action-group')
    expect(groups).toHaveLength(3)
    expect(groups[0]).toHaveAttribute('data-direction', 'horizontal')
    expect(groups[0].querySelectorAll('[data-size="compact"]')).toHaveLength(2)
    expect(groups[1]).toHaveAttribute('data-direction', 'horizontal')
    expect(groups[1].querySelectorAll('[data-size="default"]')).toHaveLength(2)
    expect(groups[2]).toHaveAttribute('data-direction', 'vertical')
    expect(groups[2].querySelectorAll('[data-size="default"]')).toHaveLength(2)
  })
})

describe('Fields documentation specimens', () => {
  it('shows Text Input anatomy and ordinary accepted states', () => {
    renderFieldSpecimen('input')

    expect(screen.getByText('Empty with help')).toBeVisible()
    expect(screen.getByText('Filled')).toBeVisible()
    expect(screen.getByText('Focus visible')).toBeVisible()
    expect(screen.getByText('Invalid')).toBeVisible()
    expect(screen.getByText('Read-only')).toBeVisible()
    expect(screen.getByText('Unavailable')).toBeVisible()
    expect(screen.getAllByTestId('canonical-text-input')).toHaveLength(6)
    expect(
      document.querySelector('[data-documentation-state="focus-visible"]')
    ).not.toBeNull()
    expect(document.querySelector('[data-invalid="true"]')).not.toBeNull()
    expect(document.querySelector('[data-readonly="true"]')).not.toBeNull()
    expect(document.querySelector('[data-disabled="true"]')).not.toBeNull()
    expect(screen.getByText('Enter a valid wallet address.')).toBeVisible()
  })

  it('shows Textarea multiline, invalid, read-only, and unavailable states', () => {
    renderFieldSpecimen('textarea')

    expect(screen.getByText('Multiline')).toBeVisible()
    expect(screen.getByText('Invalid')).toBeVisible()
    expect(screen.getByText('Read-only')).toBeVisible()
    expect(screen.getByText('Unavailable')).toBeVisible()
    expect(screen.getAllByTestId('canonical-textarea')).toHaveLength(4)
    expect(
      screen.getByText('Describe the intended risk controls.')
    ).toBeVisible()
  })

  it('shows Select default, selected, disabled, compact, and identity states directly', () => {
    renderFieldSpecimen('select')

    expect(screen.getByText('Placeholder')).toBeVisible()
    expect(screen.getByText('Selected')).toBeVisible()
    expect(screen.getByText('Unavailable')).toBeVisible()
    expect(screen.getByText('Compact utility')).toBeVisible()
    expect(screen.getByText('Leading identity')).toBeVisible()
    expect(document.querySelectorAll('[data-size="default"]')).toHaveLength(4)
    expect(document.querySelectorAll('[data-size="compact"]')).toHaveLength(1)
    expect(
      screen.getByRole('combobox', { name: 'Unavailable range' })
    ).toBeDisabled()
  })

  it('shows Multi-select empty, applied, and required-selection behavior', () => {
    renderFieldSpecimen('multi-select-filter')

    expect(screen.getByText('Applied selection')).toBeVisible()
    expect(screen.getByText('No selection')).toBeVisible()
    expect(screen.getByText('Required selection')).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Filter chains' })
    ).toHaveTextContent('1 network')
    expect(
      screen.getByRole('button', { name: 'Filter statuses' })
    ).toHaveTextContent('All statuses')
    expect(
      screen.getByRole('button', { name: 'Filter required networks' })
    ).toHaveTextContent('Ethereum')
  })

  it('shows Search empty, clearable, focus, no-results, loading, and unavailable states', () => {
    renderFieldSpecimen('search')

    expect(screen.getByText('Empty')).toBeVisible()
    expect(screen.getByText('Clearable query')).toBeVisible()
    expect(screen.getByText('Focus visible')).toBeVisible()
    expect(screen.getByText('No matching tokens')).toBeVisible()
    expect(screen.getByText('Loading')).toBeVisible()
    expect(screen.getByText('Unavailable')).toBeVisible()
    expect(screen.getAllByTestId('canonical-text-input')).toHaveLength(6)
    expect(
      screen.getByRole('searchbox', { name: 'Search loading' })
    ).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeVisible()
  })
})

describe('Selection documentation specimens', () => {
  it('shows Checkbox enabled and disabled values', () => {
    render(<SelectionComponentSpecimen itemId="checkbox" />)

    expect(screen.getByText('Unselected')).toBeVisible()
    expect(screen.getByText('Selected')).toBeVisible()
    expect(screen.getByText('Focus visible')).toBeVisible()
    expect(screen.getByText('Unavailable off')).toBeVisible()
    expect(screen.getByText('Unavailable on')).toBeVisible()
    expect(screen.getAllByTestId('canonical-checkbox')).toHaveLength(5)
    expect(
      screen.getByRole('checkbox', { name: 'Unavailable selected filter' })
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'Unavailable selected filter' })
    ).toBeDisabled()
  })

  it('shows Radio Group intrinsic and full-width layouts', () => {
    render(<SelectionComponentSpecimen itemId="radio-group" />)

    expect(screen.getByText('Intrinsic width')).toBeVisible()
    expect(screen.getByText('Full width')).toBeVisible()
    const groups = screen.getAllByTestId('canonical-single-choice-group')
    expect(groups.map((group) => group.dataset.width)).toEqual([
      'content',
      'full',
    ])
    expect(within(groups[1]).getByRole('radio', { name: '25%' })).toBeDisabled()
  })

  it('shows Switch enabled and disabled values', () => {
    render(<SelectionComponentSpecimen itemId="switch" />)

    expect(screen.getByText('Off')).toBeVisible()
    expect(screen.getByText('On')).toBeVisible()
    expect(screen.getByText('Focus visible')).toBeVisible()
    expect(screen.getByText('Unavailable off')).toBeVisible()
    expect(screen.getByText('Unavailable on')).toBeVisible()
    expect(screen.getAllByRole('switch')).toHaveLength(5)
    expect(screen.getByRole('switch', { name: 'Unavailable on' })).toBeChecked()
    expect(
      screen.getByRole('switch', { name: 'Unavailable on' })
    ).toBeDisabled()
  })

  it('shows every Segmented Control presentation and size with an unavailable peer', () => {
    render(<SelectionComponentSpecimen itemId="segmented-control" />)

    const controls = Array.from(
      document.querySelectorAll('[data-presentation][data-size]')
    )
    expect(
      controls.map(
        (control) =>
          `${control.getAttribute('data-presentation')}:${control.getAttribute('data-size')}`
      )
    ).toEqual([
      'text-only:compact',
      'text-only:default',
      'contained:compact',
      'contained:default',
    ])
    for (const control of controls) {
      expect(
        within(control as HTMLElement).getByRole('radio', {
          name: 'Unavailable',
        })
      ).toBeDisabled()
    }
  })
})
