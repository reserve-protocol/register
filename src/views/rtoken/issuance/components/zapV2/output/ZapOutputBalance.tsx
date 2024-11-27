import TokenLogo from 'components/icons/TokenLogo'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'

const ZapOutputBalance = () => {
  const { tokenOut, operation } = useZap()

  return (
    <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
      {operation === 'mint' && <TokenLogo symbol={tokenOut.symbol} />}
      <Box>
        <Text>Balance </Text>
        {tokenOut.balance && (
          <Text sx={{ fontWeight: 'bold' }}>
            {formatCurrency(+tokenOut.balance, 2, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </Text>
        )}
      </Box>
    </Box>
  )
}

export default ZapOutputBalance
