import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'

const SearchField = ({
  label,
  placeholder,
  value,
  onChange,
  className,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  className?: string
}) => (
  <label
    className={cn(
      'col-span-2 flex h-11 items-center gap-2 rounded-full border border-border bg-card px-3.5 focus-within:ring-2 focus-within:ring-ring sm:h-10 sm:w-72',
      className
    )}
  >
    <Search size={16} className="shrink-0 text-legend" aria-hidden />
    <span className="sr-only">{label}</span>
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-legend sm:text-sm"
    />
  </label>
)

export default SearchField
