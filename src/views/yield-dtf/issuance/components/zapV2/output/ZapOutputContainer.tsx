import { cn } from '@/lib/utils'
import { useZap } from '../context/ZapContext'
import ZapTokenSelector from '../token-selector/ZapTokenSelector'
import ZapOutput from './ZapOutput'
import ZapOutputBalance from './ZapOutputBalance'
import ZapOutputUSD from './ZapOutputUSD'

const ZapOutputContainer = () => {
  const { tokenOut, operation, loadingZap } = useZap()

  return (
    <div className="flex flex-col relative border border-border rounded-3xl overflow-hidden gap-2 items-start p-3">
      <span className="block">You receive:</span>
      <div className="flex items-center text-2xl font-bold overflow-hidden">
        <ZapOutput />
        {!loadingZap && (
          <span className="text-legend ml-2">{tokenOut.symbol}</span>
        )}
      </div>
      <div className="flex items-center">
        <ZapOutputUSD />
      </div>
      <div
        className={cn(
          'absolute h-full top-0 right-0 flex flex-col items-end p-3',
          operation === 'redeem'
            ? 'justify-between'
            : 'justify-start sm:justify-end'
        )}
      >
        {operation === 'redeem' && <ZapTokenSelector />}
        <ZapOutputBalance />
      </div>
    </div>
  )
}

export default ZapOutputContainer
