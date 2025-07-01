import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'
import { ArrowRight, Landmark, Pause, CalendarRange, FileLock2, ShieldCheck, Clock } from 'lucide-react'
import {
  daoGovernanceChangesAtom,
  hasDaoGovernanceChangesAtom,
  daoGovernanceChangesDisplayAtom,
} from '../../atoms'
import { ChangeSection, RevertButton } from './shared'
import { secondsToDays, proposalThresholdToPercentage } from '../../../../shared'

const iconMap = {
  'votingDelay': <Pause size={16} />,
  'votingPeriod': <CalendarRange size={16} />,
  'proposalThreshold': <FileLock2 size={16} />,
  'quorumPercent': <ShieldCheck size={16} />,
  'executionDelay': <Clock size={16} />,
}

const DaoGovernanceChanges = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const [governanceChanges, setGovernanceChanges] = useAtom(daoGovernanceChangesAtom)
  const hasGovernanceChanges = useAtomValue(hasDaoGovernanceChangesAtom)
  const displayChanges = useAtomValue(daoGovernanceChangesDisplayAtom)
  const { setValue } = useFormContext()

  const governance = indexDTF?.stToken?.governance

  if (!hasGovernanceChanges || !governance) return null

  const handleRevert = (field: keyof typeof governanceChanges) => {
    const newChanges = { ...governanceChanges }
    delete newChanges[field]
    setGovernanceChanges(newChanges)

    // Reset form value to original
    switch (field) {
      case 'votingDelay':
        setValue('daoVotingDelay', secondsToDays(Number(governance.votingDelay)))
        break
      case 'votingPeriod':
        setValue('daoVotingPeriod', secondsToDays(Number(governance.votingPeriod)))
        break
      case 'proposalThreshold':
        setValue('daoVotingThreshold', proposalThresholdToPercentage(governance.proposalThreshold))
        break
      case 'quorumPercent':
        setValue('daoVotingQuorum', Number(governance.quorumNumerator))
        break
      case 'executionDelay':
        setValue('daoExecutionDelay', secondsToDays(Number(governance.timelock?.executionDelay || 0)))
        break
    }
  }

  return (
    <ChangeSection title="Governance Parameters" icon={<Landmark size={16} />}>
      <div className="space-y-2">
        {displayChanges.map((change) => (
          <div key={change.key} className="flex items-center gap-2 p-4 rounded-2xl bg-muted/70 border">
            {iconMap[change.key as keyof typeof iconMap]}
            <div className="mr-auto">
              <div className="text-sm font-medium">{change.title}</div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">{change.current}</span>
                <ArrowRight size={16} className="text-primary" />
                <span className="text-primary font-medium">{change.new}</span>
              </div>
            </div>
            <RevertButton size="icon-rounded" onClick={() => handleRevert(change.key as keyof typeof governanceChanges)} />
          </div>
        ))}
      </div>
    </ChangeSection>
  )
}

export default DaoGovernanceChanges