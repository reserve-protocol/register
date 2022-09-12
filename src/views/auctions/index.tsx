import { t, Trans } from '@lingui/macro'
import { Container } from 'components'
import { Box, BoxProps, Text } from 'theme-ui'
import { ContentHead } from 'components/info-box'
import useRToken from 'hooks/useRToken'
import { Table } from 'components/table'
import { useMemo } from 'react'
import { gql } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { blockTimestampAtom } from 'state/atoms'
import useQuery from 'hooks/useQuery'

const tradesQuery = gql`
  query Trades($id: String!, $time: Int!) {
    current: trades(
      where: { endedAt_gt: $time, rToken: $id }
      orderBy: startedAt
      orderDirection: desc
    ) {
      id
      amount
      auctionId
      buying
      endAt
      selling
      startedAt
      worstCasePrice
    }
    ended: trades(
      where: { endedAt_lte: $time, rToken: $id }
      first: 50
      orderBy: startedAt
      orderDirection: desc
    ) {
      id
      amount
      auctionId
      buying
      endAt
      selling
      startedAt
      worstCasePrice
    }
  }
`

interface Trade {
  id: string
  amount: number
  auctionId: number
  buying: string
  endAt: number
  selling: string
  startedAt: number
  worstCasePrice: number
}

interface TableProps extends BoxProps {
  data: Trade[]
}

const OutgoingAuctions = ({ data, ...props }: TableProps) => {
  const columns = useMemo(
    () => [
      {
        Header: t`Selling`,
        accessor: 'selling',
      },
      { Header: t`Buying`, accessor: 'buying' },
      { Header: t`Amount`, accessor: 'amount' },
      { Header: t`Worst case price`, accessor: 'worstCasePrice' },
      { Header: t`Ends at`, accessor: 'endAt' },
      {
        Header: '',
        accessor: 'auctionId',
        Cell: (cell: any) => {
          return <Text>{cell.auctionId}</Text>
        },
      },
    ],
    []
  )

  return (
    <Box {...props}>
      <Text variant="title" sx={{ fontSize: 3 }} ml={5} mb={4}>
        <Trans>Ongoing Auctions</Trans>
      </Text>
      {data.length ? (
        <Table columns={columns} data={[]} />
      ) : (
        <Box
          sx={{
            border: '1px dashed',
            borderColor: 'darkBorder',
            textAlign: 'center',
            borderRadius: 16,
          }}
          p={6}
        >
          <Text>
            <Trans>No ongoing auctions</Trans>
          </Text>
        </Box>
      )}
    </Box>
  )
}

const FinalizedAuctions = ({ data, ...props }: TableProps) => {
  const columns = useMemo(
    () => [
      {
        Header: t`Sold`,
        accessor: 'selling',
      },
      { Header: t`Bought`, accessor: 'buying' },
      { Header: t`Amount`, accessor: 'amount' },
      { Header: t`Ended at`, accessor: 'endAt' },
      {
        Header: '',
        accessor: 'auctionId',
        Cell: (cell: any) => {
          return <Text>{cell.auctionId}</Text>
        },
      },
    ],
    []
  )

  return (
    <Box {...props}>
      <Text variant="title" sx={{ fontSize: 3 }} ml={5} mb={4}>
        <Trans>Ended Auctions</Trans>
      </Text>
      {data.length ? (
        <Table columns={columns} data={[]} />
      ) : (
        <Box
          sx={{
            border: '1px dashed',
            borderColor: 'darkBorder',
            textAlign: 'center',
            borderRadius: 16,
          }}
          p={6}
        >
          <Text>
            <Trans>No ended auctions</Trans>
          </Text>
        </Box>
      )}{' '}
    </Box>
  )
}

const Auctions = () => {
  const rToken = useRToken()
  const time = useAtomValue(blockTimestampAtom)

  const { data } = useQuery(rToken ? tradesQuery : null, {
    id: rToken?.address.toLowerCase(),
    time,
  })

  const rows = useMemo(() => {
    if (!data) {
      return { current: [], ended: [] }
    }

    return {
      current: data.current as Trade[],
      ended: data.ended as Trade[],
    }
  }, [data])

  return (
    <Container>
      <ContentHead
        title={rToken?.symbol + ' ' + t`related Auctions`}
        subtitle={t`Ongoing & historical auctions of USD+ from the Gnosis Auction app`}
        mb={7}
        ml={5}
      />
      <OutgoingAuctions data={rows.current} mb={7} />
      <FinalizedAuctions data={rows.ended} />
    </Container>
  )
}

export default Auctions
