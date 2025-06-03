import { INDEX_DTF_SUBGRAPH_URL } from '@/state/chain/atoms/chainAtoms'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { currentRebalanceAtom } from '../../atoms'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { useEffect } from 'react'
import { Auction, rebalanceAuctionsAtom } from './atoms'

type Response = {
  auctions: Auction[]
}

const query = gql`
  query getGovernanceStats($rebalanceId: String!) {
    auctions(where: { rebalance: $rebalanceId }) {
      id
      tokens {
        address
        name
        symbol
        decimals
      }
      weightLowLimit
      weightSpotLimit
      weightHighLimit
      rebalanceLowLimit
      rebalanceSpotLimit
      rebalanceHighLimit
      priceLowLimit
      priceHighLimit
      startTime
      endTime
      blockNumber
      timestamp
      transactionHash
      bids {
        id
        bidder
        sellToken {
          address
          name
          symbol
          decimals
        }
        buyToken {
          address
          name
          symbol
          decimals
        }
        sellAmount
        buyAmount
        blockNumber
        timestamp
        transactionHash
      }
    }
  }
`

const useAuctions = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)
  const chainId = useAtomValue(chainIdAtom)

  return useQuery({
    queryKey: ['auctions', rebalance?.rebalance.id],
    queryFn: async () => {
      if (!rebalance?.rebalance.id) throw new Error('No rebalance id')

      try {
        const data = await request<Response>(
          INDEX_DTF_SUBGRAPH_URL[chainId],
          query,
          {
            rebalanceId: rebalance?.rebalance.id,
          }
        )
        return data.auctions
      } catch (e) {
        console.error('error fetching', e)
        return []
      }
    },
    enabled: !!rebalance?.rebalance.id,
    refetchInterval: 1000 * 60, // every minute!
  })
}

// Fetch current rebalance auctions!
const Updater = () => {
  const { data } = useAuctions()
  const setRebalanceAuctions = useSetAtom(rebalanceAuctionsAtom)

  useEffect(() => {
    if (data) {
      setRebalanceAuctions(data)
    }
  }, [data, setRebalanceAuctions])

  return null
}

export default Updater
