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
    expect(screen.getAllByTestId('canonical-dialog-surface')).toHaveLength(2)
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
    expect(button).toHaveTextContent('Variant')
    expect(button).toHaveTextContent('Micro')
    expect(button).toHaveTextContent('Compact')
    expect(button).toHaveTextContent('Default')
    expect(button).toHaveTextContent('Primary')
    expect(button).toHaveTextContent('Secondary')
    expect(button).toHaveTextContent('Quiet')
    expect(button).toHaveTextContent('Destructive')
    expect(button.querySelectorAll('[data-tone="primary"]')).toHaveLength(5)
    expect(button.querySelectorAll('[data-tone="secondary"]')).toHaveLength(4)
    expect(button.querySelectorAll('[data-tone="quiet"]')).toHaveLength(3)
    expect(button.querySelectorAll('[data-tone="destructive"]')).toHaveLength(3)
    expect(button.querySelector('[data-size="micro"]')).not.toBeNull()
    expect(button.querySelector('[data-size="compact"]')).not.toBeNull()
    expect(button.querySelector('[data-size="default"]')).not.toBeNull()
    expect(button.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(button.querySelector('button:disabled')).not.toBeNull()

    const switchSection = document.getElementById('switch')!
    expect(switchSection).toHaveTextContent('Off')
    expect(switchSection).toHaveTextContent('On')
    expect(switchSection).toHaveTextContent('Unavailable')
  })

  it('keeps Icon button scoped to the accepted compact named-action role', () => {
    renderOverview()

    const iconButton = document.getElementById('icon-button')!
    const specimens = iconButton.querySelectorAll(
      '[data-testid="canonical-icon-button"]'
    )

    expect(specimens).toHaveLength(6)
    expect(
      Array.from(specimens).every(
        (specimen) => specimen.getAttribute('data-size') === 'compact'
      )
    ).toBe(true)
    expect(iconButton.querySelector('[data-size="micro"]')).toBeNull()
    expect(iconButton.querySelector('[data-size="default"]')).toBeNull()
  })

  it('shows every accepted Segmented control presentation and size', () => {
    renderOverview()

    const segmentedControl = document.getElementById('segmented-control')!
    const specimens = Array.from(
      segmentedControl.querySelectorAll('[data-presentation][data-size]')
    )

    expect(
      specimens.map(
        (specimen) =>
          `${specimen.getAttribute('data-presentation')}:${specimen.getAttribute('data-size')}`
      )
    ).toEqual([
      'text-only:compact',
      'text-only:default',
      'contained:compact',
      'contained:default',
    ])
  })

  it('keeps matrix dividers across every cell until the final row', () => {
    renderOverview()

    const rows = document.getElementById('button')!.querySelectorAll('tbody tr')
    const firstRowCells = rows[0].querySelectorAll('th, td')
    const finalRowCells = rows[rows.length - 1].querySelectorAll('th, td')

    expect(
      Array.from(firstRowCells).every((cell) =>
        cell.classList.contains('border-b')
      )
    ).toBe(true)
    expect(
      Array.from(finalRowCells).every(
        (cell) => !cell.classList.contains('border-b')
      )
    ).toBe(true)
  })

  it('shows the accepted Tabs sizes, layout settings, panels, and important states', () => {
    renderOverview()

    const tabs = document.getElementById('tabs')!

    expect(tabs.querySelector('[data-size="compact"]')).not.toBeNull()
    expect(tabs.querySelector('[data-size="default"]')).not.toBeNull()
    expect(tabs.querySelector('[data-width="intrinsic"]')).not.toBeNull()
    expect(tabs.querySelector('[data-width="full"]')).not.toBeNull()
    expect(
      tabs.querySelector('[role="tab"][aria-selected="true"]')
    ).not.toBeNull()
    expect(tabs.querySelector('[role="tab"]:disabled')).not.toBeNull()
    expect(tabs.querySelector('[role="tabpanel"]')).not.toBeNull()
  })

  it('makes Multi-select applied outcomes visibly distinct while preserving staged controls', () => {
    renderOverview()

    const multiSelect = document.getElementById('multi-select-filter')!

    expect(multiSelect).toHaveTextContent('Applied selection')
    expect(multiSelect).toHaveTextContent('No selection')
    expect(
      within(multiSelect).getByRole('button', { name: 'Filter chains' })
    ).toHaveTextContent('1 network')
    expect(
      within(multiSelect).getByRole('button', { name: 'Filter statuses' })
    ).toHaveTextContent('All statuses')
  })

  it('shows the exploring Eligibility composition without claiming the rejected generic Dialog', () => {
    renderOverview()

    const dialog = document.getElementById('dialog')!
    const surfaces = within(dialog).getAllByTestId('canonical-dialog-surface')

    expect(surfaces).toHaveLength(2)
    expect(dialog).toHaveTextContent('Eligibility dialog')
    expect(dialog).toHaveTextContent('Exploring')
    expect(dialog).toHaveTextContent('Collapsed jurisdictions')
    expect(dialog).toHaveTextContent('Expanded jurisdictions')
    expect(dialog).toHaveTextContent('Verify your eligibility')
    expect(dialog).not.toHaveTextContent('Proposal Simulation')
    expect(within(dialog).queryByRole('button', { name: 'Simulate' })).toBeNull()
  })

  it('uses the accepted Multi-select Filter owner for the Popover result', () => {
    renderOverview()

    const popover = document.getElementById('popover')!

    expect(
      within(popover).getByRole('button', { name: 'Filter networks' })
    ).toBeVisible()
    expect(popover).not.toHaveTextContent(
      'Filter controls belong to the composition.'
    )
  })

  it('uses provider-free identity owners for direct, badged, stacked, fallback, and pressure states', () => {
    renderOverview()

    const identity = document.getElementById('entity-identity')!

    expect(
      identity.querySelector('[data-documentation-provider-safe-mark]')
    ).not.toBeNull()
    expect(
      identity.querySelector('[data-testid="canonical-chain-logo-stack"]')
    ).not.toBeNull()
    expect(
      within(identity).getByRole('img', { name: 'Unlisted collateral' })
    ).toHaveAttribute('src', '/svgs/defaultLogo.svg')
    expect(
      within(identity).getByText(
        'CoinMarketCap 20 Diversified Digital Asset Index DTF'
      )
    ).toHaveClass('truncate')
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

  it('shows the ordinary Select system directly without a teaser canvas', () => {
    renderOverview()

    const section = document.getElementById('select')!
    const output = section.querySelector<HTMLElement>(
      '[data-testid="component-overview-output"]'
    )!

    expect(output).toHaveClass('border', 'bg-muted/20')
    expect(section.querySelector('[data-documentation-layer]')).toBeNull()
    expect(section).toHaveTextContent('Placeholder')
    expect(section).toHaveTextContent('Selected')
    expect(section).toHaveTextContent('Unavailable')
    expect(section).toHaveTextContent('Compact utility')
    expect(section).toHaveTextContent('Leading identity')
    expect(section.querySelector('[data-size="compact"]')).not.toBeNull()
    expect(section.querySelector('[data-size="default"]')).not.toBeNull()
    expect(section.querySelector('[data-disabled]')).not.toBeNull()
    expect(within(section).queryByText('Open this state')).toBeNull()
  })

  it('uses the same three-layer canvas without unnecessary controls for Metric', () => {
    renderOverview()

    const section = document.getElementById('metric')!
    const output = section.querySelector<HTMLElement>(
      '[data-testid="component-overview-output"]'
    )!
    const documentation = section.querySelector<HTMLElement>(
      '[data-documentation-layer]'
    )!
    const host = section.querySelector<HTMLElement>('[data-host-context]')!
    const specimen = section.querySelector<HTMLElement>(
      '[data-specimen-boundary]'
    )!

    expect(documentation).toContainElement(host)
    expect(output).not.toHaveClass('border', 'bg-muted/20', 'p-4')
    expect(specimen).toHaveAttribute('data-specimen-mode', 'fluid')
    expect(specimen).toHaveAttribute('data-specimen-padding', 'contained')
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

  it('places the primary result before detail navigation and omits repeated engineering facts', () => {
    renderOverview()

    for (const componentId of ['button', 'icon-button', 'button-group']) {
      const section = document.getElementById(componentId)!
      const result = section.querySelector(
        '[data-testid="component-overview-output"]'
      )
      const details = within(section).getByRole('link', {
        name: 'Open details',
      })

      expect(result).not.toBeNull()
      expect(within(section).queryByText('Code')).toBeNull()
      expect(within(section).queryByText('Production')).toBeNull()
      expect(
        result!.compareDocumentPosition(details) &
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
      'transaction-action': '/internal/design-system/patterns#transactions',
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
