import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { portfolioNowAtom } from '../atoms'

// Keeps portfolioNowAtom ticking (unix seconds, 60s resolution) so relative
// times like unstaking cooldowns stay fresh while the page is open.
export const usePortfolioNow = () => {
  const setPortfolioNow = useSetAtom(portfolioNowAtom)

  useEffect(() => {
    const updatePortfolioNow = () => {
      setPortfolioNow(Math.floor(Date.now() / 1000))
    }

    updatePortfolioNow()
    const interval = setInterval(updatePortfolioNow, 60_000)

    return () => clearInterval(interval)
  }, [setPortfolioNow])
}
