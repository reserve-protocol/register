import { Flex, Box, Text, BoxProps } from '@theme-ui/components'
import { Card } from 'components'
import { RTokenIcon } from 'components/icons/logos'
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
      <Flex>
        <Card
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 5,
          }}
          mr={2}
        >
          <RTokenIcon style={{ marginRight: 10 }} />
          {formatCurrency(tokenBalances[rToken.token.address])}{' '}
          {rToken.token.symbol}
        </Card>
        <Card sx={{ flexGrow: 1 }} ml={2}>
          {rToken.vault.collaterals.map((collateral) => (
            <Flex key={collateral.id} sx={{ alignItems: 'center' }} p={1}>
              <RTokenIcon style={{ marginRight: 10, fontSize: 24 }} />
              <Text sx={{ fontSize: 3 }}>
                {formatCurrency(tokenBalances[collateral.token.address])}{' '}
                {collateral.token.symbol}
              </Text>
            </Flex>
          ))}
        </Card>
      </Flex>
    </Box>
  )
}

export default Balances
