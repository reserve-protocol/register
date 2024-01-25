import { t } from '@lingui/macro'
import { Button } from 'components'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import CirclesIcon from 'components/icons/CirclesIcon'
import PlatformExposureIcon from 'components/icons/PlatformExposureIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { ListedToken } from 'hooks/useTokenList'
import { useAtomValue } from 'jotai'
import { FC, memo, useMemo } from 'react'
import { rsrPriceAtom } from 'state/atoms'
import { Box, Card, Divider, Grid, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import cms from 'utils/cms'

type ItemProps = {
  logo: string
  name: string
  value: number
}

type CollateralPieChartTooltipProps = {
  token: ListedToken
}

const Item: FC<ItemProps> = ({ logo, name, value }) => {
  return (
    <Box
      sx={{
        backgroundColor: ['inputBorder', '#F2F2F2'],
        color: '#333333',
        px: 2,
        py: '6px',
        borderRadius: '6px',
        width: '100%',
      }}
    >
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'space-between', gap: 2, width: '100%' }}
      >
        <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
          <TokenLogo width={16} src={logo} />
          <Text sx={{ fontSize: 14, fontWeight: 600 }}>{name}</Text>
        </Box>
        <Text sx={{ fontSize: 14 }}>{value.toFixed(0)}%</Text>
      </Box>
    </Box>
  )
}

const CollateralPieChartTooltip: FC<CollateralPieChartTooltipProps> = ({
  token,
}) => {
  const rsrPrice = useAtomValue(rsrPriceAtom)

  const rsrUSD = useMemo(
    () => formatCurrency(token.rsrStaked * rsrPrice, 0),
    [rsrPrice, token]
  )

  // const chartData = useMemo(
  //   () =>
  //     token.collaterals.map((c) => {
  //       const cmsCollateral = cms.collaterals.find(
  //         (collateral) =>
  //           collateral.chain === token.chain && collateral.symbol === c.symbol
  //       )
  //       const cmsProject = cms.projects.find(
  //         (project) => project.name === cmsCollateral?.project
  //       )
  //       return {
  //         name: c.symbol,
  //         value:
  //           +token.collateralDistribution[c.id.toLowerCase()]?.dist * 100 ?? 0,
  //         project: cmsProject?.label || 'GENERIC',
  //       }
  //     }),
  //   []
  // )

  const collateralItems = [
    {
      name: 'aUSDC',
      logo: '/svgs/saUSDC.svg',
      value: 25,
    },
    {
      name: 'aUSDT',
      logo: '/svgs/saUSDT.svg',
      value: 25,
    },
    {
      name: 'cUSDC',
      logo: '/svgs/cUSDC.svg',
      value: 25,
    },
    {
      name: 'cUSDT',
      logo: '/svgs/cUSDT.svg',
      value: 25,
    },
  ]
  const tokenItems = [
    {
      name: 'USDC',
      logo: '/svgs/USDC.svg',
      value: 50,
    },
    {
      name: 'USDT',
      logo: '/svgs/USDT.svg',
      value: 50,
    },
  ]
  const platformItems = [
    {
      name: 'Compund',
      logo: '/svgs/compound.svg',
      value: 50,
    },
    {
      name: 'AAVE',
      logo: '/svgs/aave.svg',
      value: 50,
    },
  ]

  return (
    <Card
      variant="layout.centered"
      sx={{
        width: ['100%', 350],
        p: [0, 3],
        gap: 3,
        borderRadius: '14px',
        backgroundColor: ['contentBackground', 'background'],
        alignItems: 'start',
        boxShadow: ['none', '0px 10px 45px 6px rgba(0, 0, 0, 0.10)'],
      }}
    >
      <Box
        variant="layout.centered"
        sx={{ gap: 2, alignItems: 'start', width: '100%' }}
      >
        <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
          <BasketCubeIcon width={17} height={17} />
          <Text sx={{ fontSize: 14 }}>{t`Collateral(s)`}</Text>
        </Box>
        <Grid columns={2} gap={2} sx={{ width: '100%' }}>
          {collateralItems.map((item) => (
            <Item key={item.name} {...item} />
          ))}
        </Grid>
      </Box>
      <Box
        variant="layout.centered"
        sx={{ gap: 2, alignItems: 'start', width: '100%' }}
      >
        <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
          <CirclesIcon
            color="#333333"
            width={13}
            height={13}
            style={{ marginLeft: '3px' }}
          />
          <Text sx={{ fontSize: 14 }}>{t`Token exposure`}</Text>
        </Box>
        <Grid columns={2} gap={2} sx={{ width: '100%' }}>
          {tokenItems.map((item) => (
            <Item key={item.name} {...item} />
          ))}
        </Grid>
      </Box>
      <Box
        variant="layout.centered"
        sx={{ gap: 2, alignItems: 'start', width: '100%' }}
      >
        <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
          <PlatformExposureIcon />
          <Text sx={{ fontSize: 14 }}>{t`Platform exposure`}</Text>
        </Box>
        <Grid columns={2} gap={2} sx={{ width: '100%' }}>
          {platformItems.map((item) => (
            <Item key={item.name} {...item} />
          ))}
        </Grid>
      </Box>
      <Divider sx={{ borderColor: 'border', width: '100%', my: 0 }} />
      <Box
        variant="layout.verticalAlign"
        sx={{ gap: 2, justifyContent: 'space-between', width: '100%' }}
      >
        <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
          <TokenLogo width={16} src="/svgs/rsr.svg" />
          <Box variant="layout.centered" sx={{ alignItems: 'start' }}>
            <Text sx={{ fontSize: 14 }}>
              {t`Staked RSR Overcollateralisation`}
            </Text>
            <Text sx={{ fontWeight: 500 }}>
              {token.overcollaterization.toFixed(0)}%
            </Text>
          </Box>
        </Box>
        <Text sx={{ fontSize: 14, color: '#666666' }}>${rsrUSD}</Text>
      </Box>
    </Card>
  )
}

export default memo(CollateralPieChartTooltip)
