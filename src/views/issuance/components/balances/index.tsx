import { Flex, Box, Text, BoxProps, Divider } from '@theme-ui/components'
import { Card } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { useAppSelector } from 'state/hooks'
import { ReserveToken } from 'types'
import { formatCurrency } from 'utils'

interface Props extends BoxProps {
  rToken: ReserveToken
}

/**
 * Display collateral tokens balances
 */
const Balances = ({ rToken, ...props }: Props) => {
  const tokenBalances = useAppSelector((state) => state.reserveTokens.balances)

  return (
    <Box {...props}>
      <Text variant="sectionTitle" mb={2}>
        Your balance
      </Text>
      <Card p={3}>
        <Flex sx={{ alignItems: 'center', fontSize: 3, padding: 3 }}>
          <TokenLogo symbol={rToken.token.symbol} size="1.2em" mr={10} />
          <Text>
            {formatCurrency(tokenBalances[rToken.token.address])}{' '}
            {rToken.token.symbol}
          </Text>
        </Flex>
        <Divider sx={{ borderColor: '#DFDFDF' }} />
        <Box p={3}>
          <Text variant="contentTitle" sx={{ fontSize: 2 }} mb={3}>
            Your collateral balance
          </Text>
          {rToken.basket.collaterals.map((collateral) => (
            <Flex
              key={collateral.id}
              sx={{ alignItems: 'flex-start', marginBottom: 2 }}
            >
              <TokenLogo
                sx={{ marginTop: '4px', marginRight: '5px' }}
                symbol={collateral.token.symbol}
              />
              <div>
                <Text variant="contentTitle">{collateral.token.symbol}</Text>
                <Text>
                  {formatCurrency(tokenBalances[collateral.token.address])}{' '}
                </Text>
              </div>
            </Flex>
          ))}
        </Box>
      </Card>
    </Box>
  )
}

export default Balances
