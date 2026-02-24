import { Button } from '@/components/ui/button'
import { Play, Square } from 'lucide-react'
import Spinner from '@/components/ui/spinner'
import { CowbotStatus } from './types'
import CowbotAnimation from './cowbot-animation'

interface CowbotCardProps {
  status: CowbotStatus
  totalOrders: number
  isAuctionActive: boolean
  onStart: () => void
  onStop: () => void
}

/**
 * Inline card component for CowBot status display.
 * Shows horizontal layout with animated cow + rainbow, status text, and start/stop actions.
 */
const CowbotCard = ({
  status,
  totalOrders,
  isAuctionActive,
  onStart,
  onStop,
}: CowbotCardProps) => {
  const isRunning = status === 'running'
  const isInitializing = status === 'initializing'
  const isActive = isRunning || isInitializing
  const isStopped = status === 'idle'

  // Only show when there's an active auction
  if (!isAuctionActive) return null

  // Don't show for external bots or errors
  if (status === 'external' || status === 'error') return null

  // Stopped state - show restart option
  if (isStopped) {
    return (
      <div className="bg-background p-4 rounded-3xl">
        <div className="flex items-center gap-4">
          {/* Left side: Static cow */}
          <CowbotAnimation isRunning={false} showRainbow />

          {/* Center: Status text */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground">
              CowSwap Auction Filler stopped
            </h4>
            <p className="text-sm text-muted-foreground">
              {totalOrders} order{totalOrders !== 1 ? 's' : ''} submitted
            </p>
          </div>

          {/* Right side: Start action */}
          <Button size="sm" variant="outline" className="shrink-0" onClick={onStart}>
            <Play className="w-3 h-3 mr-1.5 fill-current" />
            Start
          </Button>
        </div>
      </div>
    )
  }

  // Active state (initializing or running)
  return (
    <div className="bg-background p-4 rounded-3xl">
      <div className="flex items-center gap-4">
        {/* Left side: Rainbow + Cow animation */}
        <CowbotAnimation isRunning={isActive} showRainbow />

        {/* Center: Status text */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            {isInitializing && <Spinner size={14} />}
            {isInitializing
              ? 'CowSwap Auction Filler starting...'
              : 'CowSwap Auction Filler running...'}
          </h4>
          <p className="text-sm text-muted-foreground">
            {totalOrders} order{totalOrders !== 1 ? 's' : ''} submitted
          </p>
        </div>

        {/* Right side: Stop action */}
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={onStop}
          disabled={isInitializing}
        >
          <Square className="w-3 h-3 mr-1.5 fill-current" />
          Stop
        </Button>
      </div>
    </div>
  )
}

export default CowbotCard
