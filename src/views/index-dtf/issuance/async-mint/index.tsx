import { cn } from '@/lib/utils'
import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import useTrackIndexDTFPage from '../../hooks/useTrackIndexDTFPage'
import { AsyncZapProvider } from './async-zap-context'
import { ordersExpandedAtom, resetWizardAtom, wizardStepAtom } from './atoms'
import GnosisRequired from './steps/gnosis-required'
import ConfigureMint from './steps/configure-mint'
import QuoteSummary from './steps/quote-summary'
import Success from './steps/success'

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
  const account = useAtomValue(walletAtom)
  const step = useAtomValue(wizardStepAtom)
  const ordersExpanded = useAtomValue(ordersExpandedAtom)
  const resetWizard = useSetAtom(resetWizardAtom)

  // Clear the wizard (step, amounts, toggle) when leaving the page. The SDK
  // execution lives in the provider and is torn down on unmount too, so on the
  // next visit everything starts fresh instead of showing the old input / a
  // completed mint.
  useEffect(() => () => resetWizard(), [resetWizard])

  // Every step past the intro depends on a connected wallet (balances, quotes,
  // execution). If it disconnects mid-flow the wizard would sit on a dead
  // screen, so send it back to the intro instead.
  useEffect(() => {
    if (!account) resetWizard()
  }, [account, resetWizard])

  if (!indexDTF) return null

  // quote-summary widens only when the orders panel is expanded; collapsing it
  // narrows the wizard to centered cards (like the configure step). success
  // stays wide through completion.
  const isWide =
    step === 'success' || (step === 'quote-summary' && ordersExpanded)

  return (
    <div className="container flex w-full bg-secondary rounded-4xl flex-col items-center justify-start gap-2">
      <div
        className={cn(
          'w-full mx-auto overflow-hidden rounded-3xl transition-[max-width] duration-500 ease-out',
          isWide
            ? 'max-w-[1200px] lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto'
            : 'max-w-[476px]'
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
