import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import type { SyntheticEvent } from 'react'

const METRIC_HELP = {
  accuracy: {
    label: 'Rebalance accuracy',
    content:
      'A measure of how closely the new basket rebalanced compared to the proposed basket',
  },
  navChange: {
    label: 'NAV Change',
    content:
      'How much the value of the DTF basket changed due to the latest rebalance',
  },
} as const

export function HistoryMetricLabel({
  field,
}: {
  field: keyof typeof METRIC_HELP
}) {
  const { label, content } = METRIC_HELP[field]
  const lastWord = label.lastIndexOf(' ')
  return (
    <span>
      {label.slice(0, lastWord)}{' '}
      <span className="whitespace-nowrap">
        {label.slice(lastWord + 1)}{' '}
        <span
          data-testid={`history-help-${field}`}
          data-table-focus={`history-help-${field}`}
          className="inline-flex items-center align-middle"
          onPointerDownCapture={preserveHelpToggle}
          onClickCapture={preserveHelpToggle}
          onClick={(event) => event.stopPropagation()}
        >
          <HelpTooltip accessibleLabel={label} content={content} />
        </span>
      </span>
    </span>
  )
}

function preserveHelpToggle(event: SyntheticEvent) {
  // Radix's trigger defaults otherwise close the explicit tap toggle immediately.
  if ((event.target as Element).closest('button')) event.preventDefault()
}
