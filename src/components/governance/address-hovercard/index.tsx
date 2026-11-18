import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { useIsMobile } from '@/hooks/use-media-query'
import useRToken from '@/hooks/useRToken'
import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { Portal as HoverCardPortal } from '@radix-ui/react-hover-card'
import { useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Address } from 'viem'
import { IndexAddressProfile, YieldAddressProfile } from './address-profile-card'
import { needsFreshRead, type DtfType } from './address-profile'
import StandaloneAddressProfile, {
  type HovercardDtf,
} from './standalone-address-profile'
import { preloadGovernanceAccount } from './use-governance-account'

const GroupContext = createContext<readonly string[] | undefined>(undefined)

// Addresses shown as one list: hovering one preloads the others in one API call.
export const AddressHovercardGroup = ({
  addresses,
  children,
}: {
  addresses: readonly string[]
  children: ReactNode
}) => <GroupContext.Provider value={addresses}>{children}</GroupContext.Provider>

export type AddressHovercardSurface =
  | 'proposal_header'
  | 'proposal_list'
  | 'delegates'
  | 'votes'
  | 'explorer_proposals'

const AddressHovercard = ({
  address,
  surface,
  dtfType = 'index',
  dtf,
  eventAt,
  children,
  className,
}: {
  address: string
  surface: AddressHovercardSurface
  dtfType?: DtfType
  // Set outside a DTF page, where no DTF is loaded in state.
  dtf?: HovercardDtf
  // Unix seconds of the proposal shown next to the address.
  eventAt?: number
  children: ReactNode
  className?: string
}) => {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  // Keyboard users get the dialog on desktop too: a HoverCard keeps its content out of the tab order.
  const [asDialog, setAsDialog] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const indexDTF = useAtomValue(indexDTFAtom)
  const rToken = useRToken()
  const queryClient = useQueryClient()
  const group = useContext(GroupContext)
  // Checked when the read starts, so a page left open does not keep asking for fresh data.
  const isFresh = () => needsFreshRead(eventAt, Date.now() / 1000)
  const fresh = isFresh()
  const preload = () =>
    preloadGovernanceAccount(queryClient, {
      address,
      fresh: isFresh(),
      group,
    })

  const changeOpen = (next: boolean) => {
    if (next && !open) {
      // Same `tap` shape as useTrackIndexDTFClick, so Index boards keep working.
      const type = dtf?.type ?? dtfType
      mixpanel.track('tap', {
        page: dtf ? 'explorer' : type === 'index' ? 'governance' : 'yield_governance',
        subpage: surface,
        cta: 'address_profile',
        ca: dtf?.address ?? (type === 'index' ? indexDTF?.id : rToken?.address),
        ticker:
          dtf?.symbol ??
          (type === 'index' ? indexDTF?.token.symbol : rToken?.symbol),
        chain:
          dtf?.chainId ??
          (type === 'index' ? indexDTF?.chainId : rToken?.chainId),
        address,
      })
    }
    setOpen(next)
  }

  const card = (cardClassName?: string) => {
    if (dtf) {
      return (
        <StandaloneAddressProfile
          address={address as Address}
          dtf={dtf}
          fresh={fresh}
          className={cardClassName}
        />
      )
    }
    const Profile = dtfType === 'index' ? IndexAddressProfile : YieldAddressProfile
    return (
      <Profile
        address={address as Address}
        fresh={fresh}
        className={cardClassName}
      />
    )
  }

  const trigger = (
    <button
      type="button"
      ref={triggerRef}
      // WHY: the card opens 200 ms after the pointer arrives; the read starts now.
      onPointerEnter={() => {
        setAsDialog(false)
        preload()
      }}
      onFocus={preload}
      // WHY: HoverCard has no touch affordance, so a click also toggles it.
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        // `detail` is 0 when Enter or Space made the click.
        if (event.detail === 0) setAsDialog(true)
        changeOpen(!open)
      }}
      className={cn(
        'inline-flex min-w-0 items-center rounded-sm underline decoration-dashed decoration-legend underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      data-testid="address-hovercard-trigger"
    >
      {children}
    </button>
  )

  if (isMobile || asDialog) {
    return (
      <>
        {trigger}
        <Dialog open={open} onOpenChange={changeOpen}>
          <DialogContent
            ref={contentRef}
            // WHY: the first focusable is the copy button, whose tooltip would open on focus; the panel itself takes it.
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              contentRef.current?.focus()
            }}
            // WHY: the trigger is not a DialogTrigger, so Radix has nowhere to send focus back.
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              triggerRef.current?.focus()
            }}
            onClick={(event) => event.stopPropagation()}
            className="max-w-full gap-0 overflow-hidden focus:outline-none border-none bg-card p-0 shadow-lg sm:max-w-[420px] top-[100%] translate-y-[-100%] sm:top-[50%] sm:translate-y-[-50%] rounded-b-none rounded-t-3xl sm:rounded-3xl data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out"
          >
            <DialogTitle className="sr-only">
              <Trans>Address governance profile</Trans>
            </DialogTitle>
            <DialogDescription className="sr-only">
              <Trans>On-chain governance history for this address</Trans>
            </DialogDescription>
            {open && card('w-full')}
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <HoverCard open={open} onOpenChange={changeOpen} openDelay={200} closeDelay={120}>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      {/* WHY: rows layer their proposer link above the row link, which would paint over an inline card. */}
      <HoverCardPortal>
        <HoverCardContent
          // WHY: above or below the trigger the card was clipped near the page edges; Radix flips right to left when needed.
          side="right"
          align="start"
          collisionPadding={12}
          className="w-auto overflow-hidden rounded-3xl p-0"
          onClick={(event) => event.stopPropagation()}
        >
          {open && card()}
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  )
}

export default AddressHovercard
