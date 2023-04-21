import { Trans } from '@lingui/macro'
import { Card } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import TokenBalance from 'components/token-balance'
import TrackAsset from 'components/track-asset'
import { formatUnits } from 'ethers/lib/utils'
import useRToken from 'hooks/useRToken'
import useRTokenLogo from 'hooks/useRTokenLogo'
import { atom, useAtomValue } from 'jotai'
import { rTokenBalanceAtom } from 'state/atoms'
import { tokenBalancesStore } from 'state/TokenBalancesUpdater'
import { Box, Flex, Grid, Text } from 'theme-ui'
import { Token } from 'types'
import { BI_ZERO } from 'utils/constants'
import { selectedZapTokenAtom } from '../zap/state/atoms'
import { ui, zapEnabledAtom } from '../zap/state/ui-atoms'
import CollateralBalance from './CollateralBalance'

const zapTokenBalancesAtom = atom((get) => {
  const tokens = get(ui.input.tokenSelector.tokenSelector) || []

  return tokens.reduce((acc, token) => {
    const value = formatUnits(
      get(tokenBalancesStore.getBalanceAtom(token.address.address)).value ||
        BI_ZERO,
      token.decimals
    )

    acc[token.address.address] = value

    return acc
  }, {} as { [x: string]: string })
})

const ZapTokenBalances = () => {
  const tokens = useAtomValue(ui.input.tokenSelector.tokenSelector) || []
  const selectedToken = useAtomValue(selectedZapTokenAtom)
  const balances = useAtomValue(zapTokenBalancesAtom)

  return (
    <Box>
      <Text variant="subtitle" mb={3} p={4} pb={0}>
        <Trans>Available assets</Trans>
      </Text>
      <Box sx={{ overflow: 'auto', maxHeight: 360 }} p={4} pt={0}>
        {tokens.map((token) => (
          <TokenBalance
            key={token.address.address}
            mb={2}
            symbol={token.symbol}
            balance={+balances[token.address.address] || 0}
            sx={{
              opacity:
                selectedToken?.address.address === token.address.address
                  ? 1
                  : 0.5,
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

const CollateralBalances = ({ collaterals }: { collaterals: Token[] }) => (
  <Box>
    <Text variant="subtitle" mb={3} p={4} pb={0}>
      <Trans>Available collateral</Trans>
    </Text>
    <Box sx={{ overflow: 'auto', maxHeight: 360 }} p={4} pt={0}>
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
      <Flex>
        <TokenBalance
          symbol={token.symbol}
          icon={<TokenLogo src={logo} />}
          balance={+balance.balance}
          mr={2}
        />
        <TrackAsset token={token} />
      </Flex>
    </Box>
  )
}

/**
 * Display collateral tokens balances
 */
const Balances = () => {
  const rToken = useRToken()
  const isZapEnabled = useAtomValue(zapEnabledAtom)

  if (!rToken) {
    return null
  }

  return (
    <Card p={0}>
      <Grid columns={[1, 2]} gap={0}>
        {isZapEnabled ? (
          <ZapTokenBalances />
        ) : (
          <CollateralBalances collaterals={rToken?.collaterals} />
        )}
        <Box
          sx={(theme: any) => ({
            borderLeft: ['none', `1px solid ${theme.colors.darkBorder}`],
            borderTop: [`1px solid ${theme.colors.darkBorder}`, 'none'],
          })}
        >
          <RTokenBalance token={rToken} />
        </Box>
      </Grid>
    </Card>
  )
}

export default Balances
