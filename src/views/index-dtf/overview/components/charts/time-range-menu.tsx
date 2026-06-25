import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Trans } from '@lingui/react/macro'
import { ChevronDown } from 'lucide-react'
import { type Range } from './price-chart-constants'
import { useAvailableTimeRanges } from './use-available-time-ranges'

const TimeRangeMenu = ({ className }: { className?: string }) => {
  const { range, setRange, availableRanges } = useAvailableTimeRanges()

  if (!availableRanges) {
    return <Skeleton className={cn('h-7 w-16 rounded-full', className)} />
  }

  const current = availableRanges.find((tr) => tr.value === range)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex items-center gap-2 px-2 h-8 py-1 text-sm rounded-full bg-white/5 hover:bg-white/10 text-white/90 hover:text-white border border-white/10 data-[state=open]:bg-white/10 data-[state=open]:text-white focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ring-0',
            className
          )}
        >
          <span className="font-light">
            {current?.value === 'all' ? <Trans>All</Trans> : (current?.label ?? '')}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[7rem] bg-neutral-900 text-white border-white/10"
      >
        <DropdownMenuRadioGroup
          value={range}
          onValueChange={(value) => setRange(value as Range)}
        >
          {availableRanges.map((tr) => (
            <DropdownMenuRadioItem
              key={tr.value}
              value={tr.value}
              className="text-white/90 focus:bg-white/10 focus:text-white"
            >
              {tr.value === 'all' ? <Trans>All</Trans> : tr.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TimeRangeMenu
