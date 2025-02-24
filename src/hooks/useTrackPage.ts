import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect } from 'react'

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
