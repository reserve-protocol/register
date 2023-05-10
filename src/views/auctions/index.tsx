import { t, Trans } from '@lingui/macro'
import { Container } from 'components'
import { Table } from 'components/table'
import TokenItem from 'components/token-item'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useDebounce from 'hooks/useDebounce'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { ArrowUpRight } from 'react-feather'
import { blockTimestampAtom } from 'state/atoms'
import { Box, BoxProps, Divider, Link, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import About from './About'
import InfoBox, { ContentHead } from 'components/info-box'
import { SmallButton } from 'components/button'
import AuctionsSidebar from './auctions-sidebar'

const getGnosisAuction = (auctionId: string): string => {
  return `https://gnosis-auction.eth.link/#/auction?auctionId=${auctionId}&chainId=1`
}

interface Trade {
  id: string
  amount: number
  auctionId: number
  buying: string
  buyingTokenSymbol: string
  sellingTokenSymbol: string
  endAt: number
  selling: string
  startedAt: number
  worstCasePrice: number
}

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

interface TableProps extends BoxProps {
  data: Trade[]
}

const useColumns = (ended = false) => {
  return useMemo(
    () => [
      {
        Header: ended ? t`Sold` : t`Selling`,
        accessor: 'sellingTokenSymbol',
        Cell: (cell: any) => <TokenItem symbol={cell.cell.value} />,
      },
      {
        Header: ended ? t`Bought` : t`Buying`,
        accessor: 'buyingTokenSymbol',
        Cell: (cell: any) => <TokenItem symbol={cell.cell.value} />,
      },
      {
        Header: t`Amount`,
        accessor: 'amount',
        Cell: (cell: any) => (
          <Text>
            {formatCurrency(cell.cell.value)}{' '}
            {cell.row.original.sellingTokenSymbol}
          </Text>
        ),
      },
      {
        Header: t`Worst price`,
        accessor: 'worstCasePrice',
        Cell: (cell: any) => <Text>{formatCurrency(cell.cell.value)}</Text>,
      },
      {
        Header: ended ? t`Ended at` : t`Ends at`,
        accessor: 'endAt',
        Cell: (cell: any) => (
          <Text>{dayjs(+cell.cell.value * 1000).format('YYYY-M-D HH:mm')}</Text>
        ),
      },
      {
        Header: '',
        accessor: 'auctionId',
        Cell: (cell: any) => (
          <Link href={getGnosisAuction(cell.cell.value)} target="_blank">
            <Box
              variant="layout.verticalAlign"
              sx={{ justifyContent: 'right' }}
            >
              <Trans>View</Trans>
              <ArrowUpRight style={{ marginLeft: 10 }} size={16} />
            </Box>
          </Link>
        ),
      },
    ],
    []
  )
}

const OutgoingAuctions = ({ data, ...props }: TableProps) => {
  const rToken = useRToken()
  const columns = useColumns()

  return (
    <Box {...props}>
      <Text variant="strong" ml={3} mb={4}>
        <Trans>Ongoing auctions</Trans>
      </Text>
      {data.length ? (
        <Table columns={columns} data={data} />
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
          <Text variant="legend">
            <Trans>
              No ongoing {rToken?.symbol || 'Unknown'}-related auctions. Someone
              has to check surplus revenue and poke the protocol to start a new
              auction.
            </Trans>
          </Text>
        </Box>
      )}
    </Box>
  )
}

const FinalizedAuctions = ({ data, ...props }: TableProps) => {
  const rToken = useRToken()
  const columns = useColumns(true)

  return (
    <Box {...props}>
      <Text variant="strong" ml={3} mb={4}>
        <Trans>Ended auctions</Trans>
      </Text>
      {data.length ? (
        <Table columns={columns} data={data} pagination />
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
          <Text variant="legend">
            <Trans>
              No ended {rToken?.symbol || 'Unknown'} related auctions
            </Trans>
          </Text>
        </Box>
      )}{' '}
    </Box>
  )
}

const Auctions = () => {
  const rToken = useRToken()
  const [sidebar, setSidebar] = useState(false)
  const blockTimestamp = useDebounce(
    useAtomValue(blockTimestampAtom) || dayjs().unix(),
    60000
  )

  const { data } = useQuery(rToken ? tradesQuery : null, {
    id: rToken?.address.toLowerCase(),
    time: blockTimestamp,
  })

  const rows = useMemo(() => {
    if (!data) {
      return { current: [], ended: [] }
    }

    return {
      current: data.current as Trade[],
      ended: data.ended as Trade[],
    }
  }, [JSON.stringify(data)])

  return (
    <Container>
      <Box variant="layout.verticalAlign">
        <Box mb={4}>
          <Text variant="strong" sx={{ fontSize: 3 }}>
            {rToken?.symbol || ''} related Auctions
          </Text>
          <Text variant="legend" mt="1">
            Ongoing & historical auctions of USD+ on Gnosis Easy Auction.
          </Text>
        </Box>
        <SmallButton ml="auto" variant="muted" onClick={() => setSidebar(true)}>
          <Trans>Check for auctions</Trans>
        </SmallButton>
      </Box>
      <OutgoingAuctions data={rows.current} mb={7} />
      <FinalizedAuctions data={rows.ended} />
      <Divider mx={-5} my={6} />
      <About />
      {sidebar && <AuctionsSidebar onClose={() => setSidebar(false)} />}
    </Container>
  )
}

export default Auctions
