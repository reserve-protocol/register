import { Trans } from '@lingui/macro'
import { InfoHeading } from 'components/info-box'

import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom } from 'state/atoms'
import { BoxProps, Card, Text } from 'theme-ui'

const GovernanceInfo = (props: BoxProps) => {
  const governance = useAtomValue(rTokenGovernanceAtom)

  return (
    <Card p={4} {...props}>
      <Text mb={5} variant="sectionTitle">
        <Trans>Governance Details</Trans>
      </Text>

      <InfoHeading title="Name" subtitle={governance.name} mb={3} />
      {governance.governor && (
        <InfoHeading
          title="Governor address"
          subtitle={governance.governor}
          mb={3}
        />
      )}
      {governance.timelock && (
        <>
          <InfoHeading
            title="Timelock address"
            subtitle={governance.timelock}
            mb={3}
          />
          <InfoHeading
            title="Voting Delay"
            subtitle={governance.votingDelay}
            mb={3}
          />
          <InfoHeading
            title="Voting Period"
            subtitle={governance.votingPeriod}
            mb={3}
          />
          <InfoHeading
            title="Proposal Threshold (%)"
            subtitle={governance.proposalThreshold}
            mb={3}
          />
          <InfoHeading title="Quorum" subtitle={governance.quorum} mb={3} />
          <InfoHeading
            title="Minimum Delay"
            subtitle={governance.minDelay}
            mb={3}
          />
        </>
      )}
    </Card>
  )
}

export default GovernanceInfo
