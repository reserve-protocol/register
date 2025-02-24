import { indexDTFAtom } from '@/state/dtf/atoms'
import { ChainId } from '@/utils/chains'
import { useAtomValue } from 'jotai'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Help from '@/components/ui/help'
import { cn } from '@/lib/utils'

const WARNING_PER_DTF: Record<number, Record<string, boolean>> = {
  [ChainId.Mainnet]: {
    '0x4e3b170dcbe704b248df5f56d488114ace01b1c5': false,
  },
  [ChainId.Base]: {
    '0xebcda5b80f62dd4dd2a96357b42bb6facbf30267': true,
    '0xb8753941196692e322846cfee9c14c97ac81928a': true,
  },
}

const LowLiquidityWarning = ({ className }: { className?: string }) => {
  const indexDTF = useAtomValue(indexDTFAtom)

  if (!indexDTF) return null

  const isWarning =
    WARNING_PER_DTF[indexDTF.chainId]?.[indexDTF.id.toLowerCase()]

  if (!isWarning) return null

  return (
    <Alert
      variant="warning"
      className={cn('bg-warning/10 border-warning/20 rounded-xl', className)}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertDescription className="text-warning flex items-center gap-2">
          This DTF contains assets with relatively low DEX liquidity
          <Help content="During periods of high volatility it can take multiple attempts to find a route with good pricing." />
        </AlertDescription>
      </div>
    </Alert>
  )
}

export default LowLiquidityWarning
