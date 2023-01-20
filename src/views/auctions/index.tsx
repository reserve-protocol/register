import { t, Trans } from '@lingui/macro'
import { Container } from 'components'
import { ContentHead } from 'components/info-box'
import { Table } from 'components/table'
import About from './About'
import TokenItem from 'components/token-item'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useDebounce from 'hooks/useDebounce'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { getRTokenLogo } from 'hooks/useRTokenLogo'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { ArrowUpRight } from 'react-feather'
import { blockTimestampAtom } from 'state/atoms'
import { Box, BoxProps, Link, Text, Divider } from 'theme-ui'
import { StringMap } from 'types'
import { formatCurrency } from 'utils'
import { RSR_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'

const getGnosisAuction = (auctionId: string): string => {
  return `https://gnosis-auction.eth.link/#/auction?auctionId=${auctionId}&chainId=1`
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
  tokens: StringMap
}

const OutgoingAuctions = ({ data, tokens, ...props }: TableProps) => {
  const rToken = useRToken()

  const columns = useMemo(
    () => [
      {
        Header: t`Sold`,
        accessor: 'selling',
        Cell: (cell: any) => (
          <TokenItem
            symbol={tokens[cell.cell.value]}
            logo={
              rToken?.symbol === cell.cell.value
                ? getRTokenLogo(rToken?.address ?? '')
                : undefined
            }
          />
        ),
      },
      {
        Header: t`Bought`,
        accessor: 'buying',
        Cell: (cell: any) => (
          <TokenItem
            symbol={tokens[cell.cell.value]}
            logo={
              rToken?.symbol === cell.cell.value
                ? getRTokenLogo(rToken?.address ?? '')
                : undefined
            }
          />
        ),
      },
      {
        Header: t`Amount`,
        accessor: 'amount',
        Cell: (cell: any) => <Text>{formatCurrency(cell.cell.value)}</Text>,
      },
      {
        Header: t`Worst case price`,
        accessor: 'worstCasePrice',
        Cell: (cell: any) => <Text>{formatCurrency(cell.cell.value)}</Text>,
      },
      {
        Header: t`Ends at`,
        accessor: 'endAt',
        Cell: (cell: any) => (
          <Text>{dayjs(+cell.cell.value * 1000).format('YYYY-M-d HH:mm')}</Text>
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

  return (
    <Box {...props}>
      <Text variant="strong" ml={3} mb={4}>
        <Trans>Ongoing</Trans>
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

const FinalizedAuctions = ({ data, tokens, ...props }: TableProps) => {
  const rToken = useRToken()

  const columns = useMemo(
    () => [
      {
        Header: t`Sold`,
        accessor: 'selling',
        Cell: (cell: any) => (
          <TokenItem
            symbol={tokens[cell.cell.value]}
            logo={
              rToken?.symbol === cell.cell.value
                ? getRTokenLogo(rToken?.address ?? '')
                : undefined
            }
          />
        ),
      },
      {
        Header: t`Bought`,
        accessor: 'buying',
        Cell: (cell: any) => (
          <TokenItem
            symbol={tokens[cell.cell.value]}
            logo={
              rToken?.symbol === cell.cell.value
                ? getRTokenLogo(rToken?.address ?? '')
                : undefined
            }
          />
        ),
      },
      {
        Header: t`Amount`,
        accessor: 'amount',
        Cell: (cell: any) => <Text>{formatCurrency(cell.cell.value)}</Text>,
      },
      {
        Header: t`Ended at`,
        accessor: 'endAt',
        Cell: (cell: any) => (
          <Text>{dayjs(+cell.cell.value * 1000).format('YYYY-M-d HH:mm')}</Text>
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

  return (
    <Box {...props}>
      <Text variant="strong" ml={3} mb={4}>
        <Trans>Ended</Trans>
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
  const blockTimestamp = useDebounce(useAtomValue(blockTimestampAtom), 60000)

  const tokens = useMemo(() => {
    let addresses = {} as StringMap

    if (rToken) {
      for (const c of rToken?.collaterals) {
        addresses[c.address.toLowerCase()] = c.symbol
      }

      addresses[rToken.address.toLowerCase()] = rToken.symbol
      addresses[RSR_ADDRESS[CHAIN_ID].toLowerCase()] = 'RSR'

      if (rToken.stToken) {
        addresses[rToken.stToken?.address.toLowerCase()] = rToken.stToken.symbol
      }
    }

    return addresses
  }, [rToken?.address])

  const { data } = useQuery(rToken ? tradesQuery : null, {
    id: rToken?.address.toLowerCase(),
    time: blockTimestamp,
  })

  const rows = useMemo(() => {
    if (!data || !blockTimestamp) {
      return { current: [], ended: [] }
    }

    return {
      current: data.current as Trade[],
      ended: data.ended as Trade[],
    }
  }, [data])

  return (
    <Container>
      <ContentHead title={`Auctions`} mb={7} ml={3} />

      <OutgoingAuctions data={rows.current} tokens={tokens} mb={7} />
      <FinalizedAuctions data={rows.ended} tokens={tokens} />
      <Divider mx={-5} my={6} />
      <About />
    </Container>
  )
}

export default Auctions
