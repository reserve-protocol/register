import { t } from '@lingui/macro'
import { SmallButton } from 'components/button'
import TokenItem from 'components/token-item'
import dayjs from 'dayjs'
import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { ArrowUpRight } from 'react-feather'
import { chainIdAtom } from 'state/atoms'
import { Box, Flex, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { auctionSidebarAtom, TradeKind } from '../atoms'
import { ChainId } from 'utils/chains'

const getGnosisAuction = (auctionId: string, chainId: number): string => {
  if (chainId === ChainId.Mainnet) {
    return `https://gnosisauctiontestv1.netlify.app/#/auction?auctionId=${auctionId}&chainId=1`
  } else {
    return `https://easyauction.register.app/#/auction?auctionId=${auctionId}&chainId=${chainId}`
  }
}

const useColumns = (ended = false) => {
  const chainId = useAtomValue(chainIdAtom)

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
        Header: () => null,
        accessor: 'id',
        Cell: (cell: any) => {
          const setSidebar = useSetAtom(auctionSidebarAtom)
          const chainId = useAtomValue(chainIdAtom)
          const isDutch = cell.row.original.kind === TradeKind.DutchTrade
          let text = 'Auction'

          if (isDutch) {
            if (cell.row.original.isSettled) {
              text = 'View settle tx'
            } else {
              text = 'Settle'
            }
          }

          const handleClick = () => {
            if (isDutch && !cell.row.original.isSettled) {
              setSidebar(true)
            } else if (cell.row.original.isSettled) {
              window.open(
                getExplorerLink(
                  cell.row.original.settleTxHash,
                  chainId,
                  ExplorerDataType.TRANSACTION
                ),
                '_blank'
              )
            } else {
              window.open(
                getGnosisAuction(cell.row.original.auctionId, chainId),
                '_blank'
              )
            }
          }

          return (
            <Flex sx={{ justifyContent: 'right' }}>
              <SmallButton variant="muted" onClick={handleClick}>
                <Box variant="layout.verticalAlign">
                  {text}
                  <ArrowUpRight style={{ marginLeft: 10 }} size={14} />
                </Box>
              </SmallButton>
            </Flex>
          )
        },
      },
    ],
    [chainId]
  )
}

export default useColumns
