import { SlippageSelector } from '@/components/ui/swap'
import { useAtom } from 'jotai'
import { slippageAtom } from './atom'

const ZapSettings = () => {
  const [slippage, setSlippage] = useAtom(slippageAtom)
  return (
    <div className="min-h-[200px] border-t border-border -mx-2 px-2 py-4">
      <SlippageSelector
        value={slippage}
        onChange={setSlippage}
        options={['200', '1000', '10000']}
      />
    </div>
  )
}

export default ZapSettings
