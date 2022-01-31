import { Flex, Box, Text, BoxProps } from '@theme-ui/components'
import { Card } from 'components'
import { RTokenIcon } from 'components/icons/logos'
import TokenLogo from 'components/icons/TokenLogo'
import { RSR } from 'constants/tokens'
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
          <TokenLogo symbol="default" />
          {formatCurrency(
            tokenBalances[rToken.insurance?.token?.address ?? '']
          )}{' '}
          {rToken.insurance?.token?.symbol}
        </Card>
        <Card
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 5,
          }}
          ml={2}
        >
          <RTokenIcon style={{ marginRight: 10 }} />
          {formatCurrency(tokenBalances[RSR.address])} {RSR.symbol}
        </Card>
      </Flex>
    </Box>
  )
}

export default Balances
