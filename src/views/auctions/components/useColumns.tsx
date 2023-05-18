import { t, Trans } from '@lingui/macro'
import TokenItem from 'components/token-item'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { ArrowUpRight } from 'react-feather'
import { Box, Link, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

const getGnosisAuction = (auctionId: string): string => {
  return `https://gnosis-auction.eth.link/#/auction?auctionId=${auctionId}&chainId=1`
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

export default useColumns
