import { Trans } from '@lingui/macro'
import { Button } from 'components'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import CalculatorIcon from 'components/icons/CalculatorIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { MouseoverTooltip } from 'components/tooltip'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { ArrowRight, ChevronDown } from 'react-feather'
import { blockAtom } from 'state/atoms'
import { Box, Card, Divider, Grid, Spinner, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { DutchTrade } from 'views/auctions/atoms'

interface Props {
  data: DutchTrade
}

const AuctionItem = ({
  title,
  icon,
  symbol,
  forSymbol,
  amount,
  price,
}: {
  title: string
  icon: any
  amount: number
  symbol: string
  forSymbol?: string
  price?: number
}) => (
  <Box variant="layout.verticalAlign">
    {icon}
    <Box ml={2}>
      <Text sx={{ fontSize: 1, display: 'block' }} mb={1} variant="legend">
        {title}
      </Text>
      <Text>
        {formatCurrency(amount)} {symbol}
      </Text>
    </Box>
    {!!price && !!forSymbol && (
      <MouseoverTooltip
        text={`1 ${symbol} = ${formatCurrency(price, 5)} ${forSymbol}`}
      >
        <Box ml={3} variant="layout.verticalAlign" sx={{ cursor: 'pointer' }}>
          <CalculatorIcon />
          <ChevronDown size={14} style={{ marginTop: -3 }} />
        </Box>
      </MouseoverTooltip>
    )}
  </Box>
)

const DutchAuction = ({ data }: Props) => {
  const hasAllowance = false // TODO: Chain call for allowance
  const currentBlock = useAtomValue(blockAtom) // If this is undefined show loading for block things
  const finalPriceBlocks = 10
  const status = 0 // Track auction status if it ends
  const currentPrice = 1.123

  useEffect(() => {
    // Remove auction for atom as soon as it ends by block number or bidding
  }, [currentBlock, status])

  return (
    <Card p={2} sx={{ display: 'flex', alignItems: 'center' }} mb={3}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid sx={{ flexGrow: 1 }} columns={[2, 4]}>
          <AuctionItem
            title="Selling"
            icon={<TokenLogo width={16} symbol={data.sellingTokenSymbol} />}
            symbol={data.sellingTokenSymbol}
            amount={data.amount}
          />
          <AuctionItem
            title="Buying (current price)"
            icon={<TokenLogo width={16} symbol={data.buyingTokenSymbol} />}
            symbol={data.buyingTokenSymbol}
            forSymbol={data.sellingTokenSymbol}
            amount={data.amount * currentPrice}
            price={currentPrice}
          />
          <AuctionItem
            title="Next block bid amount"
            icon={<ArrowRight size={16} />}
            symbol={data.buyingTokenSymbol}
            forSymbol={data.sellingTokenSymbol}
            amount={data.amount * currentPrice}
            price={currentPrice}
          />
          <AuctionItem
            title="Final price"
            icon={<ArrowRight size={16} />}
            symbol={data.buyingTokenSymbol}
            forSymbol={data.sellingTokenSymbol}
            amount={data.amount * currentPrice}
            price={currentPrice}
          />
        </Grid>
        <Divider my={2} />
        <Box variant="layout.verticalAlign" sx={{ fontSize: 1 }} pr={5}>
          <Button variant="accentAction" small>
            Approve {data.buyingTokenSymbol}
          </Button>
          <Text variant="legend" sx={{ fontSize: 1 }} ml={2}>
            Prepare for bidding by approving {data.buyingTokenSymbol}
          </Text>
          <Box variant="layout.verticalAlign" ml="auto">
            <Spinner size={16} ml="auto" />
            <Text variant="legend" ml={2} mr={1}>
              <Trans>Final price in:</Trans>
            </Text>
            <Text variant="strong" mr={3}>
              x blocks
            </Text>
            <AuctionsIcon />
            <Text ml={2} mr={1}>
              Auction ends in:
            </Text>
            <Text variant="strong">123 blocks</Text>
            <Text ml={1}>(12:00:00)</Text>
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

export default DutchAuction
