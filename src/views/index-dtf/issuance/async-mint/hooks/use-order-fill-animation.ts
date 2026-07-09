import { AsyncZapOrderState } from '@reserve-protocol/async-zap-sdk'
import { useEffect, useRef, useState } from 'react'

export function useOrderFillAnimation({
  executionStarted,
  filledOrderCount,
  orderCount,
  orderStates,
}: {
  executionStarted: boolean
  filledOrderCount: number
  orderCount: number
  orderStates: AsyncZapOrderState[]
}) {
  const previousFilledOrderCount = useRef(filledOrderCount)
  const countPulseTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const [countPulseActive, setCountPulseActive] = useState(false)
  const previousOrderPhases = useRef<Record<string, string | undefined>>({})
  const fillAnimationTimeouts = useRef<ReturnType<typeof setTimeout>[]>([])
  const [recentlyFilledLegIds, setRecentlyFilledLegIds] = useState<Set<string>>(
    () => new Set()
  )

  useEffect(() => {
    if (
      executionStarted &&
      orderCount > 0 &&
      filledOrderCount > previousFilledOrderCount.current
    ) {
      setCountPulseActive(true)
      if (countPulseTimeout.current) {
        clearTimeout(countPulseTimeout.current)
      }
      countPulseTimeout.current = setTimeout(() => {
        setCountPulseActive(false)
      }, 800)
    }

    previousFilledOrderCount.current = filledOrderCount
  }, [executionStarted, filledOrderCount, orderCount])

  useEffect(() => {
    return () => {
      if (countPulseTimeout.current) {
        clearTimeout(countPulseTimeout.current)
      }
    }
  }, [])

  useEffect(() => {
    const newlyFilledLegIds: string[] = []

    for (const order of orderStates) {
      const previousPhase = previousOrderPhases.current[order.legId]

      if (
        executionStarted &&
        order.phase === 'fulfilled' &&
        previousPhase &&
        previousPhase !== 'fulfilled'
      ) {
        newlyFilledLegIds.push(order.legId)
      }

      previousOrderPhases.current[order.legId] = order.phase
    }

    if (newlyFilledLegIds.length === 0) return

    setRecentlyFilledLegIds((current) => {
      const next = new Set(current)
      for (const legId of newlyFilledLegIds) next.add(legId)
      return next
    })

    const timeout = setTimeout(() => {
      setRecentlyFilledLegIds((current) => {
        const next = new Set(current)
        for (const legId of newlyFilledLegIds) next.delete(legId)
        return next
      })
    }, 1800)

    fillAnimationTimeouts.current.push(timeout)
  }, [executionStarted, orderStates])

  useEffect(() => {
    const timeouts = fillAnimationTimeouts.current
    return () => {
      for (const timeout of timeouts) {
        clearTimeout(timeout)
      }
    }
  }, [])

  return { countPulseActive, recentlyFilledLegIds }
}
