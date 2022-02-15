/* eslint-disable camelcase */
import useSWR from 'swr'

type Response = {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

const formatData = (data: [number, number][]) =>
  data.map(([timestamp, value]) => ({
    date:
      new Date(timestamp).toLocaleDateString('en-US') +
      ' ' +
      new Date(timestamp).toLocaleTimeString('en-US'),
    value,
  }))

const fetcher = async (url: string) => {
  const data: Response = await fetch(url).then((res) => res.json())

  return {
    prices: formatData(data.prices),
    marketCap: formatData(data.market_caps),
    volume: formatData(data.total_volumes),
  }
}

/**
 * Returns Token price/marketCap/volume data range for a given token address
 *
 * @DataSource: Coingecko
 */
const useTokenMarket = (address?: string, range = '7', currency = 'usd') => {
  const { data, error } = useSWR(
    address
      ? `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}/market_chart?vs_currency=usd&days=7`
      : null,
    fetcher
  )

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}

export default useTokenMarket
