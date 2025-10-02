import ExternalArrowIcon from '@/components/icons/ExternalArrowIcon'
import Tenderly from '@/components/icons/logos/Tenderly'
import { Button } from '@/components/ui/button'
import { TenderlySimulation } from '@/types'
import { TENDERLY_SHARING_URL } from '@/utils/constants'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

interface SimulateProposalProps {
  isLoading: boolean
  simulation: TenderlySimulation | undefined
  error: any
  onSimulate: () => void
  isReady: boolean
}

const SimulateProposal = ({
  isLoading,
  simulation,
  error,
  onSimulate,
  isReady,
}: SimulateProposalProps) => {
  const hasSimulation = !!simulation
  const isSuccess = simulation?.transaction?.status

  const getButtonLabel = () => {
    if (isLoading) return 'Simulating...'
    if (hasSimulation) {
      return isSuccess ? 'Simulation successful' : 'Simulation unsuccessful'
    }
    return 'Simulate again'
  }

  const getButtonVariant = () => {
    if (hasSimulation) {
      return isSuccess ? 'default' : 'destructive'
    }
    return 'default'
  }

  return (
    <div className="flex flex-col gap-2 border-4 border-secondary rounded-3xl bg-background p-6">
      <div className="flex items-center justify-between">
        {/* Icon */}
        <div>
          {!hasSimulation ? (
            <Loader2
              strokeWidth={1}
              className="w-9 h-9 animate-spin text-primary"
            />
          ) : isSuccess ? (
            <CheckCircle2 strokeWidth={1} className="w-9 h-9 text-primary" />
          ) : (
            <XCircle strokeWidth={1} className="w-9 h-9 text-destructive" />
          )}
        </div>
        {/* Tenderly branding */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-legend">Powered by</span>
          <Tenderly height={24} className="mt-1" width={80} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-primary">
        {hasSimulation ? 'Proposal Simulated' : 'Proposal Simulation'}
      </h3>

      {/* Simulate button */}
      <Button
        onClick={onSimulate}
        disabled={!isReady || isLoading || hasSimulation}
        variant={getButtonVariant()}
        className="w-full mt-2"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {getButtonLabel()}
      </Button>

      {/* Success/Failed - View on Tenderly */}
      {hasSimulation && simulation.simulation?.id && (
        <Button variant="outline" asChild className="w-full">
          <a
            href={TENDERLY_SHARING_URL(simulation.simulation.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            View on Tenderly
            <ExternalArrowIcon />
          </a>
        </Button>
      )}
    </div>
  )
}

export default SimulateProposal
