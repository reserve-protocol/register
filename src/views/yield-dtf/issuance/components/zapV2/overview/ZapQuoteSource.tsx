import Enso from '@/components/icons/Enso'
import { Zap } from 'lucide-react'
import { useZap } from '../context/ZapContext'

const ZapQuoteSource = () => {
  const { selectedProvider, loadingZap } = useZap()

  if (loadingZap || !selectedProvider) return null

  const isEnso = selectedProvider === 'enso'

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <span>Quote source</span>
      <div className="flex items-center gap-1 font-medium text-foreground">
        {isEnso ? <Enso width={14} /> : <Zap size={14} />}
        <span>{isEnso ? 'Enso' : 'Zap'}</span>
      </div>
    </div>
  )
}

export default ZapQuoteSource
