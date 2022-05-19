import { Card } from 'components'
import TokenBalance from 'components/token-balance'
import { useAtomValue } from 'jotai/utils'
import { balancesAtom } from 'state/atoms'
import { Box, BoxProps, Divider, Grid, Text } from 'theme-ui'
import { Collateral, ReserveToken, Token } from 'types'
import CollateralBalance from './CollateralBalance'
import PendingIssuances from './PendingIssuances'

interface Props extends BoxProps {
  rToken: ReserveToken
}

const CollateralBalances = ({ collaterals }: { collaterals: Collateral[] }) => (
  <Box p={4}>
    <Text variant="contentTitle" sx={{ fontSize: 2 }} mb={3}>
      Available collateral
    </Text>
    {collaterals.map((collateral) => (
      <CollateralBalance mb={2} token={collateral.token} key={collateral.id} />
    ))}
  </Box>
)

const RTokenBalance = ({ token }: { token: Token }) => {
  const tokenBalances = useAtomValue(balancesAtom)

  return (
    <Box p={4} pb={2}>
      <Text variant="contentTitle" sx={{ fontSize: 2 }} mb={2}>
        RToken In Wallet
      </Text>
      <TokenBalance token={token} balance={tokenBalances[token.address]} />
    </Box>
  )
}

/**
 * Display collateral tokens balances
 */
const Balances = ({ rToken, ...props }: Props) => (
  <Box {...props}>
    <Card p={0}>
      <Grid columns={2}>
        <CollateralBalances collaterals={rToken.basket.collaterals} />
        <Box sx={{ borderLeft: '1px solid #ccc' }} ml={-2}>
          <RTokenBalance token={rToken.token} />
          <Divider />
          <PendingIssuances token={rToken.token} />
        </Box>
      </Grid>
    </Card>
  </Box>
)

export default Balances
