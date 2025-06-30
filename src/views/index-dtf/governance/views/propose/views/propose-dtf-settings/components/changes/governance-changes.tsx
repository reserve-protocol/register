import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'
import { ArrowRight, Landmark, Pause, CalendarRange, FileLock2, ShieldCheck, Clock } from 'lucide-react'
import {
  governanceChangesAtom,
  hasGovernanceChangesAtom,
} from '../../atoms'
import { ChangeSection, RevertButton } from './shared'

// Convert seconds to days for display
const secondsToDays = (seconds: number) => seconds / 86400

// Humanize time from seconds
const humanizeTimeFromSeconds = (seconds: number) => {
  const days = secondsToDays(seconds)
  if (days < 1) {
    const hours = seconds / 3600
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  return `${days} day${days !== 1 ? 's' : ''}`
}

const GovernanceChanges = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const [governanceChanges, setGovernanceChanges] = useAtom(governanceChangesAtom)
  const hasGovernanceChanges = useAtomValue(hasGovernanceChangesAtom)
  const { setValue } = useFormContext()

  const governance = indexDTF?.ownerGovernance

  if (!hasGovernanceChanges || !governance) return null

  const handleRevert = (field: keyof typeof governanceChanges) => {
    const newChanges = { ...governanceChanges }
    delete newChanges[field]
    setGovernanceChanges(newChanges)

    // Reset form value to original
    switch (field) {
      case 'votingDelay':
        setValue('governanceVotingDelay', secondsToDays(Number(governance.votingDelay)))
        break
      case 'votingPeriod':
        setValue('governanceVotingPeriod', secondsToDays(Number(governance.votingPeriod)))
        break
      case 'proposalThreshold':
        setValue('governanceVotingThreshold', Number(governance.proposalThreshold) / 1e16)
        break
      case 'quorumPercent':
        setValue('governanceVotingQuorum', Number(governance.quorumNumerator))
        break
      case 'executionDelay':
        setValue('governanceExecutionDelay', secondsToDays(Number(governance.timelock?.executionDelay || 0)))
        break
    }
  }

  const changes = []

  if (governanceChanges.votingDelay !== undefined) {
    changes.push({
      icon: <Pause size={16} />,
      title: 'Voting Delay',
      current: humanizeTimeFromSeconds(Number(governance.votingDelay)),
      new: humanizeTimeFromSeconds(governanceChanges.votingDelay),
      onRevert: () => handleRevert('votingDelay'),
    })
  }

  if (governanceChanges.votingPeriod !== undefined) {
    changes.push({
      icon: <CalendarRange size={16} />,
      title: 'Voting Period',
      current: humanizeTimeFromSeconds(Number(governance.votingPeriod)),
      new: humanizeTimeFromSeconds(governanceChanges.votingPeriod),
      onRevert: () => handleRevert('votingPeriod'),
    })
  }

  if (governanceChanges.proposalThreshold !== undefined) {
    changes.push({
      icon: <FileLock2 size={16} />,
      title: 'Proposal Threshold',
      current: `${(Number(governance.proposalThreshold) / 1e16).toFixed(2)}%`,
      new: `${governanceChanges.proposalThreshold.toFixed(2)}%`,
      onRevert: () => handleRevert('proposalThreshold'),
    })
  }

  if (governanceChanges.quorumPercent !== undefined) {
    changes.push({
      icon: <ShieldCheck size={16} />,
      title: 'Voting Quorum',
      current: `${Number(governance.quorumNumerator)}%`,
      new: `${governanceChanges.quorumPercent}%`,
      onRevert: () => handleRevert('quorumPercent'),
    })
  }

  if (governanceChanges.executionDelay !== undefined) {
    changes.push({
      icon: <Clock size={16} />,
      title: 'Execution Delay',
      current: humanizeTimeFromSeconds(Number(governance.timelock?.executionDelay || 0)),
      new: humanizeTimeFromSeconds(governanceChanges.executionDelay),
      onRevert: () => handleRevert('executionDelay'),
    })
  }

  return (
    <ChangeSection title="Governance Parameters" icon={<Landmark size={16} />}>
      <div className="space-y-2">
        {changes.map((change, index) => (
          <div key={index} className="flex items-center gap-2 p-4 rounded-2xl bg-muted/70 border">
            {change.icon}
            <div className="mr-auto">
              <div className="text-sm font-medium">{change.title}</div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">{change.current}</span>
                <ArrowRight size={16} className="text-primary" />
                <span className="text-primary font-medium">{change.new}</span>
              </div>
            </div>
            <RevertButton size="icon-rounded" onClick={change.onRevert} />
          </div>
        ))}
      </div>
    </ChangeSection>
  )
}

export default GovernanceChanges