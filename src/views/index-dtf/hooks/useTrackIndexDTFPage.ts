import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect } from 'react'

const useTrackIndexDTFPage = (subpage: string) => {
  const indexDTF = useAtomValue(indexDTFAtom)

  useEffect(() => {
    if (!indexDTF) return

    mixpanel.track_pageview({
      page: 'overview',
      subpage,
      ca: indexDTF.id,
      ticker: indexDTF.token.symbol,
      chain: indexDTF.chainId,
    })
  }, [indexDTF])

  return null
}

export default useTrackIndexDTFPage
