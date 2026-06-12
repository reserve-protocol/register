import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  proposalTypeAtom,
  type ProposalType,
  type ProposalTypeGovernance,
  useProposalTypeEligibility,
} from '../shared'
import { Trans } from '@lingui/react/macro'
import { useAtom, useSetAtom } from 'jotai'
import { Check } from 'lucide-react'
import { type ReactNode, useEffect, useLayoutEffect, useState } from 'react'
import type { Address, Hex } from 'viem'

type ProposalTypeSelectorProps = {
  governance?: ProposalTypeGovernance | null
  targets?: readonly Address[]
  calldatas?: readonly Hex[]
}

const ProposalTypeOption = ({
  type,
  title,
  description,
  selected,
  onSelect,
}: {
  type: ProposalType
  title: ReactNode
  description: ReactNode
  selected: boolean
  onSelect: (type: ProposalType) => void
}) => (
  <Button
    type="button"
    variant="ghost"
    className={cn(
      'flex items-center h-auto w-full justify-start gap-3 rounded-none px-5 py-4 text-left hover:bg-muted/60',
      selected && 'bg-muted/30'
    )}
    onClick={() => onSelect(type)}
    aria-pressed={selected}
  >
    <span
      className={cn(
        'mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
        selected
          ? 'border-primary text-primary'
          : 'border-border text-muted-foreground'
      )}
    >
      {selected && <Check size={16} />}
    </span>
    <span className="flex flex-col gap-0.5">
      <span className="text-lg font-semibold text-foreground">{title}</span>
      <span className="text-sm font-normal text-muted-foreground">
        {description}
      </span>
    </span>
  </Button>
)

const ProposalTypeSelector = ({
  governance,
  targets,
  calldatas,
}: ProposalTypeSelectorProps) => {
  const [proposalType, setProposalType] = useAtom(proposalTypeAtom)
  const resetProposalType = useSetAtom(proposalTypeAtom)
  const [hasDefaulted, setHasDefaulted] = useState(false)
  const { isOptimisticEligible } = useProposalTypeEligibility({
    governance,
    targets,
    calldatas,
  })

  useLayoutEffect(() => {
    if (!isOptimisticEligible) {
      setProposalType('standard')
      setHasDefaulted(false)
      return
    }

    if (!hasDefaulted) {
      setProposalType('optimistic')
      setHasDefaulted(true)
    }
  }, [hasDefaulted, isOptimisticEligible, setProposalType])

  useEffect(() => {
    return () => resetProposalType('standard')
  }, [resetProposalType])

  if (!isOptimisticEligible || !hasDefaulted) return null

  return (
    <section className="overflow-hidden rounded-3xl border bg-background shadow-sm">
      <div className="px-5 pb-4 pt-5">
        <h3 className="text-xl font-semibold text-primary">
          <Trans>Select Proposal Type</Trans>
        </h3>
        <p className="mt-1 text-sm text-foreground">
          <Trans>
            We have detected that you have permission to expedite proposals
            through fast governance. Choose from the following proposal types.
          </Trans>
        </p>
      </div>
      <div className="divide-y border bg-card rounded-2xl m-1">
        <ProposalTypeOption
          type="standard"
          title={<Trans>Standard Governance</Trans>}
          description={
            <Trans>
              Governance with an execution delay greater than 1 week unstaking
              delay
            </Trans>
          }
          selected={proposalType === 'standard'}
          onSelect={setProposalType}
        />
        <ProposalTypeOption
          type="optimistic"
          title={<Trans>Fast Governance</Trans>}
          description={
            <Trans>For approved governors to fast-track proposals.</Trans>
          }
          selected={proposalType === 'optimistic'}
          onSelect={setProposalType}
        />
      </div>
    </section>
  )
}

export default ProposalTypeSelector
