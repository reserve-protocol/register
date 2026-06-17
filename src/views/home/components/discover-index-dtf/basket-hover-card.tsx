import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { Trans } from '@lingui/react/macro'
import { forwardRef, useState } from 'react'
import { useMeasuredMarquee } from '../../hooks/use-measured-marquee'

const SCROLL_PIXELS_PER_SECOND = 72
const EASE_IN_SECONDS = 1.2

interface BasketHoverCardProps {
  indexDTF: IndexDTFItem
  children: React.ReactNode
}

const CollateralAssetItem = ({
  token,
}: {
  token: IndexDTFItem['basket'][number]
}) => (
  <div className="flex shrink-0 items-center gap-1 rounded-full px-1.5 py-1">
    <span className="ml-1 text-sm text-foreground">${token.symbol}</span>
    <span className="text-sm text-legend">{token.weight || '0'}%</span>
  </div>
)

const SequenceItems = forwardRef<
  HTMLDivElement,
  {
    assets: IndexDTFItem['basket']
    first?: boolean
  }
>(({ assets, first }, ref) => (
  <div ref={ref} className={first ? 'flex shrink-0 pl-2' : 'flex shrink-0'}>
    <div className="flex shrink-0 items-center rounded-full px-1.5 py-1">
      <span className="text-sm text-legend">
        <Trans>Exposure:</Trans>
      </span>
    </div>
    {assets.map((token) => (
      <CollateralAssetItem key={token.address} token={token} />
    ))}
  </div>
))
SequenceItems.displayName = 'SequenceItems'

export function BasketHoverCard({ indexDTF, children }: BasketHoverCardProps) {
  const [open, setOpen] = useState(false)
  const exposureAssets = indexDTF.basket
  const { repeatCount, sequenceRef, viewportRef } = useMeasuredMarquee({
    active: open,
    easeInSeconds: EASE_IN_SECONDS,
    itemCount: exposureAssets.length,
    pixelsPerSecond: SCROLL_PIXELS_PER_SECOND,
  })

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className="w-[300px] overflow-hidden rounded-full border-secondary bg-card p-0"
        side="bottom"
        align="start"
        sideOffset={8}
      >
        <div className="relative overflow-hidden rounded-full border border-card py-2">
          <div ref={viewportRef} className="flex overflow-hidden">
            <div className="flex w-max gap-0">
              {Array.from({ length: repeatCount }).map((_, groupIndex) => (
                <SequenceItems
                  ref={groupIndex === 0 ? sequenceRef : undefined}
                  key={groupIndex}
                  assets={exposureAssets}
                  first={groupIndex === 0}
                />
              ))}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
