import { Trans } from '@lingui/macro'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import useRToken from 'hooks/useRToken'
import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  rTokenAtom,
  rTokenBackingDistributionAtom,
  rTokenCollateralStatusAtom,
  rTokenPriceAtom,
} from 'state/atoms'
import { Box, Card, Flex, Grid, Text } from 'theme-ui'
import { formatCurrency, stringToColor } from 'utils'
import { COLLATERAL_STATUS } from 'utils/constants'
import RSV from 'utils/rsv'
import CollateralPieChart from './CollateralPieChart'
import cms from 'utils/cms'
import usePriceETH from 'views/home/hooks/usePriceETH'

const basketDistAtom = atom((get) => {
  const rToken = get(rTokenAtom)

  if (rToken && !rToken.main) {
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

  return get(rTokenBackingDistributionAtom)?.collateralDistribution || {}
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
  const distribution = useAtomValue(rTokenBackingDistributionAtom)
  const price = useAtomValue(rTokenPriceAtom)
  const { priceETHTerms } = usePriceETH({
    id: rToken?.address,
    chain: rToken?.chainId,
    supply: rToken?.supply,
    price,
    targetUnits: rToken?.targetUnits,
  })
  const collateralStatus = useAtomValue(rTokenCollateralStatusAtom)
  const pieData = useMemo(() => {
    if (rToken?.address && basketDist && Object.keys(basketDist)) {
      return rToken.collaterals.map((c) => {
        const cmsCollateral = cms.collaterals.find(
          (collateral) =>
            collateral.chain === rToken.chainId &&
            collateral.symbol === c.symbol
        )
        const cmsProject = cms.projects.find(
          (project) => project.name === cmsCollateral?.project
        )
        return {
          name: c.name,
          value: basketDist[c.address]?.share ?? 0,
          color: cmsCollateral?.color || stringToColor(c.address),
          project: cmsProject?.label || 'GENERIC',
          projectColor: cmsProject?.color || 'gray',
        }
      })
    }

    return []
  }, [JSON.stringify(basketDist), rToken?.address])
  const isRSV = !!rToken && !rToken.main

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
          <Text sx={{ overflow: 'hidden' }} variant="legend">
            {priceETHTerms
              ? `${priceETHTerms} ETH ($${formatCurrency(price ?? 0, 5)})`
              : `$${formatCurrency(price ?? 0, 5)}`}
          </Text>
          <Box sx={{ mx: 'auto' }}>
            <CollateralPieChart
              mb={4}
              mt={2}
              data={pieData}
              logo={rToken?.logo ?? ''}
              isRSV={isRSV}
              staked={distribution?.staked ?? 0}
              showTooltip
            />
          </Box>
          <Text variant="legend">
            <Trans>Backing</Trans>
            <Box as="span" ml={2} sx={{ fontWeight: '500', color: 'text' }}>
              {isRSV ? 100 : Math.min(100, distribution?.backing ?? 0)}%{' '}
            </Box>
          </Text>
          {!isRSV && (
            <Text variant="legend">
              <Trans>Staked RSR overcollateralization</Trans>
              <Box as="span" ml={2} sx={{ fontWeight: '500', color: 'text' }}>
                {distribution?.staked ?? 0}%
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
