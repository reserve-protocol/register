import { Trans } from '@lingui/macro'
import { Card } from 'components'
import TokenBalance from 'components/token-balance'
import TrackAsset from 'components/track-asset'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { rTokenBalanceAtom } from 'state/atoms'
import { Box, Flex, Grid, Spinner, Text } from 'theme-ui'
import { ui } from '../zap/state/ui-atoms'
import CollateralBalance from './CollateralBalance'
import ZapAssetsBalances from './ZapAssetsBalance'

const CollateralBalances = () => {
  const rToken = useRToken()

  return (
    <Box>
      <Text variant="subtitle" mb={3} p={4} pb={0}>
        <Trans>Available collateral</Trans>
      </Text>
      <Box sx={{ overflow: 'auto', maxHeight: 360 }} p={4} pt={0}>
        {!rToken?.collaterals && <Spinner size={18} />}
        {rToken?.collaterals.map((collateral) => (
          <CollateralBalance
            mb={2}
            token={collateral}
            key={collateral.address}
          />
        ))}
      </Box>
    </Box>
  )
}

const RTokenBalance = () => {
  const rToken = useRToken()
  const balance = useAtomValue(rTokenBalanceAtom)

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>RToken In Wallet</Trans>
      </Text>
      <Flex>
        <TokenBalance
          symbol={rToken?.symbol}
          balance={+balance.balance}
          mr={2}
        />
        {!!rToken && <TrackAsset token={rToken} />}
      </Flex>
    </Box>
  )
}

/**
 * Display collateral tokens balances
 */
const Balances = () => {
  const isZapEnabled = useAtomValue(ui.zapWidgetEnabled)

  return (
    <Card p={0}>
      <Grid columns={[1, 2]} gap={0}>
        {isZapEnabled ? <ZapAssetsBalances /> : <CollateralBalances />}
        <Box
          sx={(theme: any) => ({
            borderLeft: ['none', `1px solid ${theme.colors.darkBorder}`],
            borderTop: [`1px solid ${theme.colors.darkBorder}`, 'none'],
          })}
        >
          <RTokenBalance />
        </Box>
      </Grid>
    </Card>
  )
}

export default Balances
