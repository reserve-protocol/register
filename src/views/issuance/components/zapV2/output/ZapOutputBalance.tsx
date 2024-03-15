import TokenLogo from 'components/icons/TokenLogo'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'

const ZapOutputBalance = () => {
  const { rTokenSymbol, rTokenBalance } = useZap()

  return (
    <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
      {rTokenSymbol && <TokenLogo symbol={rTokenSymbol} />}
      <Box>
        <Text>Balance </Text>
        {rTokenBalance && (
          <Text sx={{ fontWeight: 'bold' }}>
            {formatCurrency(+rTokenBalance, 5)}
          </Text>
        )}
      </Box>
    </Box>
  )
}

export default ZapOutputBalance
