import { t } from '@lingui/macro'
import GlobalMaxMintIcon from 'components/icons/GlobalMaxMintIcon'
import GlobalMaxRedeemIcon from 'components/icons/GlobalMaxRedeemIcon'
import { useAtomValue } from 'jotai'
import { ReactNode, useMemo } from 'react'
import { rTokenStateAtom } from 'state/atoms'
import { Box, BoxProps, Divider, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

const IssuanceInfoStat = ({
  icon,
  title,
  available,
  max,
  timeUntilCharged,
}: {
  icon: ReactNode
  title: string
  available: number
  max: number
  timeUntilCharged: number
}) => {
  return (
    <Box p={4} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
        {icon}
        <Text variant="sectionTitle">{title}</Text>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          variant="layout.verticalAlign"
          sx={{ justifyContent: 'space-between' }}
        >
          <Text>
            Available
            <Text variant="legend"> / Max Charge</Text>
          </Text>
          <Text sx={{ fontWeight: 'bold' }}>
            {formatCurrency(available, 0)}{' '}
            <Text variant="legend" sx={{ fontWeight: 'normal' }}>
              / {formatCurrency(max, 0)}
            </Text>
          </Text>
        </Box>
        <Box
          variant="layout.verticalAlign"
          sx={{ justifyContent: 'space-between' }}
        >
          <Text>Time until fully charged</Text>
          {timeUntilCharged > 0 ? (
            <Text>
              {timeUntilCharged} minute{timeUntilCharged > 1 ? 's' : ''}
            </Text>
          ) : (
            <Text sx={{ fontWeight: 'bold' }}>Fully Charged</Text>
          )}
        </Box>
      </Box>
    </Box>
  )
}

const IssuanceInfo = (props: BoxProps) => {
  const {
    tokenSupply,
    issuanceAvailable,
    issuanceThrottleAmount,
    issuanceThrottleRate,
    redemptionAvailable,
    redemptionThrottleAmount,
    redemptionThrottleRate,
  } = useAtomValue(rTokenStateAtom)

  const [maxMint, timeUntilFullyChargedMint] = useMemo(() => {
    const limitByPctRate = tokenSupply * issuanceThrottleRate
    const maxIssuanceLimit = Math.max(issuanceThrottleAmount, limitByPctRate)

    const difference = maxIssuanceLimit - issuanceAvailable
    const timeUntilCharged =
      difference > 0 && maxIssuanceLimit > 0
        ? (difference / maxIssuanceLimit) * 60
        : 0

    const roundedTimeUntilCharged = timeUntilCharged < 1 ? 0 : timeUntilCharged
    return [maxIssuanceLimit, roundedTimeUntilCharged]
  }, [
    tokenSupply,
    issuanceThrottleAmount,
    issuanceThrottleRate,
    issuanceAvailable,
  ])

  const [maxRedeem, timeUntilFullyChargedRedeem] = useMemo(() => {
    const limitByPctRate = tokenSupply * redemptionThrottleRate
    const maxRedemptionLimit = Math.max(
      redemptionThrottleAmount,
      limitByPctRate
    )

    const difference = maxRedemptionLimit - redemptionAvailable
    const timeUntilCharged =
      difference > 0 && maxRedemptionLimit > 0
        ? (difference / maxRedemptionLimit) * 60
        : 0

    const roundedTimeUntilCharged = timeUntilCharged < 1 ? 0 : timeUntilCharged
    return [maxRedemptionLimit, roundedTimeUntilCharged]
  }, [
    tokenSupply,
    redemptionThrottleAmount,
    redemptionThrottleRate,
    redemptionAvailable,
  ])

  return (
    <Box
      p={4}
      {...props}
      sx={{
        borderLeft: ['none', 'none', '1px solid'],
        borderColor: ['border', 'border', 'border'],
        minHeight: ['auto', 'auto', 'calc(100vh - 72px)'],
      }}
    >
      <IssuanceInfoStat
        icon={<GlobalMaxMintIcon />}
        title={t`Mint - Global Max`}
        available={issuanceAvailable}
        max={maxMint}
        timeUntilCharged={timeUntilFullyChargedMint}
      />
      <Divider my={3} sx={{ borderColor: 'borderSecondary' }} />
      <IssuanceInfoStat
        icon={<GlobalMaxRedeemIcon />}
        title={t`Redeem - Global Max`}
        available={redemptionAvailable}
        max={maxRedeem}
        timeUntilCharged={timeUntilFullyChargedRedeem}
      />
    </Box>
  )
}
export default IssuanceInfo
