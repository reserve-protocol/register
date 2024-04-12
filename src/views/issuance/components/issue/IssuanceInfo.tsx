import { t } from '@lingui/macro'
import Help from 'components/help'
import GlobalMaxMintIcon from 'components/icons/GlobalMaxMintIcon'
import GlobalMaxRedeemIcon from 'components/icons/GlobalMaxRedeemIcon'
import useRToken from 'hooks/useRToken'
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
  tooltipContent,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  available: number
  max: number
  timeUntilCharged: number
  tooltipContent: ReactNode
}) => {
  const rToken = useRToken()

  return (
    <Box p={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
        {icon}
        <Text variant="h3" sx={{ fontSize: 18, fontWeight: 'bold' }}>
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
          <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
            <Text
              sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
              color="primary"
            >
              {formatCurrency(available, 0)}
            </Text>
            <Text sx={{ fontSize: 14 }}>{rToken?.symbol}</Text>
          </Box>
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
          <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
            <Text>Current max charge</Text>
            <Help
              content={tooltipContent}
              placement="bottom"
              sx={{ mt: '2px' }}
            />
          </Box>
          <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
            <Text sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              {formatCurrency(max, 0)}
            </Text>
            <Text sx={{ fontSize: 14 }}>{rToken?.symbol}</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const IssuanceInfo = (props: BoxProps) => {
  const rToken = useRToken()
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
        icon={<GlobalMaxMintIcon width={20} height={20} />}
        title={t`Mint - Global throttle`}
        subtitle={t`Mintable now`}
        available={issuanceAvailable}
        max={maxMint}
        timeUntilCharged={timeUntilFullyChargedMint}
        tooltipContent={
          <Text sx={{ fontSize: 14 }}>
            The mint max charge is either{' '}
            {(issuanceThrottleRate * 100).toFixed(1)}% of {rToken?.symbol}{' '}
            supply or a lower bound of{' '}
            <Text sx={{ fontWeight: 'bold' }}>
              {formatCurrency(issuanceThrottleAmount, 0)}
            </Text>{' '}
            {rToken?.symbol}, whichever is the higher amount.
          </Text>
        }
      />
      <Divider my={3} sx={{ borderColor: 'borderSecondary' }} />
      <IssuanceInfoStat
        icon={<GlobalMaxRedeemIcon width={20} height={20} />}
        title={t`Redeem - Global throttle`}
        subtitle={t`Redeemable now`}
        available={redemptionAvailable}
        max={maxRedeem}
        timeUntilCharged={timeUntilFullyChargedRedeem}
        tooltipContent={
          <Text sx={{ fontSize: 14 }}>
            The redeem max charge is either{' '}
            {(redemptionThrottleRate * 100).toFixed(1)}% of {rToken?.symbol}{' '}
            supply or a lower bound of{' '}
            <Text sx={{ fontWeight: 'bold' }}>
              {formatCurrency(redemptionThrottleAmount, 0)}
            </Text>{' '}
            {rToken?.symbol}, whichever is the higher amount. If that exceeds
            the total supply, the limit is set to the total supply of{' '}
            {rToken?.symbol}.
          </Text>
        }
      />
    </Box>
  )
}
export default IssuanceInfo
