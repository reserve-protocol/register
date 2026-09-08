import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ComponentCompositionSource, ComponentReviewBadge } from '../catalog-ui'
import { COMPONENT_ITEMS, getComponentItem } from '../component-catalog'
import { PRODUCT_FACING_REVIEWS } from '../product-facing-component-audit'
import { PROGRESS_GROUPS } from '../progress-data'
import ProgressDashboard from '../progress-dashboard'

describe('inventory reconciliation', () => {
  it('distinguishes unprepared review work from a blocking dependency', () => {
    for (const id of ['data-table', 'chart', 'toast', 'slider', 'progress']) {
      expect(getComponentItem(id).item?.review.status).toBe('not-started')
    }
    for (const item of COMPONENT_ITEMS) {
      if (item.review.status === 'blocked') {
        expect(
          item.review.dependencies.some(({ status }) => status === 'blocked')
        ).toBe(true)
      }
    }
  })

  it('does not imply a pending approval from reviewable evidence', () => {
    render(
      <ComponentReviewBadge
        review={{ status: 'ready', scope: '', dependencies: [] }}
      />
    )
    expect(screen.getByText('Reviewable')).toBeInTheDocument()
    expect(
      screen.queryByText('Ready for canonical review')
    ).not.toBeInTheDocument()
  })

  it('routes existing compositions without promoting their ingredients', () => {
    for (const id of ['amount-field', 'asset-picker', 'stepper', 'popover']) {
      const item = getComponentItem(id).item!
      expect(item.outputStatus).toBe('in-composition')
      expect(item.implementationStatus).not.toBe('none')
      expect(item.compositionSource).toBeDefined()
      expect(
        getComponentItem(item.compositionSource!.componentId).item
      ).toBeDefined()
      expect(item.adoptionStatus).toBe('none')
      expect(item.designAuthority).toBe(
        id === 'popover' ? 'current-baseline' : 'exploratory'
      )
    }
  })

  it('links composition-only evidence to the actual reviewed host', () => {
    render(
      <MemoryRouter>
        <ComponentCompositionSource
          item={getComponentItem('amount-field').item!}
        />
      </MemoryRouter>
    )
    expect(
      screen.getByRole('link', { name: /Transaction amount input\/output/ })
    ).toHaveAttribute(
      'href',
      '/internal/design-system/components/transaction-action#transaction-composition-rfq'
    )
    expect(screen.getByText(/not a separate state sheet/)).toBeInTheDocument()
  })

  it('closes accepted baseline reviews but keeps remaining composition work open', () => {
    for (const id of [
      'metric-blocks',
      'global-navigation',
      'product-navigation',
      'empty-states',
    ]) {
      expect(
        PRODUCT_FACING_REVIEWS.find((review) => review.id === id)?.status
      ).toBe('complete')
    }
    expect(
      PRODUCT_FACING_REVIEWS.find(({ id }) => id === 'information-rows')?.status
    ).toBe('ready')
    expect(
      PRODUCT_FACING_REVIEWS.find(({ id }) => id === 'value-and-action-popups')
        ?.componentId
    ).toBe('asset-picker')
  })

  it('does not equate an empty schedule with blocked work or an untracked verification failure', () => {
    render(<ProgressDashboard />)
    expect(
      screen.getByText('No component work is currently scheduled.')
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/No component is ready to advance/)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('columnheader', { name: 'Verified' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/Verification is recorded in scoped checkpoint reports/)
    ).toBeInTheDocument()
    const amount = PROGRESS_GROUPS.find(
      ({ id }) => id === 'components'
    )!.items.find(({ id }) => id === 'amount-field')!
    expect(amount.gates).toContain('lab')
    expect(amount.gates).not.toContain('design-reviewed')
    expect(amount.gates).not.toContain('in-use')
  })

  it('keeps deferred and unnecessary capabilities out of implied blocker work', () => {
    expect(getComponentItem('breadcrumb').item?.review.status).toBe('deferred')
    expect(getComponentItem('combobox').item?.status).toBe('not-needed')
    expect(getComponentItem('combobox').item?.review.status).toBe('deferred')
    expect(getComponentItem('transaction-action').item?.adoptionStatus).toBe(
      'none'
    )
    expect(getComponentItem('drawer').item?.designAuthority).toBe('exploratory')
  })
})
