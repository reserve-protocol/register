import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import TokenItem from 'components/token-item'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { ArrowUpRight } from 'react-feather'
import { Box, Flex, Link, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

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
        Header: t`Amount sold`,
        accessor: 'amount',
        Cell: (cell: any) => (
          <Text>
            {formatCurrency(cell.cell.value)}{' '}
            {cell.row.original.sellingTokenSymbol}
          </Text>
        ),
      },
      {
        Header: t`Buying`,
        accessor: 'buyingTokenSymbol',
        Cell: (cell: any) => <TokenItem symbol={cell.cell.value} />,
      },
      {
        Header: ended ? t`Amount bought` : t`Worst price`,
        accessor: ended ? 'boughtAmount' : 'worstCasePrice',
        Cell: (cell: any) => {
          console.log({ cell })

          const statusElement = (
            <Text>
              {parseFloat(cell.cell.value) === 0
                ? t`Incomplete`
                : formatCurrency(cell.cell.value)}
            </Text>
          )
          return ended ? (
            <Link
              href={getExplorerLink(
                cell.row.original.settleTxHash,
                ExplorerDataType.TRANSACTION
              )}
              target="_blank"
              sx={{ textDecoration: 'underline', color: 'text' }}
            >
              {statusElement}
            </Link>
          ) : (
            statusElement
          )
        },
      },

      {
        Header: ended ? t`Ended at` : t`Ends at`,
        accessor: 'endAt',
        Cell: (cell: any) => (
          <Text>{dayjs(+cell.cell.value * 1000).format('YYYY-M-D HH:mm')}</Text>
        ),
      },
      {
        Header: () => <Box sx={{ textAlign: 'right' }}>Auction link</Box>,
        accessor: 'auctionId',
        Cell: (cell: any) => (
          <Flex sx={{ justifyContent: 'right' }}>
            <Link href={getGnosisAuction(cell.cell.value)} target="_blank">
              <SmallButton variant="muted">
                <Box variant="layout.verticalAlign">
                  <Trans>Auction</Trans>
                  <ArrowUpRight style={{ marginLeft: 10 }} size={14} />
                </Box>
              </SmallButton>
            </Link>
          </Flex>
        ),
      },
    ],
    []
  )
}

export default useColumns
