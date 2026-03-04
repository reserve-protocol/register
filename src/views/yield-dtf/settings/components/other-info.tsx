import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { rTokenConfigurationAtom } from '@/state/atoms'
import { formatCurrency, parseDuration } from '@/utils'
import { InfoCard, InfoCardItem } from './settings-info-card'

const OtherInfo = () => {
  const params = useAtomValue(rTokenConfigurationAtom)

  return (
    <InfoCard title={t`Other Parameters`}>
      <InfoCardItem
        label={t`Short freeze duration`}
        value={params ? parseDuration(+params.shortFreeze) : undefined}
        border={false}
      />
      <InfoCardItem
        label={t`Long freeze duration`}
        value={params ? parseDuration(+params.longFreeze) : undefined}
      />
      <InfoCardItem
        label={t`Unstaking Delay`}
        value={params ? parseDuration(+params?.unstakingDelay) : undefined}
      />
      <InfoCardItem
        label={t`Reward ratio`}
        value={params?.rewardRatio ?? '0' + '%'}
      />
      <InfoCardItem
        label={t`Minimum trade volume`}
        value={params ? `$${formatCurrency(+params.minTrade)}` : undefined}
      />
      <InfoCardItem
        label={t`RToken Maximum trade volume`}
        value={params ? `$${formatCurrency(+params.maxTrade)}` : undefined}
      />
    </InfoCard>
  )
}

export default OtherInfo
