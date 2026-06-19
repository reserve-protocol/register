import { Button } from '@/components/ui/button'
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
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import useComplianceRestrictions from '@/hooks/use-compliance-restrictions'
import { indexDTFStatusAtom } from '@/state/dtf/atoms'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Trans } from '@lingui/react/macro'
import { useZapperModal } from '@reserve-protocol/react-zapper'
import { useAtomValue } from 'jotai'
import { Sparkles } from 'lucide-react'
import { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import EligibilityCard from './eligibility-card'

const RestrictionPopover = ({
  enabled,
  children,
}: {
  enabled: boolean
  children: ReactNode
}) => {
  if (!enabled) return <>{children}</>

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[260px] text-sm text-center">
        <Trans>
          This product isn't available in your region due to local restrictions.{' '}
          <a
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
            href="https://reserve.org/terms-and-conditions"
          >
            Learn More
          </a>
        </Trans>
      </PopoverContent>
    </Popover>
  )
}

const DISABLED_BUTTON_CLASSES =
  'aria-disabled:!bg-muted aria-disabled:!text-muted-foreground aria-disabled:!border-transparent aria-disabled:cursor-not-allowed disabled:!bg-muted disabled:!text-muted-foreground disabled:!border-transparent'

// Opens the floating "Ask Reserve AI" chat. ReserveChat (@reserve-protocol/dtf-chat)
// has no imperative open API, so we trigger its launcher element directly. On the
// mobile overview the launcher is hidden but kept mounted (see src/components/dtf-chat),
// so this click still opens the panel.
const openReserveChat = () => {
  document
    .querySelector<HTMLElement>('[data-testid="reserve-chat-launcher"]')
    ?.click()
}

const IndexCTAsOverviewMobile = () => {
  const { open, setTab } = useZapperModal()
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')
  const isDeprecated = isInactiveDTF(useAtomValue(indexDTFStatusAtom))
  const { isLoading, data: complianceData } = useComplianceRestrictions()
  const isRestricted = isLoading || complianceData?.restricted === true
  const isGeoRestricted = complianceData?.reason === 'geolocation-restricted'

  // Shared CTA content, rendered both inline (tablet/desktop) and inside the
  // mobile floating bar. `buttonClassName` controls the sizing per placement.
  const renderCtas = (buttonClassName: string): ReactNode =>
    isGeoRestricted ? (
      <Dialog>
        <DialogTrigger asChild>
          <Button className={buttonClassName}>
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
      <div className="flex gap-2">
        <RestrictionPopover enabled={isRestricted}>
          <Button
            className={`${buttonClassName} ${DISABLED_BUTTON_CLASSES}`}
            variant="outline"
            aria-disabled={isRestricted || undefined}
            onClick={() => {
              if (isRestricted) return
              trackClick('sell')
              setTab('sell')
              open()
            }}
          >
            <Trans>SELL</Trans>
          </Button>
        </RestrictionPopover>
        <RestrictionPopover enabled={isRestricted}>
          <Button
            className={`${buttonClassName} ${DISABLED_BUTTON_CLASSES}`}
            aria-disabled={isRestricted || undefined}
            disabled={isDeprecated && !isRestricted}
            onClick={() => {
              if (isRestricted || isDeprecated) return
              trackClick('buy')
              setTab('buy')
              open()
            }}
          >
            <Trans>BUY</Trans>
          </Button>
        </RestrictionPopover>
      </div>
    )

  return (
    <>
      {/* Tablet / small desktop (sm..<xl): inline CTAs — unchanged behavior */}
      <div className="hidden sm:block w-full">
        {renderCtas('rounded-3xl h-8 w-full')}
      </div>

      {/* Mobile (<sm): white "Ask Reserve AI" button replaces the inline CTAs */}
      <div className="flex sm:hidden justify-end">
        <Button
          variant="none"
          className="rounded-3xl h-8 px-3 gap-1.5 bg-white text-primary border border-border hover:bg-white/90"
          onClick={() => {
            trackClick('ask-ai')
            openReserveChat()
          }}
        >
          <Sparkles className="h-4 w-4" />
          <Trans>Ask Reserve AI</Trans>
        </Button>
      </div>

      {/* Mobile (<sm): floating full-width BUY/SELL bar, pinned above the nav */}
      {createPortal(
        <div className="fixed inset-x-0 bottom-16 z-40 sm:hidden border-t bg-background p-3">
          {renderCtas('rounded-xl h-12 w-full')}
        </div>,
        document.body
      )}
    </>
  )
}

export default IndexCTAsOverviewMobile
