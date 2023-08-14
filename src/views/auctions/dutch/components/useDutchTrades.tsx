import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { blockAtom } from 'state/atoms'
import atomWithDebounce from 'utils/atoms/atomWithDebounce'
import { endedDutchTradesAtom, ongoingDutchTradesAtom } from '../atoms'

const ongoingTradesQuery = gql`
  query OngoingDutchTrades($id: String!, $block: Int!) {
    trades(
      where: { endBlock_gt: $block, rToken: $id, kind: 0, isSettled: false }
      orderBy: startBlock
      orderDirection: desc
    ) {
      id
      amount
      buying
      buyingTokenSymbol
      sellingTokenSymbol
      endAt
      selling
      startedAt
      worstCasePrice
      startBlock
      endBlock
      isSettled
      settleTxHash
    }
  }
`

const endedTradesQuery = gql`
  query EndedDutchTrades($id: String!, $block: Int!) {
    trades(
      where: { rToken: $id, kind: 0, endBlock_lte: $block }
      orderBy: startBlock
      orderDirection: desc
    ) {
      id
      amount
      buying
      buyingTokenSymbol
      sellingTokenSymbol
      endAt
      selling
      startedAt
      worstCasePrice
      startBlock
      endBlock
      isSettled
      settleTxHash
    }
  }
`

const debouncedBlock = atomWithDebounce(
  atom((get) => get(blockAtom)),
  60000
).debouncedValueAtom

// Use debounce value if exist over current block
const currentBlockAtom = atom((get) => {
  const block = get(blockAtom)
  const debounced = get(debouncedBlock)

  return debounced || block
})

const useDutchTrades = () => {
  const rToken = useRToken()
  const blockNumber = useAtomValue(currentBlockAtom)
  const setOngoingTrades = useSetAtom(ongoingDutchTradesAtom)
  const setEndedTrades = useSetAtom(endedDutchTradesAtom)

  const { data, error } = useQuery(
    rToken && blockNumber ? ongoingTradesQuery : null,
    {
      id: rToken?.address.toLowerCase(),
      block: blockNumber,
    }
  )
  const { data: endedData, error: endedError } = useQuery(
    rToken && blockNumber ? endedTradesQuery : null,
    {
      id: rToken?.address.toLowerCase(),
      block: blockNumber,
    }
  )

  useEffect(() => {
    if (data) {
      setOngoingTrades(data.trades ?? [])
    }
  }, [JSON.stringify(data)])

  useEffect(() => {
    if (endedData) {
      setEndedTrades(endedData.trades ?? [])
    }
  }, [endedData])
}

export default useDutchTrades
