import { t, Trans } from '@lingui/macro'
import useRToken from '@/hooks/useRToken'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom } from '@/state/atoms'
import { shortenAddress } from '@/utils'
import { InfoCard, InfoCardItem } from './settings-info-card'

const BasicInfo = () => {
  const rToken = useRToken()
  const { governor, timelock } = useAtomValue(rTokenGovernanceAtom)

  return (
    <InfoCard title={t`Token Details`}>
      <InfoCardItem
        label={t`Name`}
        value={rToken?.name}
        border={false}
      />
      <InfoCardItem label={t`Symbol`} value={rToken?.symbol} />
      <InfoCardItem label={t`Mandate`} value={rToken?.mandate} bold={false} />
      <InfoCardItem
        label={t`RToken Address`}
        value={shortenAddress(rToken?.address ?? '')}
        address={rToken?.address}
      />
      <InfoCardItem
        label={rToken?.stToken?.name || 'stRSR'}
        value={shortenAddress(rToken?.stToken?.address ?? '')}
        address={rToken?.stToken?.address ?? ''}
      />
      <InfoCardItem
        label={t`Owner Address`}
        value={shortenAddress(timelock ? timelock : (governor ?? ''))}
        address={timelock || governor}
      />
    </InfoCard>
  )
}

export default BasicInfo
