import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useLingui } from '@lingui/react/macro'
import { useAtom } from 'jotai'
import { ChevronDown } from 'lucide-react'
import { ChartType, chartTypeAtom } from './price-chart-atoms'

const ChartTypeSelector = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const [chartType, setChartType] = useAtom(chartTypeAtom)

  const options: {
    value: ChartType
    label: string
    display: string
  }[] = [
    {
      value: 'line',
      label: t`Line chart`,
      display: t`Line`,
    },
    {
      value: 'candlestick',
      label: t`Candlestick chart`,
      display: t`Candles`,
    },
  ]
  const current = options.find(({ value }) => value === chartType) ?? options[0]

  return (
    <div className={cn('flex w-fit items-center', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={current.label}
            className="flex items-center gap-1 text-sm font-normal text-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:hidden"
          >
            {current.display}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-28">
          {options.map(({ value, display }) => (
            <DropdownMenuItem
              key={value}
              className={cn(value === chartType && 'text-foreground')}
              onClick={() => setChartType(value)}
            >
              {display}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden items-center gap-4 sm:flex">
        {options.map(({ value, label, display }) => (
          <Button
            key={value}
            variant="ghost"
            aria-label={label}
            title={label}
            className={cn(
              'h-auto w-auto rounded-none bg-transparent p-0 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground',
              value === chartType && 'text-foreground hover:text-foreground'
            )}
            onClick={() => setChartType(value)}
          >
            {display}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default ChartTypeSelector
