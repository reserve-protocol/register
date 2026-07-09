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

export type ComplianceEndpoint = 'geolocation' | 'wallet' | 'dtf'

export const trackCompliance = (props: {
  endpoint: ComplianceEndpoint
  status: 'success' | 'error'
  restricted?: boolean
  isVPN?: boolean
  reason?: string
  country?: string
  countryCode?: string
  shouldSkipRestrictions?: boolean
  ca?: string
  chain?: number
}) => {
  mixpanel.track('compliance_check', props)
}

export const trackEligibilityConfirmed = (props: {
  wa: string
  ca: string
  ticker?: string
  chain: number
}) => {
  mixpanel.track('eligibility_confirmed', props)
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
