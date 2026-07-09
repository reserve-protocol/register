import { AsyncZapOrderState } from '@reserve-protocol/async-zap-sdk'
import { useEffect, useState } from 'react'
import { formatOrderCountdown } from '../quote-utils'

export function useOrderExpiryCountdown({
  executionStarted,
  orderStates,
}: {
  executionStarted: boolean
  orderStates: AsyncZapOrderState[]
}) {
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000))
  const activeOrderExpiries = orderStates
    .filter((order) => order.phase !== 'fulfilled' && order.phase !== 'failed')
    .map((order) => order.order?.validTo)
    .map((validTo) =>
      typeof validTo === 'number' ? validTo : Number(validTo ?? 0)
    )
    .filter((validTo) => Number.isFinite(validTo) && validTo > 0)
  const nextOrderExpiry =
    activeOrderExpiries.length > 0
      ? Math.min(...activeOrderExpiries)
      : undefined
  const orderExpirySeconds =
    nextOrderExpiry !== undefined
      ? Math.max(nextOrderExpiry - nowSec, 0)
      : undefined
  const orderExpiryCountdown =
    orderExpirySeconds !== undefined
      ? formatOrderCountdown(orderExpirySeconds)
      : undefined

  useEffect(() => {
    if (!executionStarted || activeOrderExpiries.length === 0) return

    const interval = window.setInterval(() => {
      setNowSec(Math.floor(Date.now() / 1000))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [executionStarted, activeOrderExpiries.length])

  return { orderExpirySeconds, orderExpiryCountdown }
}
