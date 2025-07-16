import { AccordionTrigger } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { useAtomValue } from 'jotai'
import { ChevronDownIcon, ChevronUpIcon, PenLineIcon } from 'lucide-react'
import { ReactNode } from 'react'
import { Step, stepAtom, stepStateAtom } from '../atoms'

export type ProposalStep = {
  id: Step
  icon: ReactNode
  title: string
  titleSecondary: string
  content: ReactNode
  triggerLabel?: ReactNode
}

interface ProposalStepTrigger
  extends Omit<ProposalStep, 'content' | 'titleSecondary'> {
  advanced?: boolean
}

const ProposalStepTrigger = ({
  id,
  icon,
  title,
  triggerLabel,
  advanced,
}: ProposalStepTrigger) => {
  const selectedSection = useAtomValue(stepAtom)
  const isActive = selectedSection === id
  const isCompleted = useAtomValue(stepStateAtom)[id]

  return (
    <AccordionTrigger
      withChevron={false}
      className={cn(
        'flex items-center justify-between w-full p-4 sm:p-6',
        isActive ? 'pb-3' : ''
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'rounded-full flex-shrink-0 p-2 border',
            isActive || isCompleted
              ? 'text-primary border-primary'
              : 'text-black border-black'
          )}
        >
          {icon}
        </div>
        <div
          className={cn(
            'text-left text-base sm:text-xl font-bold animate-fade-in',
            isActive || isCompleted ? 'text-primary' : '',
            isActive ? 'hidden' : ''
          )}
        >
          {title}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!isActive && triggerLabel}
        <div
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full p-1',
            !advanced && 'bg-muted-foreground/10',
            advanced && 'border-[1px] border-muted-foreground/20'
          )}
          role="button"
        >
          {isActive ? (
            <ChevronUpIcon size={16} strokeWidth={2} />
          ) : isCompleted ? (
            <PenLineIcon size={16} strokeWidth={2} />
          ) : (
            <ChevronDownIcon size={16} strokeWidth={2} />
          )}
        </div>
      </div>
    </AccordionTrigger>
  )
}

export default ProposalStepTrigger
