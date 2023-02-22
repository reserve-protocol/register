import { t, Trans } from '@lingui/macro'
import { InfoItem } from 'components/info-box'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom } from 'state/atoms'
import { Card, Text, Divider } from 'theme-ui'
import { shortenAddress } from 'utils'

/**
 * View: Settings > Display RToken basic info
 */
const BasicInfo = () => {
  const rToken = useRToken()
  const { governor, timelock } = useAtomValue(rTokenGovernanceAtom)

  return (
    <Card p={4}>
      <Text variant="sectionTitle">
        <Trans>Token Details</Trans>
      </Text>
      <Divider mx={-4} my={4} sx={{ borderColor: 'darkBorder' }} />
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
        title={t`Owner Address`}
        subtitle={shortenAddress(timelock ? timelock : governor)}
        address={timelock || governor}
      />
    </Card>
  )
}

export default BasicInfo
