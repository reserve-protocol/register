import { Card } from 'components'
import TokenBalance from 'components/token-balance'
import { useAtomValue } from 'jotai/utils'
import { balancesAtom } from 'state/atoms'
import { Box, BoxProps, Grid, Text } from 'theme-ui'
import { ReserveToken } from 'types'
import CollateralBalance from './CollateralBalance'

interface Props extends BoxProps {
  rToken: ReserveToken
}

/**
 * Display collateral tokens balances
 */
const Balances = ({ rToken, ...props }: Props) => {
  const tokenBalances = useAtomValue(balancesAtom)

  return (
    <Box {...props}>
      <Card p={0}>
        <Grid columns={2}>
          <Box p={3}>
            <Text variant="contentTitle" sx={{ fontSize: 2 }} mb={3}>
              Available collateral
            </Text>
            {rToken.basket.collaterals.map((collateral) => (
              <CollateralBalance
                mb={2}
                token={collateral.token}
                key={collateral.id}
              />
            ))}
          </Box>
          <Box sx={{ borderLeft: '1px solid #ccc' }} p={3}>
            <Text variant="contentTitle" sx={{ fontSize: 2 }} mb={3}>
              In Wallet
            </Text>
            <TokenBalance
              token={rToken.token}
              balance={tokenBalances[rToken.token.address]}
            />
          </Box>
        </Grid>
      </Card>
    </Box>
  )
}

export default Balances
