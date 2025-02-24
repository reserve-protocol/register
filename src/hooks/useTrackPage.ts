import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect } from 'react'

export const trackClick = (
  page: string,
  ctaLabel: string,
  ca?: string,
  ticker?: string,
  chain?: string | number
) => {
  mixpanel.track('tap', {
    page,
    cta: ctaLabel,
    ca,
    ticker,
    chain,
  })
}

const useTrackPage = (page: string, subpage?: string) => {
  useEffect(() => {
    mixpanel.track_pageview({
      page,
      subpage,
    })
  }, [])

  return null
}

export default useTrackPage
