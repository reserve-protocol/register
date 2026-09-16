import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MetricExport } from '../metric-export'
import { RangeControl } from '../range-control'

describe('next-family disabled control reasons', () => {
  it('associates the unavailable range reason with the disabled option', () => {
    render(
      <RangeControl
        ranges={['24h', '7d']}
        disabledReasons={{ '24h': 'Unavailable in this daily capture' }}
        value="7d"
        onChange={vi.fn()}
      />
    )

    const unavailableRange = screen.getByRole('radio', { name: '24H' })
    expect(unavailableRange).toBeDisabled()
    expect(descriptionText(unavailableRange)).toBe(
      'Unavailable in this daily capture'
    )
    expect(unavailableRange).toHaveAccessibleDescription(
      'Unavailable in this daily capture'
    )
  })

  it('supports a source-specific disabled reason for weekly Portfolio data', () => {
    render(
      <RangeControl
        ranges={['24h', '7d']}
        disabledReasons={{ '24h': 'Unavailable in this weekly capture' }}
        value="7d"
        onChange={vi.fn()}
      />
    )

    const unavailableRange = screen.getByRole('radio', { name: '24H' })
    expect(unavailableRange).toBeDisabled()
    expect(unavailableRange).toHaveAccessibleDescription(
      'Unavailable in this weekly capture'
    )
  })

  it('associates the export reason with the disabled action', () => {
    render(
      <MetricExport
        csv={undefined}
        csvUnavailableReason="Unavailable for simulated APY input"
      />
    )

    const exportAction = screen.getByRole('button', { name: 'Download CSV' })
    expect(exportAction).toBeDisabled()
    expect(descriptionText(exportAction)).toBe(
      'Unavailable for simulated APY input'
    )
    expect(exportAction).toHaveAccessibleDescription(
      'Unavailable for simulated APY input'
    )
  })
})

function descriptionText(control: HTMLElement) {
  const descriptionId = control.getAttribute('aria-describedby')
  return descriptionId
    ? document.getElementById(descriptionId)?.textContent
    : null
}
