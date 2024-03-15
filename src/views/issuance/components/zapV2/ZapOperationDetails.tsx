import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { useZap } from './context/ZapContext'
import { useMemo } from 'react'
import GasIcon from 'components/icons/GasIcon'

const ZapOperationDetails = () => {
  const { rTokenSymbol, rTokenPrice, selectedToken, tokenInPrice, gasCost } =
    useZap()

  const ratio = useMemo(
    () => (rTokenPrice && tokenInPrice ? rTokenPrice / tokenInPrice : 0),
    [rTokenPrice, tokenInPrice]
  )

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ justifyContent: 'space-between' }}
    >
      {selectedToken?.symbol && rTokenSymbol && ratio && (
        <Text>
          1 {selectedToken?.symbol} = {formatCurrency(+ratio, 5)} {rTokenSymbol}
        </Text>
      )}
      <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
        <GasIcon />
        <Text>
          Estimated gas cost:{' '}
          <Text sx={{ fontWeight: 700 }}>
            ${gasCost ? formatCurrency(+gasCost, 2) : 0}
          </Text>
        </Text>
      </Box>
    </Box>
  )
}

export default ZapOperationDetails
