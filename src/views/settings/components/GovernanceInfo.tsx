import { t, Trans } from '@lingui/macro'
import { InfoItem } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom, secondsPerBlockAtom } from 'state/atoms'
import { BoxProps, Card, Text, Divider } from 'theme-ui'
import { formatPercentage, parseDuration, shortenAddress } from 'utils'
import { isTimeunitGovernance } from 'views/governance/utils'

const getLegend = (
  isTimepoint: boolean,
  secondsPerBlock: number,
  duration?: string
) => {
  const multiplier = isTimepoint ? 1 : secondsPerBlock
  const period = parseDuration((Number(duration) || 0) * multiplier)

  if (isTimepoint) {
    return period
  }

  return period + ` (${duration} blocks)`
}

/**
 * View: Settings > Display RToken governance configuration
 */
const GovernanceInfo = (props: BoxProps) => {
  const governance = useAtomValue(rTokenGovernanceAtom)
  const secondsPerBlock = useAtomValue(secondsPerBlockAtom)
  const isTimeunit = isTimeunitGovernance(governance.name)

  console.log('gov', governance.executionDelay)

  return (
    <Card p={4} {...props}>
      <Text variant="title">
        <Trans>Governance Details</Trans>
      </Text>
      <Divider mx={-4} my={4} sx={{ borderColor: 'darkBorder' }} />
      <InfoItem title={t`Name`} subtitle={governance.name} mb={3} />
      {!!governance.timelock && (
        <>
          <InfoItem
            title={t`Snapshot Delay`}
            subtitle={getLegend(
              isTimeunit,
              secondsPerBlock,
              governance.votingDelay
            )}
            mb={3}
          />
          <InfoItem
            title={t`Voting Period`}
            subtitle={getLegend(
              isTimeunit,
              secondsPerBlock,
              governance.votingPeriod
            )}
            mb={3}
          />
          <InfoItem
            title={t`Execution Delay`}
            subtitle={parseDuration(+(governance.executionDelay || 0))}
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
