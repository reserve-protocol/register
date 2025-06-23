import { useEffect, useState } from 'react'

/**
 * useTimeRemaining - returns a human-readable countdown string (e.g. "2d 4h 10m")
 * that updates every minute until the `targetTimestamp` (in **seconds**).
 *
 * If the `targetTimestamp` is in the past, it returns "Ended".
 */
const useTimeRemaining = (targetTimestamp?: number): string => {
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    if (!targetTimestamp) {
      setTimeLeft('')
      return
    }

    const update = () => {
      const diffSec = Math.floor(targetTimestamp - Date.now() / 1000)

      if (diffSec <= 0) {
        setTimeLeft('Ended')
        return
      }

      const days = Math.floor(diffSec / 86_400)
      const hours = Math.floor((diffSec % 86_400) / 3_600)
      const minutes = Math.floor((diffSec % 3_600) / 60)
      const seconds = diffSec % 60

      const parts: string[] = []
      if (days) parts.push(`${days}d`)
      if (hours || days) parts.push(`${hours}h`)
      if (minutes || hours || days) parts.push(`${minutes}m`)
      parts.push(`${seconds}s`)

      setTimeLeft(parts.join(' '))
    }

    // initial call
    update()

    // update every second
    const id = setInterval(update, 1_000)

    return () => clearInterval(id)
  }, [targetTimestamp])

  return timeLeft
}

export default useTimeRemaining
