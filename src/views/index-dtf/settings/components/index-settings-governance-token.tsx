import TokenLogo from '@/components/token-logo'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { Hash } from 'lucide-react'
import { IconWrapper, InfoCard, InfoCardItem } from './settings-info-card'

const GovernanceTokenInfo = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (indexDTF && !indexDTF.stToken) return null

  return (
    <InfoCard title="Governance Token">
      <InfoCardItem
        label={t`Vote-Lock DAO Token`}
        icon={<IconWrapper Component={Hash} />}
        value={indexDTF?.stToken?.token.symbol}
        address={indexDTF?.stToken?.id}
        border={false}
      />
      <InfoCardItem
        label={t`Underlying Token`}
        icon={
          <TokenLogo
            chain={chainId}
            symbol={indexDTF?.stToken?.underlying.symbol}
            address={indexDTF?.stToken?.underlying.address}
            size="xl"
          />
        }
        value={indexDTF?.stToken?.underlying.symbol}
        address={indexDTF?.stToken?.underlying.address}
      />
    </InfoCard>
  )
}

export default GovernanceTokenInfo
