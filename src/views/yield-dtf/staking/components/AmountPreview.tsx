import TokenLogo from 'components/icons/TokenLogo'
import { Box, BoxProps, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

interface IAmountPreview extends BoxProps {
  title: string
  amount: number
  usdAmount: number
  symbol: string
  src?: string
}

const AmountPreview = ({
  title,
  amount,
  usdAmount,
  symbol,
  src,
  ...props
}: IAmountPreview) => (
  <Box variant="layout.verticalAlign" {...props}>
    <TokenLogo symbol={symbol} width={24} src={src} />
    <Box ml="3">
      <Text variant="legend">{title}</Text>
      <Text variant="sectionTitle">
        {formatCurrency(amount, 5)} {symbol}
      </Text>
      <Text variant="legend">${formatCurrency(usdAmount, 2)}</Text>
    </Box>
  </Box>
)

export default AmountPreview
