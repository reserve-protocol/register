import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isYieldIndexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { DataType, dataTypeAtom } from './price-chart'

const standardDataTypes = [
  { label: 'Price', value: 'price' },
  { label: 'Market Cap', value: 'marketCap' },
  { label: 'Supply', value: 'totalSupply' },
] as const

const yieldDataTypes = [
  { label: 'Price', value: 'price' },
  { label: 'Yield', value: 'yield' },
] as const

const DataTypeSelector = ({
  className,
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'minimal'
}) => {
  const [dataType, setDataType] = useAtom(dataTypeAtom)
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)

  const options = isYieldIndexDTF ? yieldDataTypes : standardDataTypes

  if (variant === 'minimal') {
    return (
      <div className={cn('flex gap-2', className)}>
        {options.map((dt) => (
          <button
            key={dt.value}
            className={`text-xs sm:text-sm ${dt.value === dataType ? 'text-white font-bold' : 'text-white/50'}`}
            onClick={() => setDataType(dt.value as DataType)}
          >
            {dt.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('gap-1', className)}>
      {options.map((dt) => (
        <Button
          key={dt.value}
          variant="ghost"
          className={`h-6 text-xs sm:text-sm px-2 sm:px-3 text-white/80  rounded-[60px]  ${dt.value === dataType ? 'bg-muted/20 text-white' : ''}`}
          onClick={() => setDataType(dt.value as DataType)}
        >
          {dt.label}
        </Button>
      ))}
    </div>
  )
}

export default DataTypeSelector
