import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useDebounce from 'hooks/useDebounce'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { blockTimestampAtom } from 'state/atoms'
import { tradesAtom } from '../atoms'

const tradesQuery = gql`
  query Trades($id: String!, $time: Int!) {
    current: trades(
      where: { endAt_gt: $time, rToken: $id }
      orderBy: startedAt
      orderDirection: desc
    ) {
      id
      amount
      auctionId
      buying
      buyingTokenSymbol
      sellingTokenSymbol
      endAt
      selling
      startedAt
      worstCasePrice
    }
    ended: trades(
      where: { endAt_lte: $time, rToken: $id }
      first: 50
      orderBy: startedAt
      orderDirection: desc
    ) {
      id
      amount
      auctionId
      buying
      buyingTokenSymbol
      sellingTokenSymbol
      endAt
      selling
      startedAt
      worstCasePrice
    }
  }
`

const TradesUpdater = () => {
  const rToken = useRToken()
  const blockTimestamp = useDebounce(
    useAtomValue(blockTimestampAtom) || dayjs().unix(),
    60000
  )
  const setTrades = useSetAtom(tradesAtom)

  const { data } = useQuery(rToken ? tradesQuery : null, {
    id: rToken?.address.toLowerCase(),
    time: blockTimestamp,
  })

  useEffect(() => {
    if (data) {
      setTrades({
        current: data.current,
        ended: data.ended,
      })
    }
  }, [JSON.stringify(data)])

  return null
}

export default TradesUpdater
