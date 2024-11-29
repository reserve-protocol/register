import { t, Trans } from '@lingui/macro'
import Help from 'components/help'
import IconInfo from '@/components/old/info-icon'
import useRToken from 'hooks/useRToken'
import useTokenStats from 'hooks/useTokenStats'
import { useAtomValue } from 'jotai'
import {
  estimatedApyAtom,
  rTokenBackingDistributionAtom,
  rTokenConfigurationAtom,
} from 'state/atoms'
import { Box, BoxProps, Grid, Image, Text } from 'theme-ui'
import { formatCurrency, formatPercentage, parseDuration } from 'utils'

const StakingStats = (props: BoxProps) => {
  const { stakers } = useAtomValue(estimatedApyAtom)
  const distribution = useAtomValue(rTokenBackingDistributionAtom)
  const params = useAtomValue(rTokenConfigurationAtom)
  const rToken = useRToken()
  const stats = useTokenStats(rToken?.address.toLowerCase() ?? '')

  return (
    <Box {...props} variant="layout.borderBox" p={0}>
      <Grid gap={0} columns={2}>
        <Box
          p={4}
          sx={{
            borderRight: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'border',
          }}
        >
          <Box
            mb={3}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text mr={2} variant="subtitle">
              <Trans>Stake pool</Trans>
            </Text>
          </Box>
          <IconInfo
            icon={<Image src="/svgs/trendup.svg" />}
            title={t`Total RSR staked`}
            text={`${formatCurrency(stats.staked)}`}
          />
        </Box>
        <Box p={4} sx={{ borderBottom: '1px solid', borderColor: 'border' }}>
          <Box variant="layout.verticalAlign" mb={3}>
            <Text mr={2} variant="subtitle">
              <Trans>Est. Staking APY</Trans>
            </Text>
            <Help content="Manually estimated APY base on basket averaged yield, Calculation = [avgCollateralYield * rTokenMarketCap / rsrStaked]" />
          </Box>

          <IconInfo
            icon={<Image src="/svgs/trendup.svg" />}
            title={t`Current`}
            text={formatPercentage(stakers || 0)}
          />
        </Box>
        <Box p={4} sx={{ borderRight: '1px solid', borderColor: 'border' }}>
          <Text mr={2} variant="subtitle" mb={3}>
            <Trans>Unstaking Delay</Trans>
          </Text>
          <IconInfo
            icon={<Image src="/svgs/unstakingdelay.svg" />}
            title={t`Current`}
            text={parseDuration(+params?.unstakingDelay || 0)}
          />
        </Box>
        <Box p={4} sx={{ borderBottom: '1px solid', borderColor: 'border' }}>
          <Text variant="subtitle" mb={3}>
            <Trans>Backing + Staked</Trans>
          </Text>
          <IconInfo
            icon={<Image src="/svgs/staked.svg" />}
            title={t`Current`}
            text={`${
              (distribution?.backing ?? 0) + (distribution?.staked ?? 0)
            }%`}
          />
        </Box>
      </Grid>
    </Box>
  )
}

export default StakingStats
