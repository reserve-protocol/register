import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { supportedChainList } from 'utils/constants'
import { Address, getAddress } from 'viem'
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
  amountUSD: number | string
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
      orderBy: timestamp
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
    where['from'] = wallet.trim().toLowerCase()
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
  const { data, error } = useMultichainQuery(
    explorerTransactionsQuery,
    variables
  )

  return useMemo(() => {
    if (!data) return []

    const tx: TransactionRecord[] = []

    for (const chain of supportedChainList) {
      if (data[chain]) {
        tx.push(
          ...data[chain].entries.map((entry: any) => ({
            ...entry,
            chain,
            tokenAddress: getAddress(entry.token.id),
          }))
        )
      }
    }

    return tx
  }, [data])
}

export default useTransactionData
