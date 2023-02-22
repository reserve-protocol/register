import { t, Trans } from '@lingui/macro'
import { InfoItem } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenParamsAtom } from 'state/atoms'
import { Card, Text, Divider } from 'theme-ui'
import { formatCurrency } from 'utils'

/**
 * View: Settings > Display RToken contracts configuration
 */
const OtherInfo = () => {
  const params = useAtomValue(rTokenParamsAtom)

  return (
    <Card p={4}>
      <Text variant="sectionTitle">
        <Trans>Other Parameters</Trans>
      </Text>
      <Divider mx={-4} my={4} sx={{ borderColor: 'darkBorder' }} />
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
        title={t`Reward ratio (decimals)`}
        subtitle={params.rewardRatio}
        mb={3}
      />
      <InfoItem
        title={t`Minimum trade volume`}
        subtitle={params.minTrade}
        mb={3}
      />
      <InfoItem
        title={t`RToken Maximum trade volume`}
        subtitle={formatCurrency(+params.minTrade)}
      />
    </Card>
  )
}

export default OtherInfo
