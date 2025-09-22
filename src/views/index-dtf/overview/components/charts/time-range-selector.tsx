import { Button } from '@/components/ui/button'
import { useAtom } from 'jotai'
import { timeRangeAtom } from './price-chart'

const TIME_RANGES = [
  { label: '24H', value: '24h' },
  { label: '3D', value: '3d' },
  { label: '7D', value: '7d' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '1Y', value: '1y' },
] as const

const TimeRangeSelector = () => {
  const [range, setRange] = useAtom(timeRangeAtom)

  return (
    <div className="gap-1 ml-auto sm:ml-0 sm:mr-auto bg-white/10 rounded-full p-1">
      {TIME_RANGES.map((tr) => (
        <Button
          key={tr.value}
          variant="ghost"
          className={`h-7 px-2 mr-1 sm:px-2 text-xs sm:text-sm text-white/80 rounded-[60px] hover:bg-white hover:text-black ${tr.value === range ? 'bg-white text-black' : ''}`}
          onClick={() => setRange(tr.value)}
        >
          {tr.label}
        </Button>
      ))}
    </div>
  )
}

export default TimeRangeSelector
