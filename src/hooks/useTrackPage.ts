import { useEffect } from 'react'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useAtomValue } from 'jotai'
import { walletAtom } from '@/state/atoms'

const useTrackPage = (page: string, subpage?: string) => {
  const account = useAtomValue(walletAtom)

  useEffect(() => {
    if (!account) return

    mixpanel.track_pageview({
      page,
      subpage,
      wa: account ?? undefined,
    })
  }, [account])

  return null
}

export default useTrackPage
