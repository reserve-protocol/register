import TokenLogo from '@/components/token-logo'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { InfoCard, InfoCardItem } from './settings-info-card'

const GovernanceTokenInfo = () => {
  const { t } = useLingui()
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (indexDTF && !indexDTF.stToken) return null

  return (
    <InfoCard title={t`Governance Token`} id="governance-token">
      <InfoCardItem
        label={t`Vote-Lock DAO Token`}
        icon={
          <TokenLogo
            chain={chainId}
            symbol={indexDTF?.stToken?.token.symbol}
            address={indexDTF?.stToken?.id}
            size="xl"
          />
        }
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
