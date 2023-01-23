import { t, Trans } from '@lingui/macro'
import { InfoItem } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenParamsAtom } from 'state/atoms'
import { Card, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

/**
 * View: Settings > Display RToken contracts configuration
 */
const OtherInfo = () => {
  const params = useAtomValue(rTokenParamsAtom)

  return (
    <Card p={4}>
      <Text variant="sectionTitle" mb={5}>
        <Trans>Other Parameters</Trans>
      </Text>

      <InfoItem
        title={t`Short freeze duration (s)`}
        subtitle={params.shortFreeze}
        mb={3}
      />
      <InfoItem
        title={t`Long freeze duration (s)`}
        subtitle={params.longFreeze}
        mb={3}
      />
      <InfoItem
        title={t`Unstaking Delay (s)`}
        subtitle={params.unstakingDelay}
        mb={3}
      />
      <InfoItem
        title={t`Reward period (s)`}
        subtitle={params.rewardPeriod}
        mb={3}
      />
      <InfoItem
        title={t`Reward ratio (decimals)`}
        subtitle={params.rewardRatio}
        mb={3}
      />
      <InfoItem
        title={t`Minimum trade volume`}
        subtitle={params.minTradeVolume}
        mb={3}
      />
      <InfoItem
        title={t`RToken Maximum trade volume`}
        subtitle={formatCurrency(+params.maxTradeVolume)}
      />
    </Card>
  )
}

export default OtherInfo
