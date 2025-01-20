import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { iTokenAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'
import { isBasketProposalValidAtom } from '../atoms'
import Timeline from '@/components/ui/timeline'

const Header = () => {
  const dtf = useAtomValue(iTokenAtom)

  return (
    <div className="flex items-center p-6 gap-2">
      <TokenLogo size="lg" />
      <h3 className="font-bold mr-auto">${dtf?.symbol}</h3>
      <Link to="../">
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

  return (
    <Button className="w-full" disabled={!isValid}>
      Confirm & prepare proposal
    </Button>
  )
}

const ProposalInstructions = () => {
  const isValid = useAtomValue(isBasketProposalValidAtom)

  const timelineItems = [
    {
      title: 'Configure proposal',
      isActive: true,
    },
    {
      title: 'Finalize basket proposal',
      children: (
        <div className="flex flex-col gap-1 w-full">
          <span>Finalize basket proposal</span>
          <ConfirmProposalButton />
        </div>
      ),
      isActive: isValid,
    },
    {
      title: 'Review & describe your proposal',
      children: (
        <div className="flex flex-col gap-1 w-full">
          <span>Review & describe your proposal</span>
          <Button disabled>Submit proposal onchain</Button>
        </div>
      ),
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
    <div className="border-4 border-secondary rounded-3xl bg-card h-[fit-content] sticky top-0">
      <Header />
      <ProposalInstructions />
    </div>
  )
}

export default BasketProposalOverview
