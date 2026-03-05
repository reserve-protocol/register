import useAtomicBatch from '@/hooks/use-atomic-batch'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import useTrackIndexDTFPage from '../../hooks/useTrackIndexDTFPage'
import { GlobalProtocolKitProvider } from '../async-swaps/providers/GlobalProtocolKitProvider'
import { mintSharesAtom, wizardStepAtom } from './atoms'
import { useAllocationData } from './hooks/use-collateral-allocation'
import GnosisRequired from './steps/gnosis-required'
import OperationSelect from './steps/operation-select'
import CollateralDecision from './steps/collateral-decision'
import TokenSelection from './steps/token-selection'
import AmountInput from './steps/amount-input'
import ReviewInputs from './steps/review-inputs'
import QuoteSummary from './steps/quote-summary'
import Processing from './steps/processing'
import RecoveryOptions from './steps/recovery-options'
import Success from './steps/success'

const WizardRouter = () => {
  const step = useAtomValue(wizardStepAtom)
  const { atomicSupported, isLoading } = useAtomicBatch()
  const setStep = useSetAtom(wizardStepAtom)

  // Auto-skip gnosis check when wallet supports atomic batch
  useEffect(() => {
    if (step === 'gnosis-check' && atomicSupported && !isLoading) {
      setStep('operation-select')
    }
  }, [step, atomicSupported, isLoading, setStep])

  if (isLoading) {
    return <Skeleton className="mx-auto w-full max-w-[468px] h-[400px]" />
  }

  switch (step) {
    case 'gnosis-check':
      return <GnosisRequired />
    case 'operation-select':
      return <OperationSelect />
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
    case 'recovery-options':
      return <RecoveryOptions />
    case 'success':
      return <Success />
    default:
      return <OperationSelect />
  }
}

// Keeps balance/price syncing alive across all wizard steps
const DataSyncInner = () => {
  useAllocationData()
  return null
}

const DataSync = () => {
  const mintShares = useAtomValue(mintSharesAtom)
  if (mintShares === 0n) return null
  return <DataSyncInner />
}

const AsyncMintWizard = () => {
  useTrackIndexDTFPage('mint-async-wizard')
  const indexDTF = useAtomValue(indexDTFAtom)

  if (!indexDTF) return null

  return (
    <div className="container flex flex-col items-center sm:justify-start md:justify-center gap-2 lg:border-2 lg:border-secondary lg:bg-secondary/30 lg:min-h-[calc(100vh-100px)] dark:bg-card rounded-4xl w-full">
      <div className="flex flex-col w-fit rounded-4xl p-1">
        <div className="w-full max-w-[468px] mx-auto">
          <DataSync />
          <WizardRouter />
        </div>
      </div>
    </div>
  )
}

const AsyncMintWithProvider = () => {
  return (
    <GlobalProtocolKitProvider>
      <AsyncMintWizard />
    </GlobalProtocolKitProvider>
  )
}

export default AsyncMintWithProvider
