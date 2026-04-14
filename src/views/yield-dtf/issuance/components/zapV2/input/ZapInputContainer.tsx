import { cn } from '@/lib/utils'
import ZapInput from './ZapInput'
import ZapTokenSelector from '../token-selector/ZapTokenSelector'
import ZapInputMaxButton from './ZapInputMaxButton'
import ZapInputUSD from './ZapInputUSD'
import { useZap } from '../context/ZapContext'

const ZapInputContainer = () => {
  const { operation } = useZap()

  return (
    <div
      className={cn(
        'flex items-center relative overflow-hidden bg-muted rounded-3xl gap-2 p-3',
        'items-start'
      )}
    >
      <div className="flex flex-col overflow-hidden gap-2 items-start flex-grow">
        <span>You use:</span>
        <ZapInput />
        <ZapInputUSD />
      </div>

      <div
        className={cn(
          'absolute h-full top-0 right-0 flex flex-col items-end p-3',
          operation === 'mint' ? 'justify-between' : 'justify-end'
        )}
      >
        {operation === 'mint' && <ZapTokenSelector />}
        <ZapInputMaxButton />
      </div>
    </div>
  )
}

export default ZapInputContainer
