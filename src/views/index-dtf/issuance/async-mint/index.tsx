import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import useTrackIndexDTFPage from '../../hooks/useTrackIndexDTFPage'
import { AsyncZapProvider } from './async-zap-context'
import { resetWizardAtom, wizardStepAtom } from './atoms'
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
  const resetWizard = useSetAtom(resetWizardAtom)

  // Clear the wizard (step, amounts, toggle) when leaving the page. The SDK
  // execution lives in the provider and is torn down on unmount too, so on the
  // next visit everything starts fresh instead of showing the old input / a
  // completed mint.
  useEffect(() => () => resetWizard(), [resetWizard])

  if (!indexDTF) return null

  const isWide = WIDE_STEPS.includes(step)

  return (
    <div className="container flex w-full bg-secondary rounded-4xl flex-col items-center justify-start gap-2 min-h-[calc(100vh-136px)] lg:min-h-[calc(100vh-100px)]">
      <div
        className={cn(
          'w-full mx-auto overflow-hidden rounded-3xl transition-[max-width] duration-500 ease-out',
          isWide
            ? 'max-w-[1200px] lg:max-h-[calc(100vh-100px)]'
            : 'max-w-[460px]'
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
