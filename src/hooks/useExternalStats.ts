import useSWR from 'swr'
import { StringMap } from 'types'
import { RSVOverview } from 'utils/rsv'

const OVERVIEW_URL = `https:${import.meta.env.VITE_RPAY_FEED}/aggregate`

const fetcher = async (url: string): Promise<StringMap> => {
  const data = await fetch(url).then((res) => res.json())

  return {
    volume: (data?.['total_tx_volume'] ?? 0) + RSVOverview.volume,
    txCount: (data?.['total_tx_count'] ?? 0) + RSVOverview.txCount,
    holders: data?.['user_count'] ?? 0,
    dayVolume: data?.['24_hour_tx_volume'] ?? 0,
    dayTxCount: data?.['24_hour_tx_count'] ?? 0,
  } as Record<string, number>
}

const useExternalStats = () => {
  return useSWR(OVERVIEW_URL, fetcher, { keepPreviousData: true })
}

export default useExternalStats
