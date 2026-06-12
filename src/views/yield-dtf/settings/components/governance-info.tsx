import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom, secondsPerBlockAtom } from '@/state/atoms'
import { formatPercentage, parseDuration, shortenAddress } from '@/utils'
import { isTimeunitGovernance } from '@/views/yield-dtf/governance/utils'
import { InfoCard, InfoCardItem } from './settings-info-card'

const getLegend = (
  isTimepoint: boolean,
  secondsPerBlock: number,
  duration: string | undefined,
  t: (descriptor: MessageDescriptor) => string
) => {
  const multiplier = isTimepoint ? 1 : secondsPerBlock
  const period = parseDuration((Number(duration) || 0) * multiplier)

  if (isTimepoint) {
    return period
  }

  const blocks = duration ?? ''
  return period + ` (${t(msg`${blocks} blocks`)})`
}

const GovernanceInfo = () => {
  const { t } = useLingui()
  const governance = useAtomValue(rTokenGovernanceAtom)
  const secondsPerBlock = useAtomValue(secondsPerBlockAtom)
  const isTimeunit = isTimeunitGovernance(governance.name)

  return (
    <InfoCard title={t`Governance Details`} id="governance-details">
      <InfoCardItem label={t`Name`} value={governance.name} border={false} />
      {!!governance.timelock && (
        <>
          <InfoCardItem
            label={t`Snapshot Delay`}
            value={getLegend(
              isTimeunit,
              secondsPerBlock,
              governance.votingDelay,
              t
            )}
          />
          <InfoCardItem
            label={t`Voting Period`}
            value={getLegend(
              isTimeunit,
              secondsPerBlock,
              governance.votingPeriod,
              t
            )}
          />
          <InfoCardItem
            label={t`Execution Delay`}
            value={parseDuration(+(governance.executionDelay || 0))}
          />
          <InfoCardItem
            label={t`Proposal Threshold`}
            value={formatPercentage(+(governance.proposalThreshold || 0))}
          />
          <InfoCardItem
            label={t`Quorum`}
            value={formatPercentage(+(governance.quorumNumerator || 0))}
          />
          <InfoCardItem
            label={t`Timelock address`}
            value={shortenAddress(governance.timelock)}
            address={governance.timelock}
          />
        </>
      )}
      {!!governance.governor && (
        <InfoCardItem
          label={t`Governor address`}
          value={shortenAddress(governance.governor)}
          address={governance.governor}
        />
      )}
    </InfoCard>
  )
}

export default GovernanceInfo
