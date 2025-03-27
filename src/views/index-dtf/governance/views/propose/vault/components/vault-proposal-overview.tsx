import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import Timeline from '@/components/ui/timeline'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { useAtom, useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'
import { isProposalConfirmedAtom, isProposalValidAtom } from '../atoms'
import SubmitProposalButton from './submit-proposal-button'

const ConfirmProposalButton = () => {
  const isValid = useAtomValue(isProposalValidAtom)
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
  const isValid = useAtomValue(isProposalValidAtom)
  const confirmed = useAtomValue(isProposalConfirmedAtom)

  const timelineItems = [
    {
      title: 'Configure proposal',
      isActive: !isValid,
      isCompleted: isValid,
    },
    {
      title: 'Finalize basket proposal',
      children: <ConfirmProposalButton />,
      isActive: isValid && !confirmed,
      isCompleted: confirmed,
    },
    {
      title: 'Review & describe your proposal',
      children: <SubmitProposalButton />,
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

const Header = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)

  return (
    <div className="flex items-center p-6 gap-2 bg-card rounded-t-3xl">
      <TokenLogo size="lg" src={brand?.dtf?.icon || undefined} />
      <h3 className="font-bold mr-auto">${dtf?.token.symbol}</h3>
      <Link to={`../${ROUTES.GOVERNANCE}`}>
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

const VaultProposalOverview = () => {
  return (
    <div className="border-4 overflow-hidden w-full border-secondary rounded-3xl bg-background h-[fit-content] sticky top-0">
      <Header />
      <ProposalInstructions />
    </div>
  )
}

export default VaultProposalOverview
