import { t } from '@lingui/macro'
import ChevronRight from 'components/icons/ChevronRight'
import CircleIcon from 'components/icons/CircleIcon'
import { MouseoverTooltipContent } from '@/components/old/tooltip'
import { ListedToken } from 'hooks/useTokenList'
import { FC, memo, useMemo, useState } from 'react'
import { Box, Button, Text } from 'theme-ui'
import { stringToColor } from 'utils'
import CollateralPieChartTooltip from './CollateralPieChartTooltip'
import HelpIcon from 'components/icons/HelpIcon'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import { useAtomValue } from 'jotai'
import { collateralsMetadataAtom } from 'state/cms/atoms'
import CollateralPieChart from './CollateralPieChart'

type Props = {
  token: ListedToken
}

const CollateralPieChartWrapper: FC<Props> = ({ token }) => {
  const [isHovered, setIsHovered] = useState(false)
  const metadata = useAtomValue(collateralsMetadataAtom)

  const chartData = useMemo(
    () =>
      token.collaterals.map((c) => {
        const cmsCollateral =
          metadata?.[c.symbol.toLowerCase().replace('-vault', '')]
        return {
          name: c.symbol,
          value:
            +(token.collateralDistribution[c.id.toLowerCase()]?.dist ?? 0) *
            100,
          color: cmsCollateral?.color || stringToColor(c.id),
          project: cmsCollateral?.protocol?.name || 'GENERIC',
          projectColor: cmsCollateral?.protocol?.color || 'gray',
        }
      }),
    []
  )

  return (
    <MouseoverTooltipContent
      content={<CollateralPieChartTooltip token={token} />}
    >
      <Box
        p={2}
        sx={{
          transition: 'background-color 0.3s ease, border-radius 0.3s ease',
          '&:hover': {
            borderRadius: '10px',
            backgroundColor: 'backgroundNested',
            cursor: 'pointer',
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
            <Box
              sx={{
                position: 'relative',
                width: '100%',
              }}
            >
              {/* To preserve space */}
              <Box
                sx={{
                  visibility: 'hidden',
                  height: '32px',
                }}
              />
              <Button
                backgroundColor="inputBorder"
                sx={{
                  borderRadius: '6px',
                  width: '100%',
                  py: 2,
                  px: 2,
                  '&:hover': {
                    backgroundColor: '#F9F9F9',
                  },
                  // opacity: isHovered ? 1 : 0,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 1,
                }}
              >
                <Box
                  variant="layout.verticalAlign"
                  color="text"
                  sx={{
                    justifyContent: 'space-between',
                  }}
                >
                  <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                    <CircleIcon />
                    <Text
                      sx={{ fontSize: 14, lineHeight: '16px', fontWeight: 700 }}
                    >
                      {t`Full exposure view`}
                    </Text>
                  </Box>
                  <ChevronRight />
                </Box>
              </Button>
              <Box
                p={2}
                variant="layout.verticalAlign"
                sx={{
                  justifyContent: 'space-between',
                  width: '100%',
                  position: 'absolute',
                  // opacity: isHovered ? 0 : 1,
                  opacity: 1,
                  transition: 'opacity 0.3s ease',
                  top: 0,
                  left: 0,
                  gap: 2,
                  backgroundColor: token.isCollaterized
                    ? 'none'
                    : 'borderSecondary',
                  borderRadius: '6px',
                }}
              >
                <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                  <CircleIcon color="currentColor" />
                  {token.isCollaterized ? (
                    <Text sx={{ fontSize: 14 }}>{t`Backing`}</Text>
                  ) : (
                    <Text
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      Rebalancing
                    </Text>
                  )}
                </Box>
                <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
                  {token.isCollaterized && (
                    <Text sx={{ fontSize: 14, fontWeight: 700 }}>
                      {token.backing.toFixed(0)}%
                    </Text>
                  )}
                  <ChevronRight color="currentColor" />
                </Box>
              </Box>
            </Box>
          }
          bottomInformation={
            <Box
              p={2}
              variant="layout.verticalAlign"
              sx={{ justifyContent: 'space-between', width: '100%' }}
            >
              <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                <CollaterizationIcon />
                <Text sx={{ fontSize: 14 }}>{t`Staked RSR`}</Text>
              </Box>
              <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                <Text sx={{ fontSize: 14, fontWeight: 700 }}>
                  {token.overcollaterization.toFixed(0)}%
                </Text>
                <HelpIcon color="#999999" />
              </Box>
            </Box>
          }
          isRebalancing={!token.isCollaterized}
        />
      </Box>
    </MouseoverTooltipContent>
  )
}

export default memo(CollateralPieChartWrapper)
