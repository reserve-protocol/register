import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import TokenLogo from '@/components/token-logo'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import useComplianceRestrictions from '@/hooks/use-compliance-restrictions'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  indexDTFStatusAtom,
} from '@/state/dtf/atoms'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { DTFMobilePagesMenuButton } from '@/views/index-dtf/components/navigation'
import { ROUTES } from '@/utils/constants'
import { Trans, useLingui } from '@lingui/react/macro'
import { useZapperModal } from '@reserve-protocol/react-zapper'
import { useAtomValue } from 'jotai'
import { MessageCircle, Wallet } from 'lucide-react'
import { ReactNode, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useParams } from 'react-router-dom'
import { formatEther } from 'viem'
import { useAccount, useBalance } from 'wagmi'
import EligibilityCard from './eligibility-card'

const RestrictionPopover = ({
  enabled,
  title,
  description,
  children,
}: {
  enabled: boolean
  title?: string
  description?: string
  children: ReactNode
}) => {
  if (!enabled) return <>{children}</>

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[260px] text-sm text-center">
        {title && <div className="mb-1 font-semibold">{title}</div>}
        {description}{' '}
        <a
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
          href="https://reserve.org/terms-and-conditions"
        >
          <Trans>Learn More</Trans>
        </a>
      </PopoverContent>
    </Popover>
  )
}

const DISABLED_BUTTON_CLASSES =
  'aria-disabled:!bg-muted aria-disabled:!text-muted-foreground aria-disabled:!border-transparent aria-disabled:cursor-not-allowed disabled:!bg-muted disabled:!text-muted-foreground disabled:!border-transparent'

// Opens the floating "Ask Reserve AI" chat. ReserveChat (@reserve-protocol/dtf-chat)
// has no imperative open API, so we trigger its launcher element directly.
const openReserveChat = () => {
  document
    .querySelector<HTMLElement>('[data-testid="reserve-chat-launcher"]')
    ?.click()
}

const IndexCTAsOverviewMobile = () => {
  const { t } = useLingui()
  const { open, setTab } = useZapperModal()
  const { chain, tokenId } = useParams()
  const { pathname } = useLocation()
  const isOverviewPage = pathname.endsWith('/overview')
  const currentPage = isOverviewPage
    ? 'overview'
    : (pathname.split('/').filter(Boolean).pop() ?? 'overview')
  const { trackClick } = useTrackIndexDTFClick(currentPage, currentPage)
  const dtf = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)
  const isDeprecated = isInactiveDTF(useAtomValue(indexDTFStatusAtom))
  const account = useAccount()
  const { isLoading, data: complianceData } = useComplianceRestrictions()
  const isRestricted = isLoading || complianceData?.restricted === true
  const isGeoRestricted = complianceData?.reason === 'geolocation-restricted'
  const { data: userBalanceData } = useBalance({
    address: account.address,
    chainId: dtf?.chainId,
    token: dtf?.id,
    query: {
      enabled: !!dtf?.id && !!account.address,
    },
  })
  const hasDtfBalance = useMemo(() => {
    if (userBalanceData === undefined) return false
    return Number(formatEther(userBalanceData.value)) > 0
  }, [userBalanceData])

  const renderTradeButton = (): ReactNode =>
    isGeoRestricted ? (
      <Dialog>
        <DialogTrigger asChild>
          <Button className="rounded-full h-10 w-auto shrink-0 px-5">
            <Trans>Verify eligibility</Trans>
          </Button>
        </DialogTrigger>
        <DialogContent className="p-1 bg-secondary border-none shadow-lg max-w-full sm:max-w-[420px] top-[100%] translate-y-[-100%] sm:top-[50%] sm:translate-y-[-50%] rounded-b-none rounded-t-3xl sm:rounded-3xl data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out">
          <DialogTitle className="sr-only">
            <Trans>Verify eligibility</Trans>
          </DialogTitle>
          <DialogDescription className="sr-only">
            <Trans>Request access to this product</Trans>
          </DialogDescription>
          <EligibilityCard className="bg-transparent p-0" />
        </DialogContent>
      </Dialog>
    ) : (
      <RestrictionPopover
        enabled={complianceData?.restricted === true}
        title={complianceData?.title}
        description={complianceData?.description}
      >
        <Button
          className={cn(
            'rounded-full h-10 w-auto shrink-0 px-5',
            DISABLED_BUTTON_CLASSES
          )}
          aria-disabled={isRestricted || undefined}
          onClick={() => {
            if (isRestricted) return
            trackClick(isDeprecated ? 'sell' : 'buy_sell')
            setTab(isDeprecated ? 'sell' : 'buy')
            open()
          }}
        >
          {isDeprecated ? <Trans>Sell</Trans> : <Trans>Buy / Sell</Trans>}
        </Button>
      </RestrictionPopover>
    )

  const renderCtas = (): ReactNode => (
    <div className="flex gap-2">
      <DTFMobilePagesMenuButton buttonClassName="rounded-full h-10 w-10 p-0" />
      {isOverviewPage && hasDtfBalance && (
        <Button
          asChild
          variant="outline"
          className="h-10 w-10 shrink-0 rounded-full p-0"
          aria-label={t`View portfolio`}
        >
          <Link to={ROUTES.PORTFOLIO}>
            <Wallet className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </Button>
      )}
      {isOverviewPage && renderTradeButton()}
      <Button
        variant="outline"
        className={
          isOverviewPage
            ? 'rounded-full h-10 w-auto shrink-0 px-3'
            : 'rounded-full h-10 w-auto shrink-0 gap-1.5 px-4'
        }
        aria-label={t`Ask Reserve AI`}
        onClick={() => {
          trackClick('ask-ai')
          openReserveChat()
        }}
      >
        <MessageCircle className="h-4 w-4" />
        {!isOverviewPage && <Trans>Ask Reserve AI</Trans>}
      </Button>
    </div>
  )

  const renderDtfLogo = (size: number): ReactNode =>
    dtf ? (
      <TokenLogo
        src={brand?.dtf?.icon || undefined}
        symbol={dtf.token.symbol}
        address={dtf.id}
        chain={dtf.chainId}
        width={size}
        height={size}
        className="shrink-0"
      />
    ) : null

  const overviewRoute =
    chain && tokenId ? `/${chain}/index-dtf/${tokenId}/overview` : undefined

  return (
    <>
      {/* Mobile (<sm): floating action bar */}
      {createPortal(
        <>
          <Link
            to={overviewRoute ?? '#'}
            aria-label={t`Go to DTF overview`}
            className="fixed bottom-2 left-2 z-40 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-card bg-card/80 p-2 shadow-[0_-16px_60px_rgba(0,0,0,0.18)] backdrop-blur-[7px] dark:shadow-[0_-20px_80px_rgba(0,0,0,0.76),0_0_0_1px_rgba(255,255,255,0.08)] lg:hidden"
          >
            {renderDtfLogo(40)}
          </Link>
          <div className="fixed bottom-2 right-2 z-40 w-fit shrink-0 rounded-full border border-card bg-card/80 p-2 shadow-[0_-16px_60px_rgba(0,0,0,0.18)] backdrop-blur-[7px] dark:shadow-[0_-20px_80px_rgba(0,0,0,0.76),0_0_0_1px_rgba(255,255,255,0.08)] lg:hidden">
            {renderCtas()}
          </div>
        </>,
        document.body
      )}
    </>
  )
}

export default IndexCTAsOverviewMobile
