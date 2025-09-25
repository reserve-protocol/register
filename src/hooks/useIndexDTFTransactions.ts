import { INDEX_DTF_SUBGRAPH_URL } from '@/state/atoms'
import {
  indexDTFPriceAtom,
  indexDTFTransactionsAtom,
  Transaction,
} from '@/state/dtf/atoms'
import { useQuery } from '@tanstack/react-query'
import { request } from 'graphql-request'
import { useAtomValue, useSetAtom } from 'jotai'
import { formatEther } from 'viem'

type Response = {
  transferEvents: {
    id: string
    hash: string
    amount: string
    timestamp: string
    to?: { id: string }
    from?: { id: string }
    type: 'MINT' | 'REDEEM' | 'TRANSFER'
  }[]
}

const query = `
  query ($dtf: String!) {
    transferEvents(where: { token: $dtf, type_not: "TRANSFER" }, orderBy: timestamp, orderDirection: desc) {
      id
      hash
      amount
      timestamp
      to {
        id
      }
      from {
        id
      }
      type
    }
  }
`
const useIndexDTFTransactions = (dtf: string, chain: number) => {
  const price = useAtomValue(indexDTFPriceAtom) // TODO: temp
  const setTransactions = useSetAtom(indexDTFTransactionsAtom)

  return useQuery({
    queryKey: ['transfers', dtf, chain, price],
    queryFn: async () => {
      const data = await request<Response>(
        INDEX_DTF_SUBGRAPH_URL[chain],
        query,
        {
          dtf: dtf.toLowerCase(),
        }
      )

      const result = data.transferEvents.map((event) => ({
        id: event.id,
        hash: event.hash,
        amount: Number(formatEther(BigInt(event.amount))),
        amountUSD: Number(formatEther(BigInt(event.amount))) * (price || 0),
        timestamp: Number(event.timestamp),
        chain,
        to: event.to?.id,
        from: event.from?.id,
        type:
          event.type.charAt(0).toUpperCase() +
          event.type.slice(1).toLowerCase(),
      })) as Transaction[]

      setTransactions(result)

      return result
    },
    enabled: Boolean(dtf && chain && price),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export default useIndexDTFTransactions
