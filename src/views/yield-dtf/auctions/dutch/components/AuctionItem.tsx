import CalculatorIcon from 'components/icons/CalculatorIcon'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Box ml={3} variant="layout.verticalAlign" sx={{ cursor: 'pointer' }}>
            <CalculatorIcon />
            <ChevronDown size={14} style={{ marginTop: -3 }} />
          </Box>
        </TooltipTrigger>
        <TooltipContent>
          {`1 ${forSymbol} = ${formatCurrency(price, 3)} ${symbol}`}
        </TooltipContent>
      </Tooltip>
    )}
  </Box>
)

export default AuctionItem
