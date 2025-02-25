import CalculatorIcon from 'components/icons/CalculatorIcon'
import { MouseoverTooltip } from '@/components/old/tooltip'
import { ChevronDown } from 'lucide-react'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

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
        {formatCurrency(amount, 5)} {symbol}
      </Text>
    </Box>
    {!!price && !!forSymbol && (
      <MouseoverTooltip
        text={`1 ${forSymbol} = ${formatCurrency(price, 3)} ${symbol}`}
      >
        <Box ml={3} variant="layout.verticalAlign" sx={{ cursor: 'pointer' }}>
          <CalculatorIcon />
          <ChevronDown size={14} style={{ marginTop: -3 }} />
        </Box>
      </MouseoverTooltip>
    )}
  </Box>
)

export default AuctionItem
