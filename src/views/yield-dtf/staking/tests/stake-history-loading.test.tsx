import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import StakeHistory from '../components/overview/stake-history'

const mocks = vi.hoisted(() => ({ query: vi.fn() }))

vi.mock('hooks/use-query', () => ({ default: mocks.query }))
vi.mock('hooks/useRToken', () => ({
  default: () => ({ address: '0x0000000000000000000000000000000000000001' }),
}))
vi.mock('hooks/useTimeFrom', () => ({ default: () => 0 }))

// AreaChart renders a spinner for undefined data and "No data" for [] — the
// component must preserve that tri-state (loading vs settled-empty).
describe('StakeHistory loading state', () => {
  it('does not show "No data" while the query is unsettled', () => {
    mocks.query.mockReturnValue({ data: undefined })

    const { container } = render(<StakeHistory />)

    expect(container.textContent).not.toContain('No data')
  })

  it('shows settled-empty once data lands without snapshots', () => {
    mocks.query.mockReturnValue({ data: { rtoken: {} } })

    const { container } = render(<StakeHistory />)

    expect(container.textContent).toContain('No data')
  })
})
