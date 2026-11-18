import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PillChevron, menuClassName, pillClassName } from './kit/filter-pill'

export interface SelectOption {
  label: string
  value: string
  icon: React.ReactNode | null
  suffix?: React.ReactNode
}

export interface IMultiselectDropdrown {
  options: SelectOption[]
  selected: string[]
  // An empty selection means "all"; the list gets an All row.
  allOption?: boolean
  minLimit?: number
  onChange: (selected: string[]) => void
  className?: string
  children?: React.ReactNode
}

const SEARCH_FROM = 12

const OptionRow = ({
  checked,
  disabled,
  onToggle,
  icon,
  suffix,
  children,
  testId,
}: {
  checked: boolean
  disabled?: boolean
  onToggle: () => void
  icon?: React.ReactNode
  suffix?: React.ReactNode
  children: React.ReactNode
  testId?: string
}) => (
  <label
    className={cn(
      'flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors hover:bg-muted',
      checked && 'font-medium',
      disabled && 'cursor-default'
    )}
    data-testid={testId}
  >
    <Checkbox
      checked={checked}
      disabled={disabled}
      onCheckedChange={onToggle}
      className="rounded-[5px] border-border data-[state=checked]:border-primary"
    />
    {icon}
    <span className="min-w-0 truncate">{children}</span>
    {suffix && <span className="ml-auto shrink-0">{suffix}</span>}
  </label>
)

const MultiselectDropdrown = ({
  children,
  options,
  selected,
  allOption = false,
  minLimit = 0,
  onChange,
  className,
}: IMultiselectDropdrown) => {
  const { t } = useLingui()
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()
  const visible = useMemo(
    () =>
      query
        ? options.filter((option) => option.label.toLowerCase().includes(query))
        : options,
    [options, query]
  )

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    if (next.length >= minLimit) onChange(next)
  }

  return (
    <Popover onOpenChange={(open) => !open && setSearch('')}>
      <PopoverTrigger asChild>
        <button type="button" className={cn(pillClassName, className)}>
          {children}
          <PillChevron />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn(menuClassName, 'w-64 p-0')}
        data-testid="explorer-filter-menu"
      >
        {options.length >= SEARCH_FROM && (
          <label className="flex items-center gap-2 border-b border-border px-3.5 py-2.5">
            <Search size={15} className="shrink-0 text-legend" aria-hidden />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t`Search`}
              aria-label={t`Search options`}
              className="w-full bg-transparent text-sm outline-none placeholder:text-legend"
            />
          </label>
        )}
        <div className="max-h-72 overflow-y-auto p-1.5">
          {allOption && !query && (
            <OptionRow
              checked={!selected.length}
              disabled={!selected.length}
              onToggle={() => onChange([])}
              testId="explorer-filter-all"
            >
              <Trans>All</Trans>
            </OptionRow>
          )}
          {visible.map((option) => {
            const checked = selected.includes(option.value)
            return (
              <OptionRow
                key={option.value}
                checked={checked}
                disabled={checked && selected.length <= minLimit}
                onToggle={() => toggle(option.value)}
                icon={option.icon}
                suffix={option.suffix}
                testId={`explorer-filter-option-${option.value}`}
              >
                {option.label}
              </OptionRow>
            )
          })}
          {!visible.length && (
            <p className="px-3 py-6 text-center text-sm text-legend">
              <Trans>No matches</Trans>
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default MultiselectDropdrown
