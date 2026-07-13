import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/use-query'
import useIndexDTFList from 'hooks/useIndexDTFList'
import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { INDEX_GRAPH_CLIENTS } from 'state/atoms'
import { supportedChainList } from 'utils/constants'
import { Address, formatEther, getAddress } from 'viem'
import {
  debouncedWalletInputAtom,
  defaultSort,
  filtersAtom,
  sortByAtom,
} from './atoms'

export interface TransactionRecord {
  id: string
  type: string
  amount: bigint
  amountUSD: number | string | null
  timestamp: number
  symbol?: string
  hash: string
  from: {
    id: string
  }
  to: {
    id: string
  }
  token: {
    id: string
    symbol: string
  }
  chain: number
  tokenAddress: Address
}

const explorerTransactionsQuery = gql`
  query Transactions(
    $where: Entry_filter
    $limit: Int!
    $direction: OrderDirection!
    $by: String!
  ) {
    entries(
      orderBy: $by
      where: $where
      orderDirection: $direction
      first: $limit
    ) {
      id
      type
      amount
      amountUSD
      hash
      from {
        id
      }
      to {
        id
      }
      token {
        id
        symbol
      }
      timestamp
    }
  }
`

const indexTransferEventsQuery = gql`
  query IndexTransferEvents(
    $where: TransferEvent_filter
    $limit: Int!
    $direction: OrderDirection!
    $by: String!
  ) {
    transferEvents(
      orderBy: $by
      where: $where
      orderDirection: $direction
      first: $limit
    ) {
      id
      hash
      amount
      timestamp
      type
      from {
        id
      }
      to {
        id
      }
      token {
        id
        symbol
      }
    }
  }
`

const filtersQueryAtom = atom((get) => {
  const filters = get(filtersAtom)
  const wallet = get(debouncedWalletInputAtom.debouncedValueAtom)
  const where: Record<string, unknown> = {}
  const { id, desc } = get(sortByAtom) ?? defaultSort

  if (filters.type.length) {
    where['type_in'] = filters.type
  }

  if (filters.tokens.length) {
    where['token_in'] = filters.tokens
  }

  if (wallet) {
    const w = wallet.trim().toLowerCase()
    where['or'] = [{ from: w }, { to: w }]
  }

  return {
    where,
    limit: 250,
    by: id,
    direction: desc ? 'desc' : 'asc',
    _chain: filters.chains.length
      ? filters.chains.map((chain) => parseInt(chain))
      : undefined,
  }
})

const useTransactionData = () => {
  const variables = useAtomValue(filtersQueryAtom)
  const { data: yieldData } = useMultichainQuery(
    explorerTransactionsQuery,
    variables
  )
  const { data: indexData } = useMultichainQuery(
    indexTransferEventsQuery,
    variables,
    { clients: INDEX_GRAPH_CLIENTS }
  )
  const { data: indexDTFs } = useIndexDTFList()

  return useMemo(() => {
    if (!yieldData && !indexData) return []

    const priceMap = (indexDTFs ?? []).reduce(
      (acc, dtf) => {
        acc[`${dtf.chainId}-${dtf.address.toLowerCase()}`] = dtf.price
        return acc
      },
      {} as Record<string, number>
    )

    const tx: TransactionRecord[] = []

    for (const chain of supportedChainList) {
      if (yieldData?.[chain]) {
        tx.push(
          ...yieldData[chain].entries.map((entry: any) => ({
            ...entry,
            amount: BigInt(entry.amount),
            timestamp: Number(entry.timestamp),
            to: entry.to ?? { id: '' },
            chain,
            tokenAddress: getAddress(entry.token.id),
          }))
        )
      }

      if (indexData?.[chain]) {
        tx.push(
          ...indexData[chain].transferEvents.map((event: any) => {
            const tokenAddress = getAddress(event.token.id)
            const price = priceMap[`${chain}-${event.token.id.toLowerCase()}`]
            const amount = Number(formatEther(BigInt(event.amount)))

            return {
              id: event.id,
              hash: event.hash,
              type: event.type,
              amount: BigInt(event.amount),
              amountUSD: typeof price === 'number' ? amount * price : null,
              timestamp: Number(event.timestamp),
              from: event.from ?? { id: '' },
              to: event.to ?? { id: '' },
              token: event.token,
              chain,
              tokenAddress,
            }
          })
        )
      }
    }

    return tx
  }, [yieldData, indexData, indexDTFs])
}

export default useTransactionData
