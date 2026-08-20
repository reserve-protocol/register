import userEvent from '@testing-library/user-event'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ContainedFormRowReview from '../contained-form-row-review'

describe('repeated governance parameter composition', () => {
  it('presents presets and custom entry as mutually exclusive ways to set one value', async () => {
    const user = userEvent.setup()

    render(<ContainedFormRowReview includeOrdinaryFields={false} />)

    const oneDay = screen.getByRole('radio', { name: '1 day' })
    const customDelay = screen.getByRole('textbox', {
      name: 'Custom voting delay',
    })
    const delayChoices = screen.getByRole('radiogroup', {
      name: 'Voting Delay presets',
    })
    const customDelayChoice = within(delayChoices).getByRole('radio', {
      name: 'Custom',
    })

    expect(oneDay).toBeChecked()
    expect(customDelayChoice).not.toBeChecked()
    expect(customDelay).toHaveValue('')

    const customDelayLabel = customDelayChoice.closest('label')
    expect(customDelayLabel).not.toBeNull()
    Object.defineProperties(delayChoices, {
      clientWidth: { configurable: true, value: 310 },
      scrollWidth: { configurable: true, value: 442 },
    })
    vi.spyOn(delayChoices, 'getBoundingClientRect').mockReturnValue({
      bottom: 44,
      height: 44,
      left: 0,
      right: 310,
      top: 0,
      width: 310,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    vi.spyOn(customDelayLabel!, 'getBoundingClientRect').mockImplementation(
      () => ({
        bottom: 42,
        height: 40,
        left: 351 - delayChoices.scrollLeft,
        right: 442 - delayChoices.scrollLeft,
        top: 2,
        width: 91,
        x: 351 - delayChoices.scrollLeft,
        y: 2,
        toJSON: () => ({}),
      })
    )

    await user.type(customDelay, '1.25')

    expect(oneDay).not.toBeChecked()
    expect(customDelayChoice).toBeChecked()
    expect(customDelay).toHaveValue('1.25')
    expect(delayChoices.scrollLeft).toBeGreaterThan(0)

    await user.click(screen.getByRole('radio', { name: '2 days' }))

    expect(screen.getByRole('radio', { name: '2 days' })).toBeChecked()
    expect(customDelayChoice).not.toBeChecked()
    expect(customDelay).toHaveValue('')

    await user.click(customDelayChoice)

    expect(customDelayChoice).toBeChecked()
    expect(customDelay).toHaveFocus()
    expect(customDelay).toHaveValue('')
  })

  it('attaches an invalid custom state only while custom entry owns the value', async () => {
    const user = userEvent.setup()

    render(<ContainedFormRowReview includeOrdinaryFields={false} />)

    const customQuorum = screen.getByRole('textbox', {
      name: 'Custom voting quorum',
    })
    const quorumChoices = screen.getByRole('radiogroup', {
      name: 'Voting Quorum presets',
    })
    const customQuorumChoice = within(quorumChoices).getByRole('radio', {
      name: 'Custom',
    })

    expect(customQuorum).toHaveValue('120')
    expect(customQuorumChoice).toBeChecked()
    expect(customQuorum).toHaveAttribute('aria-invalid', 'true')
    expect(customQuorum).toHaveAccessibleErrorMessage(
      'Enter a value between 0 and 100.'
    )

    for (const option of ['10%', '15%', '20%', '25%']) {
      expect(screen.getByRole('radio', { name: option })).not.toBeChecked()
    }

    await user.click(screen.getByRole('radio', { name: '20%' }))

    expect(customQuorumChoice).not.toBeChecked()
    expect(customQuorum).toHaveValue('')
    expect(customQuorum).not.toHaveAttribute('aria-invalid')
    expect(
      screen.queryByText('Enter a value between 0 and 100.')
    ).not.toBeInTheDocument()
  })
})
