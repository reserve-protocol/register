import { Card } from 'components'
import TokenBalance from 'components/token-balance'
import { useAtomValue } from 'jotai/utils'
import { rTokenBalanceAtom } from 'state/atoms'
import { Box, BoxProps, Divider, Grid, Text } from 'theme-ui'
import { ReserveToken, Token } from 'types'
import CollateralBalance from './CollateralBalance'
import PendingIssuances from './PendingIssuances'

interface Props extends BoxProps {
  rToken: ReserveToken
}

const CollateralBalances = ({ collaterals }: { collaterals: Token[] }) => (
  <Box p={4} mb={-2} sx={{ overflowX: 'auto' }}>
    <Text variant="subtitle" mb={2}>
      Available collateral
    </Text>
    {collaterals.map((collateral) => (
      <CollateralBalance mb={2} token={collateral} key={collateral.address} />
    ))}
  </Box>
)

const RTokenBalance = ({ token }: { token: Token }) => {
  const balance = useAtomValue(rTokenBalanceAtom)

  return (
    <Box p={4} pb={2}>
      <Text variant="subtitle" mb={2}>
        RToken In Wallet
      </Text>
      <TokenBalance symbol={token.symbol} balance={balance} />
    </Box>
  )
}

/**
 * Display collateral tokens balances
 */
const Balances = ({ rToken, ...props }: Props) => (
  <Card p={0} {...props}>
    <Grid columns={[1, 2]} gap={0}>
      <CollateralBalances collaterals={rToken.collaterals} />
      <Box
        sx={(theme: any) => ({
          borderLeft: ['none', `1px solid ${theme.colors.border}`],
          borderTop: [`1px solid ${theme.colors.border}`, 'none'],
        })}
      >
        <RTokenBalance token={rToken} />
        {!rToken.isRSV && (
          <>
            <Divider />
            <PendingIssuances token={rToken} />
          </>
        )}
      </Box>
    </Grid>
  </Card>
)

export default Balances
