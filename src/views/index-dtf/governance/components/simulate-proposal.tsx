import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import ExternalArrowIcon from '@/components/icons/ExternalArrowIcon'
import Tenderly from '@/components/icons/logos/Tenderly'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { TENDERLY_SHARING_URL } from '@/utils/constants'
import { TenderlySimulation } from '@/types'

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
      return isSuccess ? 'Simulation successful ✓' : 'Simulation unsuccessful ✘'
    }
    return 'Simulate proposal'
  }

  const getButtonVariant = () => {
    if (hasSimulation) {
      return isSuccess ? 'default' : 'destructive'
    }
    return 'default'
  }

  const getErrorMessage = () => {
    if (!error) return ''

    // Handle different error formats
    if (typeof error === 'string') return error
    if (error.message) return error.message
    if (error.error?.message) return error.error.message

    // Fallback to stringified error
    try {
      return JSON.stringify(error, null, 2)
    } catch {
      return 'An unknown error occurred'
    }
  }

  // Get error message from failed simulation
  const getSimulationError = () => {
    if (!simulation || isSuccess) return null

    // Check for transaction error details
    const txError = simulation?.transaction?.error_message ||
                    simulation?.transaction?.error_info?.error_message ||
                    simulation?.transaction?.error_info?.message

    if (txError) return txError

    // Check simulation status
    if (simulation?.simulation?.status === false) {
      return 'Simulation failed. Check the transaction details on Tenderly for more information.'
    }

    return null
  }

  return (
    <div className="border-4 border-secondary rounded-3xl bg-background p-6">
      <div className="flex flex-col items-center text-center gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : hasSimulation ? (
            isSuccess ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-destructive" />
            )
          ) : (
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold">Simulate Proposal</h3>

        {/* Description */}
        {!isLoading && !hasSimulation && (
          <p className="text-sm text-muted-foreground max-w-md">
            Simulate your proposal to see the outcome of its execution. A report
            of its execution will be generated.
          </p>
        )}

        {/* Loading message */}
        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Please wait while the simulation executes
          </p>
        )}

        {/* Tenderly branding */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Powered by</span>
          <Tenderly height={24} width={80} />
        </div>

        {/* Simulate button */}
        <Button
          onClick={onSimulate}
          disabled={!isReady || isLoading || hasSimulation}
          variant={getButtonVariant()}
          className="w-full max-w-sm"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getButtonLabel()}
        </Button>

        {/* Error alert - API/Network errors */}
        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertTitle>Simulation Error</AlertTitle>
            <AlertDescription className="text-left break-words whitespace-pre-wrap font-mono text-xs mt-2">
              {getErrorMessage()}
            </AlertDescription>
          </Alert>
        )}

        {/* Error alert - Simulation transaction failed */}
        {!error && hasSimulation && !isSuccess && (
          <Alert variant="destructive" className="w-full">
            <AlertTitle>Transaction Failed</AlertTitle>
            <AlertDescription className="text-left break-words whitespace-pre-wrap font-mono text-xs mt-2">
              {getSimulationError()}
            </AlertDescription>
          </Alert>
        )}

        {/* Success/Failed - View on Tenderly */}
        {hasSimulation && simulation.simulation?.id && (
          <div className="flex flex-col items-center gap-2">
            <p className="font-semibold">
              View on{' '}
              <a
                href={TENDERLY_SHARING_URL(simulation.simulation.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Tenderly
                <ExternalArrowIcon />
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SimulateProposal
