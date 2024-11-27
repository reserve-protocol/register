import { t } from '@lingui/macro'
import { SmallButton } from 'components/button'
import TokenItem from 'components/token-item'
import dayjs from 'dayjs'
import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { ArrowUpRight } from 'react-feather'
import { chainIdAtom } from 'state/atoms'
import { Box, Flex, Text } from 'theme-ui'
import { formatCurrency, formatCurrencyCell } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { auctionSidebarAtom, Trade, TradeKind } from '../atoms'
import { ChainId } from 'utils/chains'
import { createColumnHelper } from '@tanstack/react-table'
import { DutchTrade } from '../dutch/atoms'

const getGnosisAuction = (auctionId: string, chainId: number): string => {
  if (chainId === ChainId.Mainnet) {
    return `https://gnosis-auction.eth.link/#/auction?auctionId=${auctionId}&chainId=1`
  } else {
    return `https://easyauction.reserve.org/#/auction?auctionId=${auctionId}&chainId=${chainId}`
  }
}

const useColumns = (ended = false) => {
  const chainId = useAtomValue(chainIdAtom)
  const columnHelper = createColumnHelper<DutchTrade>()

  return useMemo(
    () => [
      columnHelper.accessor('sellingTokenSymbol', {
        header: ended ? t`Sold` : t`Selling`,
        cell: (data) => <TokenItem symbol={data.getValue()} />,
      }),
      columnHelper.accessor('buyingTokenSymbol', {
        header: ended ? t`Bought` : t`Buying`,
        cell: (data) => <TokenItem symbol={data.getValue()} />,
      }),
      columnHelper.accessor('amount', {
        header: t`Amount`,
        cell: (data) => (
          <Text>
            {formatCurrency(data.getValue())}{' '}
            {data.row.original.sellingTokenSymbol}
          </Text>
        ),
      }),
      columnHelper.accessor('worstCasePrice', {
        header: t`Worst price`,
        cell: formatCurrencyCell,
      }),
      columnHelper.accessor('endAt', {
        header: ended ? t`Ended at` : t`Ends at`,
        cell: (data) => (
          <Text>{dayjs(+data.getValue() * 1000).format('YYYY-M-D HH:mm')}</Text>
        ),
      }),
      columnHelper.accessor('id', {
        header: '',
        cell: (data) => {
          const setSidebar = useSetAtom(auctionSidebarAtom)
          const chainId = useAtomValue(chainIdAtom)
          const isDutch = data.row.original.kind === TradeKind.DutchTrade
          let text = 'Auction'

          if (isDutch) {
            if (data.row.original.isSettled) {
              text = 'View settle tx'
            } else {
              text = 'Settle'
            }
          }

          const handleClick = () => {
            if (isDutch && !data.row.original.isSettled) {
              setSidebar(true)
            } else if (
              data.row.original.isSettled &&
              data.row.original.settleTxHash
            ) {
              window.open(
                getExplorerLink(
                  data.row.original.settleTxHash,
                  chainId,
                  ExplorerDataType.TRANSACTION
                ),
                '_blank'
              )
            } else if (data.row.original.auctionId) {
              window.open(
                getGnosisAuction(
                  data.row.original.auctionId.toString(),
                  chainId
                ),
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
      }),
    ],
    [chainId]
  )
}

export default useColumns
