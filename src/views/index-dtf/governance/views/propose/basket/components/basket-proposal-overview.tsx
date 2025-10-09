import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import Timeline from '@/components/ui/timeline'
import { useAtom, useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'
import {
  isBasketProposalValidAtom,
  isProposalConfirmedAtom,
  basketProposalCalldatasAtom,
  proposalDescriptionAtom,
} from '../atoms'
import SubmitProposalButton from './submit-proposal-button'
import { ROUTES } from '@/utils/constants'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import SimulateProposalCard from '@/views/index-dtf/governance/components/simulate-proposal-card'
import { chainIdAtom } from '@/state/atoms'
import { Address } from 'viem'

// TODO: get governance route to navigate back to governance
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

const SimulateProposalSection = () => {
  const isProposalConfirmed = useAtomValue(isProposalConfirmedAtom)
  const calldatas = useAtomValue(basketProposalCalldatasAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  // Determine which governance to use (trading for basket changes)
  const governorAddress = indexDTF?.tradingGovernance?.id as Address
  const timelockAddress = indexDTF?.tradingGovernance?.timelock?.id as Address
  const voteTokenAddress = indexDTF?.stToken?.id as Address

  if (!indexDTF) return null

  // Construct proposal data for simulation (targets derived from DTF address)
  const proposalData = calldatas
    ? {
        targets: calldatas.map(() => indexDTF.id as Address),
        values: calldatas.map(() => 0n),
        calldatas,
      }
    : null

  return (
    <SimulateProposalCard
      isProposalConfirmed={isProposalConfirmed}
      proposalData={proposalData}
      governorAddress={governorAddress}
      timelockAddress={timelockAddress}
      voteTokenAddress={voteTokenAddress}
      chainId={chainId}
    />
  )
}

const BasketProposalOverview = () => {
  const isProposalConfirmed = useAtomValue(isProposalConfirmedAtom)

  return (
    <div className="flex flex-col gap-2">
      <div
        className={
          !isProposalConfirmed
            ? 'border-4 overflow-hidden w-full border-secondary rounded-3xl bg-background h-[fit-content] sticky top-0'
            : 'border-4 overflow-hidden w-full border-secondary rounded-3xl bg-background h-[fit-content]'
        }
      >
        <Header />
        <ProposalInstructions />
      </div>
      <SimulateProposalSection />
    </div>
  )
}

export default BasketProposalOverview
