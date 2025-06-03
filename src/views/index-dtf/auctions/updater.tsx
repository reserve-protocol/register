import LegacyUpdater from './legacy/updater'
import { useAtomValue, useSetAtom } from 'jotai'
import { Rebalance, rebalancesAtom } from './atoms'
import { useQuery } from '@tanstack/react-query'
import { indexDTFAtom } from '@/state/dtf/atoms'
import request, { gql } from 'graphql-request'
import { INDEX_DTF_SUBGRAPH_URL } from '@/state/atoms'
import { useEffect } from 'react'
const query = gql`
  query getGovernanceStats($dtf: String!) {
    rebalances(where: { dtf: $dtf }, orderBy: timestamp, orderDirection: desc) {
      id
      tokens {
        address
        name
        symbol
        decimals
      }
      priceControl
      weightLowLimit
      weightSpotLimit
      weightHighLimit
      rebalanceLowLimit
      rebalanceSpotLimit
      rebalanceHighLimit
      priceLowLimit
      priceHighLimit
      restrictedUntil
      availableUntil
      transactionHash
      blockNumber
      timestamp
    }
  }
`

const useRebalances = () => {
  const dtf = useAtomValue(indexDTFAtom)

  return useQuery({
    queryKey: ['rebalances', dtf?.id],
    queryFn: async () => {
      if (!dtf) throw new Error('DTF not found')

      const response = await request<{ rebalances: Rebalance[] }>(
        INDEX_DTF_SUBGRAPH_URL[dtf.chainId],
        query,
        {
          dtf: dtf?.id ?? '',
        }
      )

      return response.rebalances ?? []
    },
    enabled: !!dtf?.id,
  })
}
const RebalanceUpdater = () => {
  const setRebalances = useSetAtom(rebalancesAtom)
  const { data } = useRebalances()

  useEffect(() => {
    if (data) setRebalances(data)
  }, [data, setRebalances])

  useEffect(() => {
    return () => {
      setRebalances(undefined)
    }
  }, [])

  return null
}

const Updater = () => {
  return (
    <>
      <RebalanceUpdater />
      <LegacyUpdater />
    </>
  )
}

export default Updater
