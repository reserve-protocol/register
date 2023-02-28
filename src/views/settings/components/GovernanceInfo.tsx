import { t, Trans } from '@lingui/macro'
import { InfoItem } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom } from 'state/atoms'
import { BoxProps, Card, Text, Divider } from 'theme-ui'
import { formatPercentage, parseDuration, shortenAddress } from 'utils'

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
            subtitle={`${parseDuration(
              Number(governance.votingDelay) || 0 * 12
            )} (${governance.votingDelay} blocks)`}
            mb={3}
          />
          <InfoItem
            title={t`Voting Period`}
            subtitle={`${parseDuration(
              Number(governance.votingPeriod) || 0 * 12
            )} (${governance.votingPeriod} blocks)`}
            mb={3}
          />
          <InfoItem
            title={t`Proposal Threshold`}
            subtitle={formatPercentage(+(governance.proposalThreshold || 0))}
            mb={3}
          />
          <InfoItem
            title={t`Quorum`}
            subtitle={formatPercentage(+(governance.quorumNumerator || 0))}
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
