import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'
import { ArrowRight, Landmark, Pause, CalendarRange, FileLock2, ShieldCheck, Clock } from 'lucide-react'
import {
  basketGovernanceChangesAtom,
  hasBasketGovernanceChangesAtom,
  basketGovernanceChangesDisplayAtom,
} from '../../atoms'
import { ChangeSection, RevertButton } from '../../../propose-dao-settings/components/changes/shared'

// Convert seconds to days for display
const secondsToDays = (seconds: number) => seconds / 86400

const iconMap = {
  'votingDelay': <Pause size={16} />,
  'votingPeriod': <CalendarRange size={16} />,
  'proposalThreshold': <FileLock2 size={16} />,
  'quorumPercent': <ShieldCheck size={16} />,
  'executionDelay': <Clock size={16} />,
}

const BasketGovernanceChanges = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const [governanceChanges, setGovernanceChanges] = useAtom(basketGovernanceChangesAtom)
  const hasGovernanceChanges = useAtomValue(hasBasketGovernanceChangesAtom)
  const displayChanges = useAtomValue(basketGovernanceChangesDisplayAtom)
  const { setValue } = useFormContext()

  const governance = indexDTF?.tradingGovernance

  if (!hasGovernanceChanges || !governance) return null

  const handleRevert = (field: keyof typeof governanceChanges) => {
    const newChanges = { ...governanceChanges }
    delete newChanges[field]
    setGovernanceChanges(newChanges)

    // Reset form value to original
    switch (field) {
      case 'votingDelay':
        setValue('basketVotingDelay', secondsToDays(Number(governance.votingDelay)))
        break
      case 'votingPeriod':
        setValue('basketVotingPeriod', secondsToDays(Number(governance.votingPeriod)))
        break
      case 'proposalThreshold':
        setValue('basketVotingThreshold', Number(governance.proposalThreshold) / 1e18)
        break
      case 'quorumPercent':
        setValue('basketVotingQuorum', Number(governance.quorumNumerator))
        break
      case 'executionDelay':
        setValue('basketExecutionDelay', secondsToDays(Number(governance.timelock?.executionDelay || 0)))
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

export default BasketGovernanceChanges