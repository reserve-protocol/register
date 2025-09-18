import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAtom } from 'jotai'
import { dataTypeAtom } from './price-chart'

const dataTypes = [
  { label: 'Price', value: 'price' },
  { label: 'Market Cap', value: 'marketCap' },
  { label: 'Supply', value: 'totalSupply' },
] as const

const DataTypeSelector = ({ className }: { className?: string }) => {
  const [dataType, setDataType] = useAtom(dataTypeAtom)

  return (
    <div className={cn('gap-1', className)}>
      {dataTypes.map((dt) => (
        <Button
          key={dt.value}
          variant="ghost"
          className={`h-6 text-xs sm:text-sm px-2 sm:px-3 text-white/80  rounded-[60px]  ${dt.value === dataType ? 'bg-muted/20 text-white' : ''}`}
          onClick={() => setDataType(dt.value)}
        >
          {dt.label}
        </Button>
      ))}
    </div>
  )
}
