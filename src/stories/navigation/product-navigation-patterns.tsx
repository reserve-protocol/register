import { useState, type ReactNode } from 'react'
import { Trans } from '@lingui/react/macro'
import { MessageCircle, X } from 'lucide-react'

import { Button, type ButtonSize } from '@/components/button'
import {
  DrawerClose,
  DrawerHeader,
  DrawerTitle,
} from '@/components/design-system-v1/drawer'
import {
  ProductNavigation,
  ProductNavigationIdentityTrigger,
  type NavigationDestination,
} from '@/components/design-system-v1/navigation'
import { v1Typography } from '@/components/design-system-v1/typography'
import { ChainBadgedLogo } from '@/components/entity-identity'
import { IconButton } from '@/components/icon-button'
import TokenLogo from '@/components/token-logo'
import { cn } from '@/lib/utils'

import {
  DTF_FIXTURES,
  PRODUCT_DESTINATIONS,
  getDtfSwitcherDestinations,
  type DtfFixture,
} from './navigation-review-fixtures'

export function DesktopProductNavigation({
  product,
  label,
  onDtfSelect,
  switcherDestinations = getDtfSwitcherDestinations(product.id),
  className,
}: {
  product: DtfFixture
  label: string
  onDtfSelect: (destination: NavigationDestination) => void
  switcherDestinations?: NavigationDestination[]
  className?: string
}) {
  const [isProductExpanded, setIsProductExpanded] = useState(false)
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
  const isRailExpanded = isProductExpanded || isSwitcherOpen
  const dismissProductRail = () => {
    setIsProductExpanded(false)
    setIsSwitcherOpen(false)
  }
  return (
    <div
      className={className}
      data-testid="product-navigation-rail-shell"
      onMouseEnter={() => setIsProductExpanded(true)}
      onMouseLeave={dismissProductRail}
      onFocusCapture={() => setIsProductExpanded(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          dismissProductRail()
      }}
    >
      <ProductNavigation
        currentId={isSwitcherOpen ? undefined : 'overview'}
        destinations={
          isSwitcherOpen ? switcherDestinations : PRODUCT_DESTINATIONS
        }
        expanded={isRailExpanded}
        identity={
          <ProductIdentity
            expanded={isRailExpanded}
            onToggle={() => setIsSwitcherOpen((current) => !current)}
            open={isSwitcherOpen}
            product={product}
          />
        }
        label={isSwitcherOpen ? 'Switch DTF' : label}
        onDestinationSelect={
          isSwitcherOpen
            ? (destination) => {
                onDtfSelect(destination)
                setIsSwitcherOpen(false)
              }
            : undefined
        }
        overflowFade={isSwitcherOpen}
        showDestinationChevron={!isSwitcherOpen}
      />
    </div>
  )
}

export function MobileProductNavigationActions({
  navigation,
  className,
  size = 'compact',
  primaryActionLabel = <Trans>Buy / Sell</Trans>,
  showChat = true,
}: {
  navigation: ReactNode
  className?: string
  size?: ButtonSize
  primaryActionLabel?: ReactNode
  showChat?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full bg-card/90 p-2 shadow-lg backdrop-blur-sm',
        className
      )}
      data-testid="mobile-product-actions"
    >
      {navigation}
      <Button size={size}>{primaryActionLabel}</Button>
      {showChat && (
        <IconButton
          size={size}
          label="Ask Reserve AI"
          icon={<MessageCircle aria-hidden="true" />}
        />
      )}
    </div>
  )
}

export function MobileProductNavigationPanel({
  product,
  isSwitcherOpen,
  onDtfSelect,
  onPageSelect,
  supplementary,
  switcherDestinations = getDtfSwitcherDestinations(product.id),
}: {
  product: DtfFixture
  isSwitcherOpen: boolean
  onDtfSelect: (destination: NavigationDestination) => void
  onPageSelect: () => void
  supplementary: ReactNode
  switcherDestinations?: NavigationDestination[]
}) {
  return (
    <ProductNavigation
      currentId={isSwitcherOpen ? undefined : 'overview'}
      destinations={
        isSwitcherOpen ? switcherDestinations : PRODUCT_DESTINATIONS
      }
      identity={
        <MobileMenuHeader
          label={isSwitcherOpen ? 'Switch DTF' : `${product.symbol} pages`}
        />
      }
      label={
        isSwitcherOpen ? 'Switch DTF' : `${product.symbol} page navigation`
      }
      onDestinationSelect={isSwitcherOpen ? onDtfSelect : onPageSelect}
      overflowFade={isSwitcherOpen}
      presentation="drawer"
      showDestinationChevron={!isSwitcherOpen}
      supplementary={isSwitcherOpen ? undefined : supplementary}
    />
  )
}

export const MobileMenuHeader = ({ label }: { label: string }) => (
  <DrawerHeader
    action={
      <DrawerClose asChild>
        <IconButton
          label={`Close ${label}`}
          icon={<X aria-hidden="true" />}
          size="compact"
          tone="quiet"
        />
      </DrawerClose>
    }
    data-slot="mobile-navigation-drawer-header"
  >
    <DrawerTitle
      className={cn(
        'flex min-h-8 min-w-0 items-center truncate',
        v1Typography.itemTitle
      )}
      data-slot="mobile-navigation-drawer-title"
    >
      {label}
    </DrawerTitle>
  </DrawerHeader>
)

// Keep the logo mounted so expansion cannot cancel a click on it.
const ProductIdentity = ({
  expanded = false,
  onToggle = () => undefined,
  open = false,
  presentation = 'rail',
  product = DTF_FIXTURES[0],
}: {
  expanded?: boolean
  onToggle?: () => void
  open?: boolean
  presentation?: 'rail' | 'menu'
  product?: DtfFixture
}) => (
  <ProductNavigationIdentityTrigger
    expanded={expanded}
    label={`Switch DTF, current ${product.symbol}`}
    onClick={onToggle}
    open={open}
    presentation={presentation}
    mark={
      <ChainBadgedLogo
        src={product.src}
        chain={product.chain}
        size={presentation === 'rail' ? 'lg' : 'md'}
        alt=""
        className={
          presentation === 'rail' && !expanded
            ? '[&>[data-testid=canonical-chain-badge]]:hidden'
            : undefined
        }
        mark={
          <TokenLogo
            address={product.address}
            alt=""
            chain={product.chain}
            data-testid={
              presentation === 'rail' && !expanded
                ? 'collapsed-product-identity-logo'
                : undefined
            }
            size={presentation === 'rail' ? 'lg' : 'md'}
            src={product.src}
            symbol={product.symbol}
          />
        }
      />
    }
    name={product.symbol}
  />
)
