import { Trans } from '@lingui/macro'
import { Card } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import TokenBalance from 'components/token-balance'
import useRToken from 'hooks/useRToken'
import useRTokenLogo from 'hooks/useRTokenLogo'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { rTokenBalanceAtom } from 'state/atoms'
import { Box, BoxProps, Divider, Grid, Text } from 'theme-ui'
import { ReserveToken, Token } from 'types'
import CollateralBalance from './CollateralBalance'
import PendingIssuances from './PendingIssuances'

interface Props extends BoxProps {
  rToken: ReserveToken
}

const CollateralBalances = ({ collaterals }: { collaterals: Token[] }) => (
  <Box p={4} mb={-2}>
    <Text variant="subtitle" mb={3}>
      <Trans>Available collateral</Trans>
    </Text>
    <Box sx={{ overflow: 'auto', maxHeight: 360 }}>
      {collaterals.map((collateral) => (
        <CollateralBalance mb={2} token={collateral} key={collateral.address} />
      ))}
    </Box>
  </Box>
)

const RTokenBalance = ({ token }: { token: Token }) => {
  const balance = useAtomValue(rTokenBalanceAtom)
  const logo = useRTokenLogo(token.address)

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>RToken In Wallet</Trans>
      </Text>
      <TokenBalance
        symbol={token.symbol}
        icon={<TokenLogo src={logo} />}
        balance={balance}
      />
    </Box>
  )
}

/**
 * Display collateral tokens balances
 */
const Balances = () => {
  const rToken = useRToken()

  if (!rToken) {
    return null
  }

  return (
    <Card p={0}>
      <Grid columns={[1, 2]} gap={0}>
        <CollateralBalances collaterals={rToken?.collaterals} />
        <Box
          sx={(theme: any) => ({
            borderLeft: ['none', `1px solid ${theme.colors.border}`],
            borderTop: [`1px solid ${theme.colors.border}`, 'none'],
          })}
        >
          <RTokenBalance token={rToken} />
          {!rToken.isRSV && (
            <>
              <Divider m={0} />
              <PendingIssuances token={rToken} />
            </>
          )}
        </Box>
      </Grid>
    </Card>
  )
}

export default Balances
