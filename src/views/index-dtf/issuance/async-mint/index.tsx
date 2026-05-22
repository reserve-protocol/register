import useAtomicBatch from '@/hooks/use-atomic-batch'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import useTrackIndexDTFPage from '../../hooks/useTrackIndexDTFPage'
import { AsyncZapMintProvider } from './async-zap-context'
import { wizardStepAtom } from './atoms'
import { useAllocationData } from './hooks/use-collateral-allocation'
import GnosisRequired from './steps/gnosis-required'
import CollateralDecision from './steps/collateral-decision'
import ConfigureMint from './steps/configure-mint'
import TokenSelection from './steps/token-selection'
import AmountInput from './steps/amount-input'
import ReviewInputs from './steps/review-inputs'
import QuoteSummary from './steps/quote-summary'
import Processing from './steps/processing-v2'
import Success from './steps/success'

const WizardRouter = () => {
  const step = useAtomValue(wizardStepAtom)
  const { atomicSupported, isLoading } = useAtomicBatch()
  const setStep = useSetAtom(wizardStepAtom)

  // Auto-skip gnosis check when wallet supports atomic batch
  useEffect(() => {
    if (step === 'gnosis-check' && atomicSupported && !isLoading) {
      setStep('configure')
    }
  }, [step, atomicSupported, isLoading, setStep])

  if (isLoading) {
    return <Skeleton className="mx-auto w-full max-w-[468px] h-[400px]" />
  }

  switch (step) {
    case 'gnosis-check':
      return <GnosisRequired />
    case 'configure':
      return <ConfigureMint />
    case 'collateral-decision':
      return <CollateralDecision />
    case 'token-selection':
      return <TokenSelection />
    case 'amount-input':
      return <AmountInput />
    case 'review':
      return <ReviewInputs />
    case 'quote-summary':
      return <QuoteSummary />
    case 'processing':
      return <Processing />
    case 'success':
      return <Success />
    default:
      return <ConfigureMint />
  }
}

// Keeps balance/price syncing alive across all wizard steps
const DataSync = () => {
  useAllocationData()
  return null
}

const AsyncMintWizard = () => {
  useTrackIndexDTFPage('mint-async-wizard')
  const indexDTF = useAtomValue(indexDTFAtom)

  if (!indexDTF) return null

  return (
    <div className="container flex flex-col items-center justify-start gap-2 lg:min-h-[calc(100vh-100px)] w-full">
      <div className="flex flex-col w-full rounded-4xl">
        <div className="w-full mx-auto">
          <DataSync />
          <WizardRouter />
        </div>
      </div>
    </div>
  )
}

const AsyncMintWithProvider = () => {
  return (
    <AsyncZapMintProvider>
      <AsyncMintWizard />
    </AsyncZapMintProvider>
  )
}

export default AsyncMintWithProvider
