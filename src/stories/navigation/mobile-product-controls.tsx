import { useLayoutEffect, useRef, useState } from 'react'
import { useLingui } from '@lingui/react/macro'
import { EllipsisVertical } from 'lucide-react'
import { Button } from '@/components/button'
import { ProductNavigationMobileIdentityTrigger } from '@/components/design-system-v1/navigation'
import { productNavigationMessages } from '@/components/design-system-v1/product-navigation-messages'
import { IconButton } from '@/components/icon-button'
import TokenLogo from '@/components/token-logo'
import { cn } from '@/lib/utils'
import type { DtfFixture } from './navigation-review-fixtures'
import { MobileProductNavigationActions } from './product-navigation-patterns'

type ActionLayout = 'full' | 'short' | 'without-chat'

export function MobileProductControls({
  product,
  pagesOpen,
  switcherOpen,
  onOpenPages,
  onOpenSwitcher,
  onHeightChange,
  className,
}: {
  product: DtfFixture
  pagesOpen: boolean
  switcherOpen: boolean
  onOpenPages: (trigger: HTMLButtonElement) => void
  onOpenSwitcher: (trigger: HTMLButtonElement) => void
  onHeightChange?: (height: number) => void
  className?: string
}) {
  const { t } = useLingui()
  const root = useRef<HTMLDivElement>(null)
  const identity = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLButtonElement>(null)
  const fullProbe = useRef<HTMLButtonElement>(null)
  const shortProbe = useRef<HTMLButtonElement>(null)
  const [layout, setLayout] = useState<ActionLayout>('full')
  const fullLabel = t(productNavigationMessages.buySell)
  const shortLabel = t(productNavigationMessages.trade)

  useLayoutEffect(() => {
    const host = root.current
    const identityButton = identity.current
    const menuButton = menu.current
    const full = fullProbe.current
    const short = shortProbe.current
    const frame = menuButton?.parentElement
    if (!host || !identityButton || !menuButton || !full || !short || !frame)
      return
    const measure = () => {
      onHeightChange?.(host.getBoundingClientRect().height)
      const frameStyle = getComputedStyle(frame)
      const gap = parseFloat(frameStyle.columnGap)
      const fixedWidth =
        identityButton.getBoundingClientRect().width +
        menuButton.getBoundingClientRect().width * 2 +
        parseFloat(frameStyle.paddingLeft) +
        parseFloat(frameStyle.paddingRight) +
        gap * 2 +
        parseFloat(getComputedStyle(host).columnGap)
      const width = host.getBoundingClientRect().width
      const next =
        width >= 344 && fixedWidth + full.getBoundingClientRect().width <= width
          ? 'full'
          : width >= 320 &&
              fixedWidth + short.getBoundingClientRect().width <= width
            ? 'short'
            : 'without-chat'
      setLayout((current) => (current === next ? current : next))
    }
    const observer = new ResizeObserver(measure)
    for (const element of [host, identityButton, menuButton, full, short])
      observer.observe(element)
    measure()
    return () => observer.disconnect()
  }, [onHeightChange])

  return (
    <div
      ref={root}
      className={cn(
        'flex flex-wrap items-center justify-between gap-2',
        className
      )}
      data-action-layout={layout}
    >
      <ProductNavigationMobileIdentityTrigger
        ref={identity}
        className="pointer-events-auto"
        size="default"
        label={`Switch DTF, current ${product.symbol}`}
        mark={
          <TokenLogo
            address={product.address}
            alt=""
            chain={product.chain}
            width={44}
            height={44}
            src={product.src}
            symbol={product.symbol}
          />
        }
        open={switcherOpen}
        onClick={(event) => onOpenSwitcher(event.currentTarget)}
        aria-haspopup="dialog"
      />
      <MobileProductNavigationActions
        className="pointer-events-auto"
        size="default"
        primaryActionLabel={layout === 'full' ? fullLabel : shortLabel}
        showChat={layout !== 'without-chat'}
        navigation={
          <IconButton
            ref={menu}
            size="default"
            label={`Open ${product.symbol} page navigation`}
            aria-expanded={pagesOpen}
            aria-haspopup="dialog"
            icon={<EllipsisVertical aria-hidden="true" />}
            onClick={(event) => onOpenPages(event.currentTarget)}
          />
        }
      />
      <div
        aria-hidden="true"
        className="pointer-events-none invisible fixed left-0 top-0 h-0 w-0 overflow-hidden"
      >
        <Button ref={fullProbe} size="default" tabIndex={-1}>
          {fullLabel}
        </Button>
        <Button ref={shortProbe} size="default" tabIndex={-1}>
          {shortLabel}
        </Button>
      </div>
    </div>
  )
}
