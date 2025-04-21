import { indexDTFAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { Braces, DollarSign, Hash, Signature } from 'lucide-react'
import { IconWrapper, InfoCard, InfoCardItem } from './settings-info-card'

const BasicInfo = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const version = useAtomValue(indexDTFVersionAtom)

  return (
    <InfoCard title="Basics">
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
        value={indexDTF?.mandate}
      />
      <InfoCardItem
        label={t`Deployer`}
        icon={<IconWrapper Component={Hash} />}
        address={indexDTF?.deployer}
        value={
          indexDTF?.deployer ? shortenAddress(indexDTF.deployer) : undefined
        }
      />
      <InfoCardItem
        label={t`Version`}
        icon={<IconWrapper Component={Hash} />}
        value={version || '1.0.0'}
      />
    </InfoCard>
  )
}

export default BasicInfo
