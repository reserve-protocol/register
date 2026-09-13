import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it } from 'vitest'
import { AuctionsBrowseReview } from '../review'

it('offers the current rebalance in the same view as the retained history table', () => {
  render(
    <MemoryRouter
      initialEntries={[
        '/internal/design-system/components/table#auctions-browse-review',
      ]}
    >
      <AuctionsBrowseReview />
    </MemoryRouter>
  )
  const current = screen.getByTestId('current-rebalance-workspace')
  expect(within(current).getByText('August 2026 Rebalance')).toBeInTheDocument()
  expect(within(current).getByTestId('current-launch')).toBeEnabled()
  expect(
    screen.getByRole('table', { name: 'Historical Rebalances' })
  ).toBeInTheDocument()
})
