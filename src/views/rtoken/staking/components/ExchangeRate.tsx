import { useAtomValue } from 'jotai'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { rateAtom, stRsrTickerAtom } from 'views/staking/atoms'

const ExchangeRate = () => {
  const ticker = useAtomValue(stRsrTickerAtom)
  const rate = useAtomValue(rateAtom)

  return (
    <Box mt={4} mb={3}>
      <Text>
        1 {ticker} = {formatCurrency(rate, 5)} RSR
      </Text>
    </Box>
  )
}

export default ExchangeRate
