import { Trans, t } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import IssuanceIcon from 'components/icons/IssuanceIcon'
import Tenderly from 'components/icons/logos/Tenderly'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { TenderlySimulation } from 'types'
import { TENDERLY_SHARING_URL } from 'utils/constants'
import { simulationStateAtom } from '../../proposal-detail/atom'
import useProposalSimulation from '../hooks/useProposalSimulation'
import { UseSimulateContractParameters } from 'wagmi'
import { cn } from '@/lib/utils'

interface Props {
  tx: UseSimulateContractParameters
  className?: string
}

const getButtonStyles = (sim: TenderlySimulation | null) => {
  if (!sim) return ''

  return sim?.transaction?.status ? 'text-green-500' : 'text-warning'
}

const ProposalStatus = () => {
  const { sim, isLoading, error, handleSimulation } = useProposalSimulation()
  const resetSimulation = useResetAtom(simulationStateAtom)

  const simResult = sim?.simulation?.status
    ? t`Simulation successful ✓`
    : t`Simulation unsuccessful ✘`

  useEffect(() => {
    return () => resetSimulation()
  }, [])
  if (isLoading) {
    return (
      <>
        <Loader2 className="mt-4 mb-2 h-6 w-6 animate-spin" />
        <p className="text-legend">
          <Trans>Please wait while the simulation executes</Trans>
        </p>
      </>
    )
  }

  return (
    <>
      <Button
        className={cn('mt-6 mb-2 w-full', getButtonStyles(sim))}
        disabled={isLoading || !!sim}
        onClick={handleSimulation}
      >
        {sim ? simResult : t`Simulate proposal`}
      </Button>
      {error && (
        <p className="text-sm text-destructive">
          Simulation Error. Please try again later.
        </p>
      )}
      {sim && (
        <div className="flex flex-col items-center text-center">
          <span className="font-bold">
            View on{' '}
            <a
              href={`${TENDERLY_SHARING_URL(sim.simulation.id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Tenderly <ExternalArrowIcon />
            </a>
          </span>
        </div>
      )}
    </>
  )
}
const SimulateProposal = ({ tx, className }: Props) => {
  return (
    <div className={className}>
      <div
        className="flex flex-col overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 124px)' }}
      >
        <div className="flex flex-col items-center text-center rounded-xl border border-foreground/10 bg-card p-6">
          <IssuanceIcon />
          <span className="text-xl font-medium mb-2">
            <Trans>Simulate Proposal</Trans>
          </span>
          <p className="text-legend">
            Simulate your proposal to see the outcome of its execution. A report
            of its execution will be generated
          </p>
          <br />
          <div className="flex items-center text-center gap-2">
            <span>Powered by </span>
            <Tenderly height={30} width={100} />
          </div>
          <ProposalStatus />
        </div>
      </div>
    </div>
  )
}

export default SimulateProposal
