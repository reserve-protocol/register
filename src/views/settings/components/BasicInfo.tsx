import { t, Trans } from '@lingui/macro'
import { InfoItem } from 'components/info-box'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom } from 'state/atoms'
import { Card, Text } from 'theme-ui'
import { shortenAddress } from 'utils'

const BasicInfo = () => {
  const rToken = useRToken()
  const { governor, timelock } = useAtomValue(rTokenGovernanceAtom)

  return (
    <Card p={4}>
      <Text variant="sectionTitle">
        <Trans>
          <Trans>Token Details</Trans>
        </Trans>
      </Text>
      <InfoItem title={t`Name`} subtitle={rToken?.name} mb={3} />
      <InfoItem title={t`Symbol`} subtitle={rToken?.symbol} mb={3} />
      <InfoItem title={t`Mandate`} subtitle={rToken?.mandate} mb={3} />
      <InfoItem
        title={t`Token Address`}
        subtitle={shortenAddress(rToken?.address ?? '')}
        address={rToken?.address}
        mb={3}
      />
      <InfoItem
        title={timelock ? t`Governor Address` : t`Owner Address`}
        subtitle={shortenAddress(timelock ? timelock : governor)}
        address={timelock || governor}
      />
    </Card>
  )
}

export default BasicInfo
