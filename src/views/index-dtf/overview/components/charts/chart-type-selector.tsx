import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLingui } from '@lingui/react/macro'
import { useAtom } from 'jotai'
import { CandlestickChart, LineChart } from 'lucide-react'
import { ChartType, chartTypeAtom } from './price-chart-atoms'

const ChartTypeSelector = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const [chartType, setChartType] = useAtom(chartTypeAtom)

  const options: {
    value: ChartType
    label: string
    Icon: typeof LineChart
  }[] = [
    { value: 'line', label: t`Line chart`, Icon: LineChart },
    { value: 'candlestick', label: t`Candlestick chart`, Icon: CandlestickChart },
  ]

  return (
    <div
      className={cn('flex gap-1 bg-white/10 rounded-full p-1 w-fit', className)}
    >
      {options.map(({ value, label, Icon }) => (
        <Button
          key={value}
          variant="ghost"
          aria-label={label}
          title={label}
          className={cn(
            'h-6 w-6 p-0 text-white/80 rounded-full hover:bg-white hover:text-black',
            value === chartType && 'bg-white text-black hover:bg-white'
          )}
          onClick={() => setChartType(value)}
        >
          <Icon size={14} />
        </Button>
      ))}
    </div>
  )
}

export default ChartTypeSelector
