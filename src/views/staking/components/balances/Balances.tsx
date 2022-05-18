import { Flex, Box, Text, BoxProps } from 'theme-ui'
import { Card } from 'components'
import { RTokenIcon } from 'components/icons/logos'
import TokenLogo from 'components/icons/TokenLogo'
import { useAtomValue } from 'jotai'
import { balancesAtom } from 'state/atoms'
import { ReserveToken } from 'types'
import { formatCurrency } from 'utils'
import { RSR } from 'utils/constants'

interface Props extends BoxProps {
  rToken: ReserveToken
}

/**
 * Display collateral tokens balances
 */
const Balances = ({ rToken, ...props }: Props) => {
  // TODO: Balances
  const tokenBalances = useAtomValue(balancesAtom)

  return (
    <Box {...props}>
      <Text variant="sectionTitle" mb={2}>
        Your balances
      </Text>
      <Card sx={{ fontSize: 20 }} p={3}>
        <Flex mb={3}>
          <TokenLogo symbol="default" style={{ marginRight: 10 }} />
          <Text>
            {formatCurrency(
              tokenBalances[rToken.insurance?.token?.address ?? '']
            )}{' '}
            {rToken.insurance?.token?.symbol}
          </Text>
        </Flex>
        <Flex>
          <TokenLogo symbol="rsr" style={{ marginRight: 10 }} />
          <Text>
            {formatCurrency(tokenBalances[RSR.address])} {RSR.symbol}
          </Text>
        </Flex>
      </Card>
    </Box>
  )
}

export default Balances
