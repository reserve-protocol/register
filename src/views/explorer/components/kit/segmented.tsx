import { cn } from '@/lib/utils'

type Item<T extends string> = { value: T; label: string }

const Segmented = <T extends string>({
  label,
  items,
  value,
  onChange,
  className,
}: {
  label: string
  items: readonly Item<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}) => (
  <div
    role="group"
    aria-label={label}
    className={cn(
      'col-span-2 grid auto-cols-fr grid-flow-col rounded-full bg-muted p-[3px] sm:inline-grid',
      className
    )}
  >
    {items.map((item) => (
      <button
        key={item.value}
        type="button"
        aria-pressed={item.value === value}
        onClick={() => onChange(item.value)}
        className={cn(
          'h-11 rounded-full px-4 text-[15px] font-medium text-legend transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-[34px] sm:text-sm',
          item.value === value && 'bg-card font-semibold text-primary shadow-sm'
        )}
      >
        {item.label}
      </button>
    ))}
  </div>
)

export default Segmented
