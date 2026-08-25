import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TypographyStudy from '../typography-study'

describe('typography foundation review', () => {
  it('presents a complete decision boundary and source-grounded contexts', () => {
    render(<TypographyStudy />)

    expect(screen.getByTestId('typography-review-boundary')).toHaveTextContent(
      'Production migration'
    )

    const roleMap = screen.getByRole('region', { name: 'Current role map' })
    for (const role of [
      'Display',
      'Page title',
      'Section title',
      'Lead',
      'Panel title',
      'Item title',
      'Body and ordinary value',
      'Label and action',
      'Supporting',
      'Auxiliary · limited use',
    ]) {
      expect(within(roleMap).getByText(role)).toBeInTheDocument()
    }

    expect(screen.getByRole('region', { name: 'Page hierarchy' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Form hierarchy' })).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Dense data hierarchy' })
    ).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Reading hierarchy' })
    ).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Typography stress tests' })
    ).toBeVisible()
  })

  it('keeps the ordinary 14px roles on the accepted 20px line height', () => {
    render(<TypographyStudy />)

    expect(screen.getByTestId('typography-role-label')).toHaveClass(
      'text-sm',
      'font-medium',
      'leading-5'
    )
    expect(screen.getByTestId('typography-role-supporting')).toHaveClass(
      'text-sm',
      'font-light',
      'leading-5'
    )
  })

  it('renders the accepted refinements as one visually inspectable group', () => {
    render(<TypographyStudy />)

    const refinements = screen.getByTestId('typography-recommended-refinements')
    expect(refinements).toHaveTextContent('Display on narrow phones')
    expect(refinements).toHaveTextContent('Choosing between similar roles')
    expect(refinements).toHaveTextContent('Financial and machine values')
    expect(refinements).toHaveTextContent('Reading and wrapping')
    expect(refinements).toHaveTextContent('Extended reading comparison')

    expect(screen.getByTestId('typography-responsive-display')).toHaveClass(
      'text-[40px]',
      'leading-[46px]',
      'sm:text-5xl',
      'sm:leading-[54px]'
    )

    const financialValue = within(refinements).getByTestId(
      'typography-financial-value'
    )
    expect(financialValue).toHaveClass('tabular-nums')
    expect(financialValue).not.toHaveClass('font-mono')
    expect(
      within(refinements).getByTestId('typography-negative-value')
    ).toHaveTextContent('−4.18%')
    expect(
      within(refinements).getByTestId('typography-machine-value')
    ).toHaveClass('font-mono')

    expect(
      within(refinements).getByTestId('typography-readable-supporting')
    ).toHaveClass('text-sm', 'font-light', 'leading-5', 'text-muted-foreground')
    expect(
      within(refinements).getByTestId('typography-reading-measure')
    ).toHaveClass('max-w-[65ch]')
    expect(
      within(refinements).getByTestId('typography-wrapping-title')
    ).not.toHaveClass('truncate')

    const longOrdinary = within(refinements).getByTestId(
      'typography-long-ordinary-content'
    )
    const longSupporting = within(refinements).getByTestId(
      'typography-long-supporting-content'
    )
    expect(longOrdinary).toHaveClass(
      'text-base',
      'font-light',
      'leading-6',
      'max-w-[65ch]'
    )
    expect(longSupporting).toHaveClass(
      'text-sm',
      'font-light',
      'leading-5',
      'text-muted-foreground',
      'max-w-[65ch]'
    )
    expect(longOrdinary.querySelectorAll('p')).toHaveLength(3)
    expect(longSupporting.querySelectorAll('p')).toHaveLength(3)
  })
})
