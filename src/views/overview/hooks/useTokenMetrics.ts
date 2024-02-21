import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { rTokenPriceAtom, rsrPriceAtom } from 'state/atoms'
import { Address } from 'viem'

const rTokenMetricsQuery = gql`
  query GetRTokenMetrics($id: String!) {
    rtoken(id: $id) {
      rsrStaked
    }
    token(id: $id) {
      totalSupply
      transferCount
      cumulativeVolume
      lastPriceUSD
    }
  }
`

const useTokenMetrics = (rTokenAddress: Address) => {
  const rTokenPrice = useAtomValue(rTokenPriceAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const { data } = useQuery(rTokenMetricsQuery, {
    id: rTokenAddress,
  })

  return useMemo(() => {
    return {}
  }, [rTokenPrice, rsrPrice, data])
}

export default useTokenMetrics
