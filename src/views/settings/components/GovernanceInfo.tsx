import { t, Trans } from '@lingui/macro'
import { InfoItem } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom } from 'state/atoms'
import { BoxProps, Card, Text, Divider } from 'theme-ui'
import { shortenAddress } from 'utils'

/**
 * View: Settings > Display RToken governance configuration
 */
const GovernanceInfo = (props: BoxProps) => {
  const governance = useAtomValue(rTokenGovernanceAtom)

  return (
    <Card p={4} {...props}>
      <Text variant="sectionTitle">
        <Trans>Governance Details</Trans>
      </Text>
      <Divider mx={-4} my={4} sx={{ borderColor: 'darkBorder' }} />
      <InfoItem title={t`Name`} subtitle={governance.name} mb={3} />
      {!!governance.timelock && (
        <>
          <InfoItem
            title={t`Voting Delay`}
            subtitle={governance.votingDelay}
            mb={3}
          />
          <InfoItem
            title={t`Voting Period`}
            subtitle={governance.votingPeriod}
            mb={3}
          />
          <InfoItem
            title={t`Proposal Threshold (%)`}
            subtitle={governance.proposalThreshold}
            mb={3}
          />
          <InfoItem title={t`Quorum`} subtitle={governance.quorum} mb={3} />
          <InfoItem
            title={t`Minimum Delay (s)`}
            subtitle={governance.minDelay}
            mb={3}
          />
          <InfoItem
            title={t`Timelock address`}
            subtitle={shortenAddress(governance.timelock)}
            address={governance.timelock}
            mb={3}
          />
        </>
      )}
      {!!governance.governor && (
        <InfoItem
          title={t`Governor address`}
          subtitle={shortenAddress(governance.governor)}
          address={governance.governor}
        />
      )}
    </Card>
  )
}

export default GovernanceInfo
