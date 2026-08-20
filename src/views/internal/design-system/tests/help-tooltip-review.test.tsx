import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'

describe('explanatory help tooltip', () => {
  it('keeps the visible label outside the trigger and supports persistent click access', async () => {
    const user = userEvent.setup()

    render(
      <div>
        <span>Voting quorum</span>
        <HelpTooltip
          accessibleLabel="About voting quorum"
          content="The minimum percentage of votes required."
        />
      </div>
    )

    const trigger = screen.getByRole('button', {
      name: 'About voting quorum',
    })

    expect(screen.getByText('Voting quorum')).toBeVisible()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    await user.click(trigger)

    const tooltip = await screen.findByRole('tooltip')
    const tooltipSurface = tooltip.parentElement

    expect(tooltip).toHaveTextContent(
      'The minimum percentage of votes required.'
    )
    expect(tooltipSurface).not.toBeNull()
    expect(tooltipSurface).toHaveClass(
      'max-w-[min(340px,var(--radix-tooltip-content-available-width))]'
    )
    expect(tooltipSurface).not.toHaveClass('text-balance')
  })
})
