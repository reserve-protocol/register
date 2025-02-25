import { t, Trans } from '@lingui/macro'
import { InfoItem } from '@/components/old/info-box'
import { useAtomValue } from 'jotai'
import { rTokenConfigurationAtom } from 'state/atoms'
import { Card, Divider, Text } from 'theme-ui'
import { formatCurrency, parseDuration } from 'utils'

/**
 * View: Settings > Display RToken contracts configuration
 */
const OtherInfo = () => {
  const params = useAtomValue(rTokenConfigurationAtom)

  return (
    <Card p={4}>
      <Text variant="title">
        <Trans>Other Parameters</Trans>
      </Text>
      <Divider mx={-4} my={4} sx={{ borderColor: 'darkBorder' }} />
      <InfoItem
        title={t`Short freeze duration`}
        subtitle={params ? parseDuration(+params.shortFreeze) : 'Loading...'}
        mb={3}
      />
      <InfoItem
        title={t`Long freeze duration`}
        subtitle={params ? parseDuration(+params.longFreeze) : 'Loading...'}
        mb={3}
      />
      <InfoItem
        title={t`Unstaking Delay`}
        subtitle={
          params ? parseDuration(+params?.unstakingDelay) : 'Loading...'
        }
        mb={3}
      />
      <InfoItem
        title={t`Reward ratio`}
        subtitle={params?.rewardRatio ?? '0' + '%'}
        mb={3}
      />
      <InfoItem
        title={t`Minimum trade volume`}
        subtitle={params ? `$${formatCurrency(+params.minTrade)}` : 'Loading'}
        mb={3}
      />
      <InfoItem
        title={t`RToken Maximum trade volume`}
        subtitle={params ? `$${formatCurrency(+params.maxTrade)}` : 'Loading'}
      />
    </Card>
  )
}

export default OtherInfo
