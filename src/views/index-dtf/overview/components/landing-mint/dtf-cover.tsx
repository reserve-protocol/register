import { Button } from '@/components/ui/button'
import VideoModal from '@/components/video-modal'
import { cn } from '@/lib/utils'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { getYouTubeEmbedUrl } from '@/utils/youtube'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Play } from 'lucide-react'
import { useState } from 'react'

// Per-DTF animated cover thumbnails, keyed by symbol.
const DTF_COVER_VIDEOS: Record<string, string> = {
  PHOTON: '/imgs/PHOTON_Thumbnails.webm',
  BUILDOUT: '/imgs/BUILDOUT_Thumbnails.webm',
  NEOCLOUD: '/imgs/Neocloud_Thumbnails.webm',
  POWER: '/imgs/POWER_Thumbnails.webm',
}
const DEFAULT_DTF_COVER_VIDEO = DTF_COVER_VIDEOS.PHOTON

export const getDtfCoverVideo = (symbol: string | undefined) =>
  DTF_COVER_VIDEOS[symbol?.toUpperCase() ?? ''] ?? DEFAULT_DTF_COVER_VIDEO

export const getDtfCoverImage = (cover: string | undefined) => {
  const coverImage = cover?.trim()

  if (!coverImage) {
    return undefined
  }

  return coverImage
}

const DtfCover = ({
  className,
  showBrandImage = true,
}: {
  className?: string
  showBrandImage?: boolean
}) => {
  const { t } = useLingui()
  const brand = useAtomValue(indexDTFBrandAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  const video = brand?.dtf?.video?.trim()
  const coverImage = getDtfCoverImage(brand?.dtf?.cover)
  const playableVideo = video && getYouTubeEmbedUrl(video) ? video : undefined
  const coverVideo = getDtfCoverVideo(dtf?.token.symbol)
  const hasVideoCover = !!video && !!coverVideo
  const hasBrandCover = !hasVideoCover && showBrandImage && !!coverImage
  const videoTitle = dtf?.token.symbol ? (
    <Trans>{dtf.token.symbol} explainer</Trans>
  ) : (
    <Trans>Watch explainer</Trans>
  )
  const iframeTitle = dtf?.token.symbol
    ? t`${dtf.token.symbol} explainer`
    : t`DTF Explainer`

  if (!hasVideoCover && !hasBrandCover) {
    return null
  }

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-3xl bg-background',
        hasVideoCover ? 'aspect-video' : 'aspect-square',
        className
      )}
    >
      {hasVideoCover ? (
        <video
          src={coverVideo}
          className={cn(
            'block h-full w-full rounded-[inherit] object-cover transition-opacity duration-200',
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          )}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
        />
      ) : (
        <img
          src={coverImage}
          alt={dtf?.token.name ? t`${dtf.token.name} cover` : t`DTF cover`}
          className="block h-full w-full rounded-[inherit] object-cover"
          draggable={false}
        />
      )}
      {hasVideoCover && (
        <>
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle,hsl(var(--card)/0.1)_0%,hsl(var(--card)/0.9)_100%)]" />
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-opacity duration-200',
              isVideoLoaded ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
          >
            {playableVideo ? (
              <VideoModal
                video={playableVideo}
                title={videoTitle}
                iframeTitle={iframeTitle}
              >
                <Button className="gap-2 rounded-full border-2 border-white bg-white/50 px-5 text-primary hover:bg-white">
                  <Play className="h-4 w-4 " />
                  <Trans>Play video</Trans>
                </Button>
              </VideoModal>
            ) : (
              <Button
                className="pointer-events-none gap-2 rounded-full border-2 border-white bg-white/50 px-5 text-primary opacity-60"
                aria-disabled="true"
                disabled
                type="button"
              >
                <Play className="h-4 w-4 " />
                <Trans>Play video</Trans>
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default DtfCover
