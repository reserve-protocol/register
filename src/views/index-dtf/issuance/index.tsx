import { devModeAtom } from '@/state/atoms'
import { wagmiConfig } from '@/state/chain'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { indexDTFAtom, indexDTFStatusAtom } from '@/state/dtf/atoms'
import { getFolioRoute } from '@/utils'
import { RESERVE_API, ROUTES, ZAPPER_API } from '@/utils/constants'
import { ZapperProps } from '@reserve-protocol/react-zapper'
import { atom, useAtomValue } from 'jotai'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ZapperWrapper from '../components/zapper/zapper-wrapper'
import useTrackIndexDTFPage, {
  useTrackIndexDTFClick,
} from '../hooks/useTrackIndexDTFPage'
import { inputTokenAtom } from './async-mint/atoms'

const DTF_DISABLED_FOR_ZAP = [] as string[]
const LARGE_ORDER_USD_THRESHOLD = 50_000

const LargeOrderAsyncCompareCard = ({
  mintRoute,
  inputSymbol,
  onCompare,
  onDismiss,
}: {
  mintRoute: string
  inputSymbol: string
  onCompare: () => void
  onDismiss: () => void
}) => (
  <div className="flex w-full animate-[large-order-card-in_180ms_ease-out] flex-col justify-between rounded-3xl border-2 border-transparent bg-background bg-clip-padding p-6 text-left sm:w-[420px] lg:absolute lg:bottom-6 lg:left-full lg:top-6 lg:z-10 lg:w-[260px] lg:rounded-bl-none lg:rounded-tl-none lg:animate-[large-order-card-slide-out_360ms_ease-out]">
    <div className="flex items-center justify-between gap-3">
      <div className="mb-3 inline-flex h-6 items-center rounded-full border border-warning/30 bg-warning/10 px-2.5 text-[11px] font-medium text-warning">
        Over $50K
      </div>
      <button
        type="button"
        className="mb-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={onDismiss}
        aria-label="Dismiss Automated Mint suggestion"
      >
        <X size={14} />
      </button>
    </div>
    <div className="min-w-0">
      <div className="text-sm font-semibold text-foreground">
        Large orders may benefit from Automated Mint
      </div>
      <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
        Your {inputSymbol} input is over $50K. Automated Mint may find a better
        route by splitting it across the basket before minting.
      </p>
      <Link
        to={mintRoute}
        onClick={onCompare}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex h-8 items-center justify-center rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground no-underline transition-colors hover:bg-primary/90"
        aria-label="Try Automated Mint"
      >
        Try Automated Mint
      </Link>
    </div>
  </div>
)

export const indexDTFQuoteSourceAtom = atom<ZapperProps['defaultSource']>(
  (get) => {
    // const dtf = get(indexDTFAtom)
    // if (dtf?.id && DTF_DISABLED_FOR_ZAP.includes(dtf?.id.toLowerCase())) {
    //   return 'odos'
    // }
    // return 'best'
    return 'best'
  }
)

const IndexDTFIssuance = () => {
  useTrackIndexDTFPage('mint')
  const indexDTF = useAtomValue(indexDTFAtom)
  const quoteSource = useAtomValue(indexDTFQuoteSourceAtom)
  const devMode = useAtomValue(devModeAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const isDeprecated = isInactiveDTF(useAtomValue(indexDTFStatusAtom))
  const { trackClick } = useTrackIndexDTFClick('overview', 'mint')
  const [dismissedLargeOrderCard, setDismissedLargeOrderCard] = useState(false)
  const [zapInputValue, setZapInputValue] = useState(0)
  const isLargeZapInput = zapInputValue >= LARGE_ORDER_USD_THRESHOLD
  const showLargeOrderCompareCard = isLargeZapInput && !dismissedLargeOrderCard

  useEffect(() => {
    if (!isLargeZapInput) {
      setDismissedLargeOrderCard(false)
    }
  }, [isLargeZapInput])

  if (!indexDTF) return null

  const automatedMintRoute = getFolioRoute(
    indexDTF.id,
    indexDTF.chainId,
    ROUTES.ISSUANCE + '/automated'
  )

  return (
    <div className="container">
      <div className="flex flex-col items-center justify-start sm:justify-center gap-2 lg:bg-secondary sm:min-h-[calc(100vh-136px)] lg:min-h-[calc(100vh-80px)] rounded-4xl lg:mr-2 ">
        <div className="relative flex w-full flex-col items-center gap-3 rounded-4xl sm:w-[420px] lg:gap-0">
          <div className="w-full rounded-3xl border-2 border-secondary bg-card p-2 sm:w-[420px]">
            <ZapperWrapper
              wagmiConfig={wagmiConfig}
              chain={indexDTF.chainId}
              dtfAddress={indexDTF.id}
              mode="inline"
              apiUrl={RESERVE_API}
              zapperApiUrl={ZAPPER_API}
              debug={devMode}
              defaultSource={quoteSource}
              sellOnly={isDeprecated}
              onInputValueChange={setZapInputValue}
            />
          </div>
          {showLargeOrderCompareCard && (
            <LargeOrderAsyncCompareCard
              mintRoute={automatedMintRoute}
              inputSymbol={inputToken.symbol}
              onCompare={() => trackClick('compare_automated_mint')}
              onDismiss={() => setDismissedLargeOrderCard(true)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default IndexDTFIssuance
