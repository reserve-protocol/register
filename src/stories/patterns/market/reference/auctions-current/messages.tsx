import { Button } from '@/components/button'
import {
  InlineMessage,
  InlineMessageDescription,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import type { DataState } from './fixtures'

export function CurrentMessages({
  data,
  warnings,
  onRetry,
}: {
  data: DataState
  warnings: boolean
  onRetry?: () => void
}) {
  const errors: Partial<Record<DataState, string>> = {
    'price-error': 'Price data unavailable — cannot launch auction.',
    'metadata-error':
      'token metadata is unavailable. Launch and weight editing are blocked.',
    'auction-error':
      'auction state is unknown. Launch stays blocked until it can be confirmed.',
    bounds:
      'a token is out of bounds. Launch stays blocked; closing the rebalance requires engineering review.',
    error: 'Unexpected error getting Rebalance data.',
  }
  if (!errors[data] && !warnings) return null
  return (
    <div className="space-y-3" data-testid="current-messages">
      {errors[data] && (
        <InlineMessage tone="danger" density="compact" role="status">
          <InlineMessageTitle>{errors[data]}</InlineMessageTitle>
          {onRetry && data !== 'bounds' && (
            <Button
              tone="secondary"
              className="mt-3"
              onClick={onRetry}
              data-testid="current-data-retry"
            >
              Retry
            </Button>
          )}
        </InlineMessage>
      )}
      {warnings && (
        <InlineMessage tone="danger" density="compact">
          <InlineMessageTitle>High price impact</InlineMessageTitle>
          <InlineMessageDescription>
            XRP: &gt;5% simulated price impact. Estimated loss: ~$6,083.21
          </InlineMessageDescription>
        </InlineMessage>
      )}
    </div>
  )
}

export function AuctionSizeWarning() {
  return (
    <InlineMessage tone="warning" density="compact">
      <InlineMessageTitle>Ondo limits</InlineMessageTitle>
      <InlineMessageDescription>
        NVDAon: outside trading hours or larger than the max single Ondo trade.
        Oversized legs fill as multiple sequential trades.
      </InlineMessageDescription>
    </InlineMessage>
  )
}
