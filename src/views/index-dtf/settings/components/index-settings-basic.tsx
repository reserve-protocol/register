import EnsName from '@/components/utils/ens-name'
import {
  indexDTFAtom,
  indexDTFRebalanceControlAtom,
  indexDTFVersionAtom,
} from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { Braces, DollarSign, Hash, Signature, ToggleRight } from 'lucide-react'
import { IconWrapper, InfoCard, InfoCardItem } from './settings-info-card'

const BasicInfo = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const version = useAtomValue(indexDTFVersionAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const isV5 = version.startsWith('5')

  let mandate = indexDTF?.mandate

  if (mandate) {
    if (mandate === '') mandate = 'Unknown'

    if (mandate.length > 500) mandate = mandate.substring(0, 500) + '...'
  }

  return (
    <InfoCard title="Basics" id="basics">
      <InfoCardItem
        label={t`Name`}
        icon={<IconWrapper Component={Braces} />}
        value={indexDTF?.token.name}
        border={false}
      />
      <InfoCardItem
        label={t`Ticker`}
        icon={<IconWrapper Component={DollarSign} />}
        value={indexDTF?.token.symbol}
      />
      <InfoCardItem
        label={t`Address`}
        icon={<IconWrapper Component={Hash} />}
        address={indexDTF?.id}
        value={indexDTF?.id ? shortenAddress(indexDTF.id) : undefined}
      />
      <InfoCardItem
        label={t`Mandate`}
        icon={<IconWrapper Component={Signature} />}
        bold={false}
        value={mandate}
      />
      <InfoCardItem
        label={t`Deployer`}
        icon={<IconWrapper Component={Hash} />}
        address={indexDTF?.deployer}
        value={
          indexDTF?.deployer ? <EnsName address={indexDTF.deployer} /> : undefined
        }
      />
      <InfoCardItem
        label={t`Version`}
        icon={<IconWrapper Component={Hash} />}
        value={version || '1.0.0'}
      />
      {rebalanceControl && (
        <InfoCardItem
          label={t`Weight Control`}
          icon={<IconWrapper Component={ToggleRight} />}
          value={rebalanceControl.weightControl ? 'Enabled' : 'Disabled'}
        />
      )}
      {isV5 && (
        <InfoCardItem
          label={t`Permissionless Bids`}
          icon={<IconWrapper Component={ToggleRight} />}
          value={indexDTF?.rebalance.bidsEnabled ? 'Enabled' : 'Disabled'}
        />
      )}
    </InfoCard>
  )
}

export default BasicInfo
