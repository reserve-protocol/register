import { useEffect } from 'react'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useAtomValue } from 'jotai'
import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'

const useTrackIndexDTFPage = (subpage: string) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const account = useAtomValue(walletAtom)

  useEffect(() => {
    if (!account || !indexDTF) return

    mixpanel.track_pageview({
      page: 'overview',
      subpage,
      wa: account ?? undefined,
      ca: indexDTF.id,
      ticker: indexDTF.token.symbol,
      chain: indexDTF.chainId,
    })
  }, [account, indexDTF])

  return null
}

export default useTrackIndexDTFPage
