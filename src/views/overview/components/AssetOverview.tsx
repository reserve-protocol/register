import { Trans } from '@lingui/macro'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import useRToken from 'hooks/useRToken'
import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  rTokenAtom,
  rTokenCollateralDist,
  rTokenCollateralStatusAtom,
  rTokenDistributionAtom,
  rTokenPriceAtom,
} from 'state/atoms'
import { Box, Card, Flex, Grid, Text } from 'theme-ui'
import { formatCurrency, stringToColor } from 'utils'
import { COLLATERAL_STATUS } from 'utils/constants'
import RSV from 'utils/rsv'
import CollateralPieChart from './CollateralPieChart'

const colors = [
  '#B87333', // Copper
  '#8B4513', // SaddleBrown
  '#F4A460', // SandyBrown
  '#D2B48C', // Tan
  '#CD853F', // Peru
  '#556B2F', // DarkOliveGreen
  '#708090', // SlateGray
  '#8B008B', // DarkMagenta
  '#DA8A67', // Earth Yellow
  '#FFD700', // Gold
  '#B8860B', // DarkGoldenRod
  '#DEB887', // BurlyWood
]

const basketDistAtom = atom((get) => {
  const rToken = get(rTokenAtom)

  if (rToken?.isRSV) {
    return RSV.collaterals.reduce(
      (acc, current) => ({
        ...acc,
        [current.address]: {
          share: 100,
          targetUnit: 'USD',
        },
      }),
      {} as { [x: string]: { share: number; targetUnit: string } }
    )
  }

  return get(rTokenCollateralDist)
})

const getCollateralColor = (status: 0 | 1 | 2) => {
  if (status === COLLATERAL_STATUS.IFFY) {
    return 'warning'
  } else if (status === COLLATERAL_STATUS.DEFAULT) {
    return 'danger'
  }

  return 'text'
}

const AssetOverview = () => {
  const rToken = useRToken()
  const basketDist = useAtomValue(basketDistAtom)
  const distribution = useAtomValue(rTokenDistributionAtom)
  const price = useAtomValue(rTokenPriceAtom)
  const collateralStatus = useAtomValue(rTokenCollateralStatusAtom)
  const pieData = useMemo(() => {
    if (rToken?.address && basketDist && Object.keys(basketDist)) {
      return rToken.collaterals.map((c, index) => ({
        name: c.name,
        value: basketDist[c.address]?.share ?? 0,
        color: colors[index] || stringToColor(c.address),
      }))
    }

    return []
  }, [JSON.stringify(basketDist), rToken?.address])

  return (
    <Card py={5} sx={{ height: 'fit-content' }}>
      <Grid columns={[0, 2]} gap={[4, 2]}>
        <Flex
          sx={{
            textAlign: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Text>
            <Trans>Target basket of 1 {rToken?.symbol}</Trans>
          </Text>
          <Text variant="legend">${formatCurrency(price ?? 0, 5)}</Text>
          <CollateralPieChart
            mb={4}
            mt={2}
            data={pieData}
            logo={rToken?.logo ?? ''}
            isRSV={rToken?.isRSV}
            staked={distribution.staked}
          />
          <Text variant="legend">
            <Trans>Backing</Trans>
            <Box as="span" ml={2} sx={{ fontWeight: '500', color: 'text' }}>
              {rToken?.isRSV ? 100 : Math.min(100, distribution.backing)}%{' '}
            </Box>
          </Text>
          {!rToken?.isRSV && (
            <Text variant="legend">
              <Trans>Staked RSR coverage</Trans>
              <Box as="span" ml={2} sx={{ fontWeight: '500', color: 'text' }}>
                {distribution.staked}%
              </Box>
            </Text>
          )}
        </Flex>
        <Box sx={{ maxHeight: 380, overflow: 'auto' }} pr={3}>
          <Text variant="legend">
            <Trans>Primary Basket</Trans>
          </Text>
          {(rToken?.collaterals ?? []).map((c, index) => (
            <Flex
              mt={3}
              key={c.address}
              sx={{
                alignItems: 'center',
              }}
            >
              <TokenLogo width={20} symbol={c.symbol} mr={3} />
              <Box>
                <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
                  {basketDist[c.address]?.targetUnit}
                </Text>
                <Box
                  variant="layout.verticalAlign"
                  sx={{
                    color: getCollateralColor(collateralStatus[c.address]),
                  }}
                >
                  <Text>{c.symbol}</Text>
                  {!!collateralStatus[c.address] && (
                    <Help
                      ml={1}
                      content={
                        collateralStatus[c.address] === COLLATERAL_STATUS.IFFY
                          ? 'Collateral on IFFY status'
                          : 'Collateral on DEFAULT status'
                      }
                    />
                  )}
                </Box>
              </Box>
              <Text ml="auto">{basketDist[c.address]?.share || 0}%</Text>
            </Flex>
          ))}
        </Box>
      </Grid>
    </Card>
  )
}

export default AssetOverview
