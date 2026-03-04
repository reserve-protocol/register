import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import { ArrowDown, ArrowUp } from 'lucide-react'

const PerformanceCell = ({
  value,
}: {
  value: number | null | undefined
}) => {
  if (value == null || isNaN(value))
    return <span className="text-sm text-legend">—</span>
  const perf = value * 100
  const abs = Math.abs(perf)
  const isNear0 = abs < 0.01
  let text: string
  if (isNear0) {
    text = '0.00%'
  } else {
    text = `${perf > 0 ? '+' : ''}${formatCurrency(perf)}%`
  }
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 text-sm',
        isNear0 || perf === 0
          ? 'text-legend'
          : perf > 0
            ? 'text-success'
            : 'text-destructive'
      )}
    >
      {!isNear0 && perf > 0 && <ArrowUp size={14} />}
      {!isNear0 && perf < 0 && <ArrowDown size={14} />}
      {text}
    </div>
  )
}

export default PerformanceCell
