import { useEffect, useState } from 'react'

export function useSlowQuoteIndicator(waitingForQuote: boolean, delayMs: number) {
  const [showSlowQuote, setShowSlowQuote] = useState(false)

  useEffect(() => {
    if (!waitingForQuote) {
      setShowSlowQuote(false)
      return
    }

    const timeout = setTimeout(() => setShowSlowQuote(true), delayMs)
    return () => clearTimeout(timeout)
  }, [waitingForQuote, delayMs])

  return {
    showSlowQuote,
    hideSlowQuote: () => setShowSlowQuote(false),
  }
}
