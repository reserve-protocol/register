import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { timestampAtom } from 'state/atoms'
import {
  endedDutchTradesAtom,
  ongoingDutchTradesAtom,
  pendingDutchTradesAtom,
} from '../atoms'

const endedTradesQuery = gql`
  query DutchTrades($id: String!, $timestamp: Int!) {
    ongoing: trades(
      where: { endAt_gt: $timestamp, rToken: $id, kind: 0, isSettled: false }
      orderBy: startedAt
      orderDirection: desc
    ) {
      id
      amount
      buying
      buyingTokenSymbol
      buyingTokenDecimals
      sellingTokenSymbol
      sellingTokenDecimals
      endAt
      selling
      startedAt
      worstCasePrice
      isSettled
      settleTxHash
    }
    ended: trades(
      where: { rToken: $id, kind: 0, endAt_lte: $timestamp, isSettled: false }
      orderBy: startedAt
      orderDirection: desc
    ) {
      id
      amount
      buying
      buyingTokenSymbol
      buyingTokenDecimals
      sellingTokenSymbol
      sellingTokenDecimals
      endAt
      selling
      startedAt
      worstCasePrice
      isSettled
      settleTxHash
      kind
    }
    settled: trades(
      where: { rToken: $id, kind: 0, endAt_lte: $timestamp, isSettled: true }
      orderBy: startedAt
      orderDirection: desc
    ) {
      id
      amount
      buying
      buyingTokenSymbol
      buyingTokenDecimals
      sellingTokenSymbol
      sellingTokenDecimals
      endAt
      selling
      isSettled
      startedAt
      worstCasePrice
      settleTxHash
      kind
    }
  }
`

const useDutchTrades = () => {
  const rToken = useRToken()
  const setOngoingTrades = useSetAtom(ongoingDutchTradesAtom)
  const setPendingTrades = useSetAtom(pendingDutchTradesAtom)
  const [currentEndedTrades, setEndedTrades] = useAtom(endedDutchTradesAtom)
  const timestamp = useAtomValue(timestampAtom)

  const { data } = useQuery(rToken ? endedTradesQuery : null, {
    id: rToken?.address.toLowerCase(),
    timestamp,
  })

  useEffect(() => {
    if (data) {
      setOngoingTrades(data.ongoing)

      if (
        !currentEndedTrades.length ||
        currentEndedTrades.length != data.settled.length + data.ended.length
      ) {
        setPendingTrades(data.ended)
        setEndedTrades(data.settled)
      }
    }
  }, [JSON.stringify(data)])
}

export default useDutchTrades
