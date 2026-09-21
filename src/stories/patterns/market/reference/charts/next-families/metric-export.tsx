import { FileDown } from 'lucide-react'
import { useId } from 'react'
import { InlineAction } from '@/components/button'
import useExportCSV from '@/views/yield-dtf/overview/components/charts/useExportCSV'
import type { HistoricalMetric } from './types'

export function MetricExport({
  csv,
  csvUnavailableReason,
  disabledReason,
}: Pick<HistoricalMetric, 'csv' | 'csvUnavailableReason'> & {
  disabledReason?: string
}) {
  const reasonId = useId()
  const exportToCsv = useExportCSV({
    headers: csv?.headers ?? [],
    rows: csv?.rows ?? [],
    filename: csv?.filename,
  })
  const reason = disabledReason ?? csvUnavailableReason

  return (
    <>
      <InlineAction
        treatment="utility"
        onClick={exportToCsv}
        disabled={!csv || !!reason}
        aria-describedby={reason ? reasonId : undefined}
        aria-label="Download CSV"
        title={reason}
      >
        <FileDown aria-hidden="true" className="size-4" />
        <span aria-hidden="true">
          <span className="hidden [@container(min-width:22rem)]:inline">
            Download{' '}
          </span>
          CSV
        </span>
      </InlineAction>
      {reason ? (
        <span id={reasonId} className="sr-only">
          {reason}
        </span>
      ) : null}
    </>
  )
}
