import { t, Trans } from '@lingui/macro'
import Help from 'components/help'
import ChevronRight from 'components/icons/ChevronRight'
import CircleIcon from 'components/icons/CircleIcon'
import StakedIcon from 'components/icons/StakedIcon'
import { MouseoverTooltipContent } from 'components/tooltip'
import { ListedToken } from 'hooks/useTokenList'
import { FC, memo, useMemo, useState } from 'react'
import { Box, Button, Card, Text } from 'theme-ui'
import { stringToColor } from 'utils'
import cms from 'utils/cms'
import CollateralPieChart from 'views/overview/components/CollateralPieChart'

type Props = {
  token: ListedToken
}

const CollateralPieChartWrapper: FC<Props> = ({ token }) => {
  const [isHovered, setIsHovered] = useState(false)
  const chartData = useMemo(
    () =>
      token.collaterals.map((c) => {
        const cmsCollateral = cms.collaterals.find(
          (collateral) =>
            collateral.chain === token.chain && collateral.symbol === c.symbol
        )
        const cmsProject = cms.projects.find(
          (project) => project.name === cmsCollateral?.project
        )
        return {
          name: c.symbol,
          value:
            +token.collateralDistribution[c.id.toLowerCase()]?.dist * 100 ?? 0,
          color: cmsCollateral?.color || stringToColor(c.id),
          project: cmsProject?.label || 'GENERIC',
          projectColor: cmsProject?.color || 'gray',
        }
      }),
    []
  )

  return (
    <MouseoverTooltipContent
      content={
        <Card sx={{ width: 320, border: '1px solid black' }}>
          <Text sx={{ fontWeight: 400 }} variant="legend">
            <Trans>Network</Trans>
          </Text>
          <Text variant="legend" sx={{ fontSize: 1 }}>
            <Trans>
              The configured network is different from the wallet selected
              network. Change your network in the connected wallet.
            </Trans>
          </Text>
        </Card>
      }
    >
      <Box
        p={2}
        sx={{
          '&:hover': {
            borderRadius: '10px',
            backgroundColor: 'rgba(33, 80, 169, 0.08)',
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CollateralPieChart
          data={chartData}
          logo={token.logo}
          staked={+token.overcollaterization.toFixed(2).toString()}
          topInformation={
            isHovered ? (
              <Button
                backgroundColor="rgba(33, 80, 169, 0.08)"
                sx={{
                  borderRadius: '6px',
                  width: '100%',
                  py: 2,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(33, 80, 169, 0.16)',
                  },
                }}
              >
                <Box
                  variant="layout.verticalAlign"
                  color="rBlue"
                  sx={{ justifyContent: 'space-between' }}
                >
                  <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                    <CircleIcon color="#2150A9" />
                    <Text sx={{ fontSize: 14, lineHeight: '16px' }}>
                      {t`Full exposure view`}
                    </Text>
                  </Box>
                  <ChevronRight color="#2150A9" />
                </Box>
              </Button>
            ) : (
              <Box
                p={2}
                variant="layout.verticalAlign"
                sx={{ justifyContent: 'space-between', width: '100%' }}
              >
                <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                  <CircleIcon />
                  <Text sx={{ fontSize: 14 }}>{t`Backing`}</Text>
                </Box>
                <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
                  <Text sx={{ fontSize: 14, fontWeight: 700 }}>
                    {token.backing.toFixed(0)}%
                  </Text>
                  <ChevronRight />
                </Box>
              </Box>
            )
          }
          bottomInformation={
            <Box
              p={2}
              variant="layout.verticalAlign"
              sx={{ justifyContent: 'space-between', width: '100%' }}
            >
              <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                <StakedIcon />
                <Text sx={{ fontSize: 14 }}>{t`Stacked RSR`}</Text>
              </Box>
              <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                <Text sx={{ fontSize: 14, fontWeight: 700 }}>
                  {token.overcollaterization.toFixed(0)}%
                </Text>
                <Help
                  content={t`Staked RSR overcollateralization`}
                  color="#999999"
                />
              </Box>
            </Box>
          }
        />
      </Box>
    </MouseoverTooltipContent>
  )
}

export default memo(CollateralPieChartWrapper)
