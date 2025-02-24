import { trackClick } from '@/hooks/useTrackPage'
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

export const useTrackIndexDTF = (
  event: string,
  page: string,
  subpage?: string
) => {
  const indexDTF = useAtomValue(indexDTFAtom)

  const track = (ctaLabel: string) => {
    if (!indexDTF) return
    mixpanel.track(event, {
      page,
      subpage,
      cta: ctaLabel,
      ca: indexDTF.id,
      ticker: indexDTF.token.symbol,
      chain: indexDTF.chainId,
    })
  }

  return { track }
}

export const useTrackIndexDTFClick = (page: string, subpage?: string) => {
  const { track } = useTrackIndexDTF('tap', page, subpage)
  return { trackClick: track }
}

export const useTrackIndexDTFZapClick = (page: string, subpage?: string) => {
  const indexDTF = useAtomValue(indexDTFAtom)

  const trackClick = (
    ctaLabel: string,
    inputToken: string,
    outputToken: string
  ) => {
    if (!indexDTF) return
    mixpanel.track('tap', {
      page,
      subpage,
      cta: ctaLabel,
      ca: indexDTF.id,
      ticker: indexDTF.token.symbol,
      chain: indexDTF.chainId,
      input: inputToken,
      output: outputToken,
    })
  }

  return { trackClick }
}

export default useTrackIndexDTFPage
