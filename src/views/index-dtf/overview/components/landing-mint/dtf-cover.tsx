import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import VideoModal from '@/components/video-modal'
import { cn } from '@/lib/utils'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  indexDTFBrandExtrasResolvedAtom,
} from '@/state/dtf/atoms'
import { getYouTubeEmbedUrl } from '@/utils/youtube'
import { useTrackIndexDTFClick } from '../../../hooks/useTrackIndexDTFPage'
import { Trans, useLingui } from '@lingui/react/macro'
import { atom, useAtom, useAtomValue } from 'jotai'
import { Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// Once the explainer modal has been opened, the looping cover freezes on its
// current frame so it doesn't keep animating behind the modal or after it
// closes. Keyed by DTF address: the mobile and desktop covers are both mounted
// and must freeze together, and a different DTF's cover should still loop.
// The overview page clears it on unmount so a fresh visit loops again.
export const watchedCoverDtfAtom = atom<string | null>(null)

// Touch "hover" is sticky (tap fires mouseenter, mouseleave never comes), so
// the play-while-hovered affordance is for real pointers only.
const canHover = () => window.matchMedia('(hover: hover)').matches

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

// Brand data hasn't resolved yet — hold the video-cover footprint (assume a
// video, our featured DTFs all have one) so the column doesn't jump when the
// real cover arrives.
export const DtfCoverSkeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'relative aspect-video overflow-hidden rounded-3xl',
      className
    )}
  >
    <Skeleton className="h-full w-full rounded-[inherit]" />
    <div className="absolute inset-0 flex items-center justify-center">
      <Skeleton className="h-10 w-36 rounded-full" />
    </div>
  </div>
)

const DtfCover = ({
  className,
  showBrandImage = true,
}: {
  className?: string
  showBrandImage?: boolean
}) => {
  const { t } = useLingui()
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')
  const brand = useAtomValue(indexDTFBrandAtom)
  const brandExtrasResolved = useAtomValue(indexDTFBrandExtrasResolvedAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [coverSettled, setCoverSettled] = useState(false)
  const coverPainted = isVideoLoaded || isImageLoaded

  // Drop the skeleton layers entirely once the fade-in completes — leaving
  // them mounted let the pulse bleed through covers with transparency. Timer
  // instead of transitionend so motion-reduce (no transition) settles too.
  useEffect(() => {
    if (!coverPainted) return
    const timer = setTimeout(() => setCoverSettled(true), 500)
    return () => clearTimeout(timer)
  }, [coverPainted])
  const [watchedCoverDtf, setWatchedCoverDtf] = useAtom(watchedCoverDtfAtom)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isCoverFrozen = !!dtf && watchedCoverDtf === dtf.id

  useEffect(() => {
    if (isCoverFrozen) videoRef.current?.pause()
  }, [isCoverFrozen])

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

  // Two loading phases: brand not yet set, or brand set from the SDK payload
  // (which can omit `video`) with the authoritative folio-manager read still
  // in flight. Collapsing in between made the cover flap out and back in.
  const isBrandLoading =
    brand === undefined || (!hasVideoCover && !brandExtrasResolved)

  if (!isBrandLoading && !hasVideoCover && !hasBrandCover) {
    return null
  }

  // The skeleton assumes a 16:9 video cover; image-only DTFs are square, so
  // the container's aspect-ratio animates between the two instead of snapping.
  const showsSquareImage = !isBrandLoading && hasBrandCover

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-3xl bg-background',
        'transition-[aspect-ratio] duration-500 ease-out motion-reduce:transition-none',
        showsSquareImage ? 'aspect-square' : 'aspect-video',
        className
      )}
      // Frozen covers loop again while hovered and refreeze on leave — a
      // handler on the video itself would be swallowed by the button overlay.
      onMouseEnter={() => {
        if (isCoverFrozen && canHover())
          videoRef.current?.play().catch(() => {})
      }}
      onMouseLeave={() => {
        if (isCoverFrozen) videoRef.current?.pause()
      }}
    >
      {/* The cover paints at opacity-0 until it has pixels (video first frame
          or image load). The base shimmer stays FULLY opaque underneath so the
          cover fades in over a flat surface — cross-fading both layers made
          them visibly blend mid-fade. The play-button ghost exits early: the
          moment we know the cover is an image, or the real button takes over. */}
      {!coverSettled && (
        <>
          <Skeleton className="absolute inset-0 rounded-[inherit]" />
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-opacity duration-300 motion-reduce:transition-none',
              showsSquareImage || coverPainted ? 'opacity-0' : 'opacity-100'
            )}
          >
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
        </>
      )}
      {hasVideoCover ? (
        <video
          ref={videoRef}
          src={coverVideo}
          className={cn(
            'block h-full w-full rounded-[inherit] object-cover transition-opacity duration-500 motion-reduce:transition-none',
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          )}
          autoPlay={!isCoverFrozen}
          preload="auto"
          muted
          loop
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
        />
      ) : showsSquareImage ? (
        <img
          src={coverImage}
          alt={dtf?.token.name ? t`${dtf.token.name} cover` : t`DTF cover`}
          className={cn(
            'block h-full w-full rounded-[inherit] object-cover transition-opacity duration-500 motion-reduce:transition-none',
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          draggable={false}
          onLoad={() => setIsImageLoaded(true)}
        />
      ) : null}
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
                onOpenChange={(open) => {
                  if (open) {
                    if (dtf) setWatchedCoverDtf(dtf.id)
                    trackClick('video_open', { video: playableVideo })
                  } else {
                    trackClick('video_close', { video: playableVideo })
                  }
                }}
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
