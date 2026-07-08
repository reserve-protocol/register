import PancakeSwap from '@/components/icons/logos/PancakeSwap'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import VideoModal, { getYouTubeEmbedUrl } from '@/components/video-modal'
import { cn } from '@/lib/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { ChevronDown, Video } from 'lucide-react'
import type { DtfDexLink } from './landing-mint/external-dex-links'

const HOW_TO_BUY_DTF_VIDEO_URL = 'https://www.youtube.com/watch?v=vJMKgy36R04'

export const HowToBuyVideoButton = ({
  className,
  onOpen,
}: {
  className?: string
  onOpen: () => void
}) => {
  const { t } = useLingui()
  const hasVideo = !!getYouTubeEmbedUrl(HOW_TO_BUY_DTF_VIDEO_URL)

  return (
    <VideoModal
      video={HOW_TO_BUY_DTF_VIDEO_URL}
      title={<Trans>How to buy a DTF</Trans>}
      iframeTitle={t`How to buy a DTF`}
    >
      <Button
        variant="outline"
        className={cn(
          'h-12 shrink-0 gap-1.5 rounded-xl px-3 text-base font-normal text-muted-foreground hover:text-foreground',
          className
        )}
        aria-label={t`How to buy this DTF`}
        disabled={!hasVideo}
        onClick={() => {
          if (!hasVideo) return
          onOpen()
        }}
      >
        <Video strokeWidth={1.5} className="h-5 w-5" />
        <Trans>How to buy</Trans>
      </Button>
    </VideoModal>
  )
}

export const ExternalDexDropdown = ({
  className,
  links,
  onSelect,
}: {
  className?: string
  links: DtfDexLink[]
  onSelect: (link: DtfDexLink) => void
}) => {
  const { t } = useLingui()

  if (!links.length) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-12 shrink-0 gap-1.5 rounded-xl px-3 text-base font-normal text-muted-foreground hover:text-foreground',
            className
          )}
          aria-label={t`External trading venues`}
        >
          <Trans>External markets</Trans>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
        {links.map((link) => (
          <DropdownMenuItem key={link.url} className="rounded-lg" asChild>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onSelect(link)}
            >
              <PancakeSwap className="h-4 w-4" />
              <span>{link.label}</span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const SecondaryTradeActions = ({
  className,
  dexLinks,
  onExternalDex,
  onHowToBuy,
}: {
  className?: string
  dexLinks: DtfDexLink[]
  onExternalDex: (link: DtfDexLink) => void
  onHowToBuy: () => void
}) => (
  <div
    className={cn(
      'grid gap-2',
      dexLinks.length ? 'grid-cols-2' : 'grid-cols-1',
      className
    )}
  >
    <HowToBuyVideoButton className="w-full" onOpen={onHowToBuy} />
    <ExternalDexDropdown
      className="w-full"
      links={dexLinks}
      onSelect={onExternalDex}
    />
  </div>
)
