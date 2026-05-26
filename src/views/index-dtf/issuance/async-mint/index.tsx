import useAtomicBatch from '@/hooks/use-atomic-batch'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import useTrackIndexDTFPage from '../../hooks/useTrackIndexDTFPage'
import { AsyncZapProvider } from './async-zap-context'
import { wizardStepAtom } from './atoms'
import GnosisRequired from './steps/gnosis-required'
import ConfigureMint from './steps/configure-mint'
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
const AsyncMintWizard = () => {
  useTrackIndexDTFPage('mint-async-wizard')
  const indexDTF = useAtomValue(indexDTFAtom)

  if (!indexDTF) return null

  return (
    <div className="container flex flex-col items-center justify-start gap-2 lg:min-h-[calc(100vh-100px)] w-full">
      <div className="flex flex-col w-full rounded-4xl">
        <div className="w-full mx-auto">
          <WizardRouter />
        </div>
      </div>
    </div>
  )
}

const AsyncMintWithProvider = () => {
  return (
    <AsyncZapProvider>
      <AsyncMintWizard />
    </AsyncZapProvider>
  )
}

export default AsyncMintWithProvider
