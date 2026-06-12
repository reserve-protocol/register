import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useOndoLimits } from '@reserve-protocol/async-zap-sdk'
import { useAtomValue } from 'jotai'
import { Clock } from 'lucide-react'
import { Address, zeroAddress } from 'viem'

const formatResumeTime = (nextOpen: string | null | undefined) => {
  if (!nextOpen) return null
  const date = new Date(nextOpen)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatSymbolList = (symbols: string[]) =>
  symbols.length <= 1
    ? symbols.join('')
    : `${symbols.slice(0, -1).join(', ')} and ${symbols[symbols.length - 1]}`

// Ondo assets in the basket that can't be traded right now, with the time
// trading resumes. The session caps are static, so a closed/paused market
// still reports the regular-session cap — market.isOpen is the closed signal,
// capacityUsd === 0 covers per-asset pauses (e.g. earnings). Limits above zero
// don't pause anything: the SDK just splits the trade into several orders.
export const useOndoTradingPaused = () => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const { data } = useOndoLimits({
    chainId,
    folioAddress: (indexDTF?.id ?? zeroAddress) as Address,
    enabled: !!indexDTF,
  })

  if (!data || data.assets.length === 0) return null

  const marketClosed = data.market ? !data.market.isOpen : false
  const paused = marketClosed
    ? data.assets
    : data.assets.filter((asset) => asset.capacityUsd === 0)

  if (paused.length === 0) return null

  return {
    symbols: paused.map((asset) => asset.symbol),
    resumes: formatResumeTime(data.market?.nextOpen),
  }
}

const OndoLimitsBanner = ({ className }: { className?: string }) => {
  const paused = useOndoTradingPaused()

  if (!paused) return null

  return (
    <Alert
      variant="warning"
      className={cn('rounded-xl bg-warning/10 border-warning/20', className)}
    >
      <Clock className="h-4 w-4" />
      <AlertTitle>Trading paused</AlertTitle>
      <AlertDescription>
        {formatSymbolList(paused.symbols)}{' '}
        {paused.symbols.length === 1 ? 'is' : 'are'} outside trading hours, so
        minting and redeeming is unavailable right now.
        {paused.resumes && ` Trading resumes ${paused.resumes}.`}
      </AlertDescription>
    </Alert>
  )
}

export default OndoLimitsBanner
