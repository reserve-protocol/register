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
  subtitle,
  available,
  max,
  timeUntilCharged,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  available: number
  max: number
  timeUntilCharged: number
}) => {
  return (
    <Box p={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
        {icon}
        <Text variant="h3" sx={{ fontSize: 20, fontWeight: 'bold' }}>
          {title}
        </Text>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          fontSize: 14,
        }}
      >
        <Box
          variant="layout.verticalAlign"
          sx={{ justifyContent: 'space-between', fontSize: 16 }}
          mb={2}
        >
          <Text sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            {subtitle}
          </Text>
          <Text
            sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
            color="primary"
          >
            {formatCurrency(available, 0)}
          </Text>
        </Box>
        <Box
          variant="layout.verticalAlign"
          sx={{ justifyContent: 'space-between' }}
        >
          <Text>Time until fully charged</Text>
          {timeUntilCharged > 0 ? (
            <Text sx={{ fontWeight: 'bold' }}>
              {timeUntilCharged < 1 ? '<1' : timeUntilCharged.toFixed(0)} minute
              {timeUntilCharged >= 1.5 ? 's' : ''}
            </Text>
          ) : (
            <Text sx={{ fontWeight: 'bold' }}>Fully Charged</Text>
          )}
        </Box>
        <Box
          variant="layout.verticalAlign"
          sx={{ justifyContent: 'space-between' }}
        >
          <Text>0-100% Recharge time</Text>
          <Text sx={{ fontWeight: 'bold' }}>1h</Text>
        </Box>
        <Box
          variant="layout.verticalAlign"
          sx={{ justifyContent: 'space-between' }}
        >
          <Text>Current max charge</Text>
          <Text sx={{ fontWeight: 'bold' }}>{formatCurrency(max, 0)}</Text>
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

    const roundedTimeUntilCharged = timeUntilCharged < 0 ? 0 : timeUntilCharged
    return [maxIssuanceLimit, roundedTimeUntilCharged]
  }, [
    tokenSupply,
    issuanceThrottleAmount,
    issuanceThrottleRate,
    issuanceAvailable,
  ])

  const [maxRedeem, timeUntilFullyChargedRedeem] = useMemo(() => {
    const limitByPctRate = tokenSupply * redemptionThrottleRate

    let maxRedemptionLimit
    if (redemptionThrottleAmount > limitByPctRate) {
      maxRedemptionLimit =
        tokenSupply < redemptionThrottleAmount
          ? tokenSupply
          : redemptionThrottleAmount
    } else {
      maxRedemptionLimit = limitByPctRate
    }

    const difference = maxRedemptionLimit - redemptionAvailable
    const timeUntilCharged =
      difference > 0 && maxRedemptionLimit > 0
        ? (difference / maxRedemptionLimit) * 60
        : 0

    const roundedTimeUntilCharged = timeUntilCharged < 0 ? 0 : timeUntilCharged
    return [maxRedemptionLimit, roundedTimeUntilCharged]
  }, [
    tokenSupply,
    redemptionThrottleAmount,
    redemptionThrottleRate,
    redemptionAvailable,
  ])

  return (
    <Box p={[0, 4]} pt={4} {...props}>
      <IssuanceInfoStat
        icon={<GlobalMaxMintIcon />}
        title={t`Mint - Global throttle`}
        subtitle={t`Mintable now`}
        available={issuanceAvailable}
        max={maxMint}
        timeUntilCharged={timeUntilFullyChargedMint}
      />
      <Divider my={3} sx={{ borderColor: 'borderSecondary' }} />
      <IssuanceInfoStat
        icon={<GlobalMaxRedeemIcon />}
        title={t`Redeem - Global throttle`}
        subtitle={t`Redeemable now`}
        available={redemptionAvailable}
        max={maxRedeem}
        timeUntilCharged={timeUntilFullyChargedRedeem}
      />
    </Box>
  )
}
export default IssuanceInfo
