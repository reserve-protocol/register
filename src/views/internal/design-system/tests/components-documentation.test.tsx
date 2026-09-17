import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import CanonicalComponentsOverview from '../canonical-components-overview'
import { COMPONENT_GROUPS, COMPONENT_ITEMS } from '../component-catalog'
import { canMountDocumentationComponentSpecimen } from '../documentation-component-specimens'

afterEach(cleanup)

const renderOverview = () =>
  render(
    <MemoryRouter initialEntries={['/internal/design-system/components']}>
      <CanonicalComponentsOverview />
    </MemoryRouter>
  )

const renderOverviewAt = (entry: string) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <CanonicalComponentsOverview />
    </MemoryRouter>
  )

describe('component documentation overview', () => {
  it('mounts a hard-coded specimen only while catalog authority remains accepted', () => {
    expect(canMountDocumentationComponentSpecimen('button', 'accepted')).toBe(
      true
    )
    expect(
      canMountDocumentationComponentSpecimen('copy-value', 'accepted')
    ).toBe(true)
    expect(canMountDocumentationComponentSpecimen('button', 'exploring')).toBe(
      false
    )
    expect(
      canMountDocumentationComponentSpecimen('unknown-component', 'accepted')
    ).toBe(false)
  })

  it('renders every catalog identity as one continuous anchored reference', () => {
    renderOverview()

    expect(screen.getAllByTestId('component-reference-section')).toHaveLength(
      COMPONENT_ITEMS.length
    )
    expect(screen.getAllByTestId('component-group-section')).toHaveLength(
      COMPONENT_GROUPS.length
    )
    expect(
      screen
        .getAllByTestId('component-reference-section')
        .map((section) => section.id)
    ).toEqual(COMPONENT_ITEMS.map(({ id }) => id))

    for (const group of COMPONENT_GROUPS) {
      expect(document.getElementById(group.id)).toBeVisible()
      expect(screen.getByRole('link', { name: group.name })).toHaveAttribute(
        'href',
        `#${group.id}`
      )
    }
  })

  it('projects canonical owners and non-canonical treatments truthfully', () => {
    renderOverview()

    expect(screen.getAllByTestId('component-overview-output')).toHaveLength(29)
    expect(screen.queryByTestId('component-isolation-slot')).toBeNull()
    expect(screen.getAllByTestId('component-pattern-slot')).toHaveLength(4)
    expect(screen.getByTestId('component-card-reference')).toBeVisible()
    expect(screen.getAllByTestId('component-exploring-treatment')).toHaveLength(
      6
    )
    expect(screen.getAllByTestId('component-undefined-treatment')).toHaveLength(
      5
    )
    expect(screen.getAllByTestId('canonical-button')[0]).toBeVisible()
    expect(screen.getAllByTestId('canonical-text-input')[0]).toBeVisible()
    expect(screen.getAllByTestId('canonical-checkbox')[0]).toBeVisible()
    expect(screen.getByTestId('canonical-dialog-surface')).toBeVisible()
    expect(screen.getAllByTestId('canonical-inline-message')[0]).toBeVisible()
    expect(screen.getAllByTestId('canonical-metric')[0]).toBeVisible()
    const copyableValue = document.getElementById('copy-value')!
    expect(
      copyableValue.querySelector('[data-copyable-value-treatment="default"]')
    ).not.toBeNull()
    expect(
      copyableValue.querySelector('[data-copyable-value-treatment="inline"]')
    ).not.toBeNull()
    expect(document.getElementById('global-navigation')).toHaveTextContent(
      'documented as a pattern'
    )
    expect(document.getElementById('product-navigation')).toHaveTextContent(
      'documented as a pattern'
    )
    expect(
      screen.queryByText(/pulls product or wallet dependencies/i)
    ).toBeNull()
    expect(
      screen.getByRole('button', { name: 'What is staking?' })
    ).toBeVisible()
  })

  it('shows accepted essentials and human scope without button-like status chrome', () => {
    renderOverview()

    for (const item of COMPONENT_ITEMS) {
      const section = document.getElementById(item.id)!
      expect(section).toHaveTextContent(item.description)
      expect(
        section.querySelector('[data-documentation-status]')
      ).not.toBeNull()
    }

    for (const output of screen.getAllByTestId('component-overview-output')) {
      expect(
        output.querySelector('[data-testid="component-specimen-set"]')
      ).not.toBeNull()
    }

    const button = document.getElementById('button')!
    expect(button.querySelectorAll('[data-tone]')).toHaveLength(8)
    expect(button.querySelector('[data-size="micro"]')).not.toBeNull()
    expect(button.querySelector('[data-size="compact"]')).not.toBeNull()
    expect(button.querySelector('[data-size="default"]')).not.toBeNull()
    expect(button.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(button.querySelector('button:disabled')).not.toBeNull()
  })

  it('distinguishes deliberately not-planned work from work that has not started', () => {
    renderOverview()

    expect(document.getElementById('combobox')).toHaveTextContent(
      'No generic component is planned for the current system'
    )
    expect(document.getElementById('toast')).toHaveTextContent(
      'A canonical result has not been prepared yet'
    )
  })

  it('pilots query-backed canvas controls on Select without putting controls inside the specimen', () => {
    renderOverviewAt(
      '/internal/design-system/components?select.family=compact&select.state=disabled#select'
    )

    const section = document.getElementById('select')!
    const documentation = section.querySelector<HTMLElement>(
      '[data-documentation-layer]'
    )!
    const controls = section.querySelector<HTMLElement>(
      '[data-specimen-control-bar]'
    )!
    const host = section.querySelector<HTMLElement>('[data-host-context]')!
    const specimen = section.querySelector<HTMLElement>(
      '[data-specimen-boundary]'
    )!
    const trigger = specimen.querySelector<HTMLElement>('[data-size="compact"]')

    expect(documentation).toContainElement(controls)
    expect(documentation).toContainElement(host)
    expect(host).toContainElement(specimen)
    expect(host).not.toContainElement(controls)
    expect(specimen).not.toContainElement(controls)
    expect(
      section.querySelectorAll('[data-specimen-control-slot]')
    ).toHaveLength(4)
    expect(trigger).toBeDisabled()
  })

  it('uses the same three-layer canvas without unnecessary controls for Metric', () => {
    renderOverview()

    const section = document.getElementById('metric')!
    const documentation = section.querySelector<HTMLElement>(
      '[data-documentation-layer]'
    )!
    const host = section.querySelector<HTMLElement>('[data-host-context]')!
    const specimen = section.querySelector<HTMLElement>(
      '[data-specimen-boundary]'
    )!

    expect(documentation).toContainElement(host)
    expect(host).toContainElement(specimen)
    expect(section.querySelector('[data-specimen-control-bar]')).toBeNull()
    expect(
      specimen.querySelectorAll('[data-testid="canonical-metric"]')
    ).toHaveLength(2)
  })

  it('does not mount heavy review machinery in the overview', () => {
    renderOverview()

    expect(screen.queryByTestId('button-state-sheet')).toBeNull()
    expect(screen.queryByTestId('chart-next-families-review')).toBeNull()
    expect(screen.queryByTestId('table-family-review')).toBeNull()
    expect(screen.queryByTestId('transaction-truth-spectrum')).toBeNull()
  })

  it('places the primary result before engineering facts and detail navigation', () => {
    renderOverview()

    for (const componentId of ['button', 'icon-button', 'button-group']) {
      const section = document.getElementById(componentId)!
      const result = section.querySelector(
        '[data-testid="component-overview-output"]'
      )
      const code = screen
        .getAllByText('Code')
        .find((node) => section.contains(node))
      const details = screen
        .getAllByRole('link', { name: 'Open details' })
        .find((node) => section.contains(node))

      expect(result).not.toBeNull()
      expect(code).toBeDefined()
      expect(details).toBeDefined()
      expect(
        result!.compareDocumentPosition(code!) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
      expect(
        result!.compareDocumentPosition(details!) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
    }
  })

  it('routes complex families directly to their canonical documentation surface', () => {
    renderOverview()

    const destinations = {
      chart: '/internal/design-system/patterns#charts',
      table: '/internal/design-system/patterns#tables',
      'global-navigation': '/internal/design-system/patterns#navigation-global',
      'product-navigation':
        '/internal/design-system/patterns#navigation-product',
      'transaction-action':
        '/internal/design-system/workbench#transaction-workbench',
    }

    for (const [componentId, destination] of Object.entries(destinations)) {
      expect(
        within(document.getElementById(componentId)!).getByRole('link', {
          name: 'Open details',
        })
      ).toHaveAttribute('href', destination)
    }
  })
})
