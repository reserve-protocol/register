import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'

import { TransactionMetricValue } from '../transaction-metric-value'

describe('TransactionMetricValue', () => {
  it('uses financial-performance colors only for realized movement', () => {
    render(
      <>
        <TransactionMetricValue tone="realized-favorable">
          +1.4%
        </TransactionMetricValue>
        <TransactionMetricValue tone="realized-adverse">
          -1.4%
        </TransactionMetricValue>
      </>
    )

    expect(screen.getByText('+1.4%')).toHaveClass(
      ...PERFORMANCE_TEXT_CLASSES.positive.split(' ')
    )
    expect(screen.getByText('-1.4%')).toHaveClass(
      ...PERFORMANCE_TEXT_CLASSES.negative.split(' ')
    )
  })

  it('keeps routine values neutral and distinguishes risk from superseded data', () => {
    render(
      <>
        <TransactionMetricValue tone="neutral">0.24%</TransactionMetricValue>
        <TransactionMetricValue tone="caution">3.2%</TransactionMetricValue>
        <TransactionMetricValue tone="critical">5.8%</TransactionMetricValue>
        <TransactionMetricValue tone="superseded">0.30%</TransactionMetricValue>
      </>
    )

    expect(screen.getByText('0.24%')).toHaveClass('text-foreground')
    expect(screen.getByText('3.2%')).toHaveClass(
      'text-feedback-warning-foreground'
    )
    expect(screen.getByText('5.8%')).toHaveClass(
      'text-feedback-danger-foreground'
    )
    expect(screen.getByText('0.30%')).toHaveClass(
      'text-supporting-foreground',
      'line-through'
    )
  })
})
