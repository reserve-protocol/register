import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ColorContrastReview from '../color-contrast-review'

describe('color contrast closure review', () => {
  it('records the accepted cross-theme baseline in canonical owners', () => {
    render(<ColorContrastReview />)

    expect(screen.getByTestId('color-contrast-review')).toBeInTheDocument()
    expect(screen.getByTestId('color-architecture-audit')).toBeInTheDocument()
    expect(screen.getByTestId('color-feedback-comparison')).toBeInTheDocument()
    expect(screen.getByTestId('color-action-comparison')).toBeInTheDocument()
    expect(
      screen.getByTestId('color-supporting-comparison')
    ).toBeInTheDocument()
    expect(screen.getByTestId('color-heavier-alternatives')).toBeInTheDocument()
    expect(screen.getAllByText('Current baseline').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('lifecycle-status-pill')).toHaveLength(8)
    expect(screen.getAllByTestId('canonical-button')).toHaveLength(2)
    expect(screen.getByText('Same semantic alias in both themes')).toBeVisible()
    expect(screen.getByText('Decision recorded')).toBeVisible()
  })
})
