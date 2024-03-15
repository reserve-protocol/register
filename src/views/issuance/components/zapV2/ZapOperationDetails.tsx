import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { rTokenPriceAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

const ZapOperationDetails = () => {
  const rToken = useRToken()
  const price = useAtomValue(rTokenPriceAtom)

  return (
    <Box>
      {rToken?.symbol && (
        <Text>
          1 {rToken.symbol} = {formatCurrency(+price, 2)} USD
        </Text>
      )}
    </Box>
  )
}

export default ZapOperationDetails
