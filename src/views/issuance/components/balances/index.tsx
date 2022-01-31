import { Flex, Box, Text, Grid, BoxProps } from '@theme-ui/components'
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
        Your balances
      </Text>
      <Grid columns={2}>
        <Card
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 5,
          }}
        >
          <TokenLogo symbol={rToken.token.symbol} mr={10} />
          {formatCurrency(tokenBalances[rToken.token.address])}{' '}
          {rToken.token.symbol}
        </Card>
        <Card>
          {rToken.vault.collaterals.map((collateral) => (
            <Flex key={collateral.id} sx={{ alignItems: 'center' }} p={1}>
              <TokenLogo
                symbol={collateral.token.symbol}
                mr={10}
                size="1.5em"
              />
              <Text sx={{ fontSize: 3 }}>
                {formatCurrency(tokenBalances[collateral.token.address])}{' '}
                {collateral.token.symbol}
              </Text>
            </Flex>
          ))}
        </Card>
      </Grid>
    </Box>
  )
}

export default Balances
