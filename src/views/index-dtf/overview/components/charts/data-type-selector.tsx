import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isYieldIndexDTFAtom } from '@/state/dtf/yield-index-atoms'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { useAtom, useAtomValue } from 'jotai'
import { DataType, dataTypeAtom } from './price-chart'
import { chartTabActiveClassName, chartTabClassName } from './chart-tab-styles'

const standardDataTypes = [
  { label: msg`Price`, value: 'price' },
  { label: msg`Market Cap`, value: 'marketCap' },
  { label: msg`Supply`, value: 'totalSupply' },
] as const

const yieldDataTypes = [
  { label: msg`Price`, value: 'price' },
  { label: msg`BTC`, value: 'priceBTC' },
  { label: msg`Yield`, value: 'yield' },
] as const

const DataTypeSelector = ({
  className,
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'minimal'
}) => {
  const { t } = useLingui()
  const [dataType, setDataType] = useAtom(dataTypeAtom)
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)

  const options = isYieldIndexDTF ? yieldDataTypes : standardDataTypes

  if (variant === 'minimal') {
    return (
      <div className={cn('flex gap-4', className)}>
        {options.map((dt) => (
          <button
            key={dt.value}
            className={cn(
              'text-sm font-normal text-muted-foreground hover:text-foreground',
              dt.value === dataType && 'text-foreground'
            )}
            onClick={() => setDataType(dt.value as DataType)}
          >
            {t(dt.label)}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex gap-4 sm:ml-0 sm:mr-auto', className)}>
      {options.map((dt) => (
        <Button
          key={dt.value}
          variant="ghost"
          className={cn(
            chartTabClassName,
            dt.value === dataType && chartTabActiveClassName
          )}
          onClick={() => setDataType(dt.value as DataType)}
        >
          {t(dt.label)}
        </Button>
      ))}
    </div>
  )
}

export default DataTypeSelector
