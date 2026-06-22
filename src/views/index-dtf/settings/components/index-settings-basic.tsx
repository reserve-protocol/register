import EnsName from '@/components/utils/ens-name'
import {
  indexDTFAtom,
  indexDTFRebalanceControlAtom,
  indexDTFVersionAtom,
} from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Braces, DollarSign, Hash, Signature, ToggleRight } from 'lucide-react'
import { IconWrapper, InfoCard, InfoCardItem } from './settings-info-card'

const BasicInfo = () => {
  const { t } = useLingui()
  const indexDTF = useAtomValue(indexDTFAtom)
  const version = useAtomValue(indexDTFVersionAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const isV5 = version.startsWith('5')

  let mandate = indexDTF?.mandate

  if (mandate && mandate.length > 500) mandate = mandate.substring(0, 500) + '...'

  // Hide the mandate row when the DTF is loaded but has no mandate;
  // keep it (as a skeleton) while still loading.
  const showMandate = !indexDTF || !!mandate

  return (
    <InfoCard title={t`Basics`} id="basics">
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
      {showMandate && (
        <InfoCardItem
          label={t`Mandate`}
          icon={<IconWrapper Component={Signature} />}
          bold={false}
          value={mandate}
        />
      )}
      <InfoCardItem
        label={t`Deployer`}
        icon={<IconWrapper Component={Hash} />}
        address={indexDTF?.deployer}
        value={
          indexDTF?.deployer ? (
            <EnsName address={indexDTF.deployer} />
          ) : undefined
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
          value={rebalanceControl.weightControl ? t`Enabled` : t`Disabled`}
        />
      )}
      {isV5 && (
        <InfoCardItem
          label={t`Permissionless Bids`}
          icon={<IconWrapper Component={ToggleRight} />}
          value={indexDTF?.rebalance.bidsEnabled ? t`Enabled` : t`Disabled`}
        />
      )}
    </InfoCard>
  )
}

export default BasicInfo
