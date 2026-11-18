import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

export const pillClassName =
  'flex h-11 min-w-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10'

export const menuClassName =
  'rounded-2xl border border-border bg-card p-1.5 text-foreground shadow-lg'

export const PillLabel =({ children }: { children: ReactNode }) => (
  <span className="shrink-0 text-legend">{children}</span>
)

export const PillValue = ({
  children,
  highlighted,
}: {
  children: ReactNode
  highlighted?: boolean
}) => (
  <span
    className={cn(
      'ml-auto truncate font-semibold sm:ml-0',
      highlighted && 'text-primary'
    )}
  >
    {children}
  </span>
)

export const PillChevron = () => (
  <ChevronDown size={16} className="shrink-0 text-legend" aria-hidden />
)

type Option<T extends string> = { value: T; label: string }

export const SelectPill = <T extends string>({
  label,
  value,
  options,
  onChange,
  highlighted,
  className,
  testId,
}: {
  label: ReactNode
  value: T
  options: readonly Option<T>[]
  onChange: (value: T) => void
  highlighted?: boolean
  className?: string
  testId?: string
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className={cn(pillClassName, className)}
        data-testid={testId}
        data-value={value}
      >
        <PillLabel>{label}</PillLabel>
        <PillValue highlighted={highlighted}>
          {options.find((option) => option.value === value)?.label}
        </PillValue>
        <PillChevron />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className={cn(menuClassName, 'min-w-44')}>
      <DropdownMenuRadioGroup
        value={value}
        onValueChange={(next) => onChange(next as T)}
      >
        {options.map((option) => (
          <DropdownMenuRadioItem
            key={option.value}
            value={option.value}
            data-testid={testId && `${testId}-option-${option.value}`}
            className="cursor-pointer rounded-xl py-2 focus:bg-muted focus:text-foreground data-[state=checked]:font-semibold data-[state=checked]:text-primary"
          >
            {option.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
)
