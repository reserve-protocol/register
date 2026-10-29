import { cn } from '@/lib/utils'
import { RANGES } from '../mock/ugly-cash-series'
import { Activity, Metric } from './use-activity'

const Segmented = <T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label: string
}) => (
  <div
    role="group"
    aria-label={label}
    className="flex items-center gap-1 rounded-full bg-muted p-1"
  >
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        aria-pressed={o.value === value}
        onClick={() => onChange(o.value)}
        className={cn(
          'h-8 rounded-full px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          o.value === value
            ? 'bg-card font-medium text-primary shadow-sm'
            : 'text-legend hover:text-foreground'
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
)

export const MetricToggle = ({ activity }: { activity: Activity }) => (
  <Segmented<Metric>
    label="Metric"
    value={activity.metric}
    onChange={activity.setMetric}
    options={[
      { value: 'volume', label: 'Volume' },
      { value: 'count', label: 'Transactions' },
    ]}
  />
)

export const RangeTabs = ({ activity }: { activity: Activity }) => (
  <Segmented
    label="Time range"
    value={activity.range}
    onChange={activity.setRange}
    options={RANGES.map((r) => ({ value: r, label: r }))}
  />
)
