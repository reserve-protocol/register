import useAtomicBatch from '@/hooks/use-atomic-batch'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import useTrackIndexDTFPage from '../../hooks/useTrackIndexDTFPage'
import { AsyncZapProvider } from './async-zap-context'
import { wizardStepAtom } from './atoms'
import GnosisRequired from './steps/gnosis-required'
import ConfigureMint from './steps/configure-mint'
import QuoteSummary from './steps/quote-summary'
import Success from './steps/success'
import { WizardStep } from './types'

// Steps that show the swaps/orders panel on the right and use the wide layout.
// quote-summary now drives the whole execution lifecycle in place (no separate
// processing step), so it stays wide through signing → orders → completion.
const WIDE_STEPS: WizardStep[] = ['quote-summary', 'success']

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
    case 'success':
      return <Success />
    default:
      return <ConfigureMint />
  }
}

// Keeps balance/price syncing alive across all wizard steps. The wrapper width
// animates between the narrow configure card and the wide quote/orders layout,
// so the right panel grows into view instead of snapping in.
const AsyncMintWizard = () => {
  useTrackIndexDTFPage('mint-async-wizard')
  const indexDTF = useAtomValue(indexDTFAtom)
  const step = useAtomValue(wizardStepAtom)

  if (!indexDTF) return null

  const isWide = WIDE_STEPS.includes(step)

  return (
    <div className="container flex flex-col items-center justify-start gap-2 lg:min-h-[calc(100vh-100px)] w-full">
      <div
        className={cn(
          'w-full mx-auto overflow-hidden rounded-3xl transition-[max-width] duration-500 ease-out',
          isWide ? 'max-w-[960px]' : 'max-w-[480px]'
        )}
      >
        <WizardRouter />
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
