import { Button } from '@/components/ui/button'
import { useAtom } from 'jotai'
import { factsheetChartTypeAtom } from '../atoms'

const ChartTypeSelector = () => {
  const [chartType, setChartType] = useAtom(factsheetChartTypeAtom)

  return (
    <div className="flex gap-1 bg-white/10 rounded-full p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setChartType('navGrowth')}
        className={`h-6 sm:h-7 px-3 text-xs sm:text-sm rounded-full ${
          chartType === 'navGrowth'
            ? 'bg-white text-black hover:bg-white hover:text-black'
            : 'text-white/70 hover:bg-white/20 hover:text-white'
        }`}
      >
        NAV Growth
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setChartType('monthlyPL')}
        className={`h-6 sm:h-7 px-3 text-xs sm:text-sm rounded-full ${
          chartType === 'monthlyPL'
            ? 'bg-white text-black hover:bg-white hover:text-black'
            : 'text-white/70 hover:bg-white/20 hover:text-white'
        }`}
      >
        Monthly P&L
      </Button>
    </div>
  )
}

export default ChartTypeSelector
