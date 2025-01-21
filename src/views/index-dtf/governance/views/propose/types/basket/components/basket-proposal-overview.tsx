import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { iTokenAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Link } from 'react-router-dom'
import { isBasketProposalValidAtom, isProposalConfirmedAtom } from '../atoms'
import Timeline from '@/components/ui/timeline'
import SubmitProposalButton from './submit-proposal-button'

// TODO: get governance route to navigate back to governance
const Header = () => {
  const dtf = useAtomValue(iTokenAtom)

  return (
    <div className="flex items-center p-6 gap-2 bg-card rounded-t-3xl">
      <TokenLogo size="lg" />
      <h3 className="font-bold mr-auto">${dtf?.symbol}</h3>
      <Link to="..">
        <Button
          variant="outline"
          size="xs"
          className="rounded-[42px] font-light text-destructive hover:text-destructive"
        >
          Cancel
        </Button>
      </Link>
    </div>
  )
}

const ConfirmProposalButton = () => {
  const isValid = useAtomValue(isBasketProposalValidAtom)
  const [isProposalConfirmed, setIsProposalConfirmed] = useAtom(
    isProposalConfirmedAtom
  )

  return (
    <Button
      className="w-full"
      disabled={!isValid}
      variant={isProposalConfirmed ? 'outline' : 'default'}
      onClick={() => setIsProposalConfirmed(!isProposalConfirmed)}
    >
      {isProposalConfirmed ? 'Edit proposal' : 'Confirm & prepare proposal'}
    </Button>
  )
}

const ProposalInstructions = () => {
  const isValid = useAtomValue(isBasketProposalValidAtom)
  const confirmed = useAtomValue(isProposalConfirmedAtom)

  const timelineItems = [
    {
      title: 'Configure proposal',
      isActive: !isValid,
      isCompleted: isValid,
    },
    {
      title: 'Finalize basket proposal',
      children: (
        <div className="flex flex-col gap-1 w-full">
          <span>Finalize basket proposal</span>
          <ConfirmProposalButton />
        </div>
      ),
      isActive: isValid && !confirmed,
      isCompleted: confirmed,
    },
    {
      title: 'Review & describe your proposal',
      children: (
        <div className="flex flex-col gap-1 w-full">
          <span>Review & describe your proposal</span>
          <SubmitProposalButton />
        </div>
      ),
      isActive: confirmed,
    },
    {
      title: 'Voting delay begins',
    },
  ]

  return (
    <div className="p-4 pr-10 ml-4 mb-4 w-full">
      <Timeline items={timelineItems} />
    </div>
  )
}

const BasketProposalOverview = () => {
  return (
    <div className="border-4 border-secondary rounded-3xl bg-background h-[fit-content] sticky top-0">
      <Header />
      <ProposalInstructions />
    </div>
  )
}

export default BasketProposalOverview
