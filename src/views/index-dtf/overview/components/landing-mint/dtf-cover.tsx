import { Button } from '@/components/ui/button'
import VideoModal from '@/components/video-modal'
import { cn } from '@/lib/utils'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { getYouTubeEmbedUrl } from '@/utils/youtube'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Play } from 'lucide-react'
import { useState } from 'react'

const DTF_COVER_VIDEO = '/imgs/Neocloud_Thumbnails.webm'

const DtfCover = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const brand = useAtomValue(indexDTFBrandAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  const video = brand?.dtf?.video?.trim()
  const playableVideo = video && getYouTubeEmbedUrl(video) ? video : undefined
  const videoTitle = dtf?.token.symbol ? (
    <Trans>{dtf.token.symbol} explainer</Trans>
  ) : (
    <Trans>Watch explainer</Trans>
  )
  const iframeTitle = dtf?.token.symbol
    ? t`${dtf.token.symbol} explainer`
    : t`DTF Explainer`

  if (!brand?.dtf?.video) {
    return null
  }

  return (
    <div
      className={cn(
        'relative isolate aspect-video overflow-hidden rounded-3xl bg-background hidden xl:block',
        className
      )}
    >
      <video
        src={DTF_COVER_VIDEO}
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
              <Trans>Watch {dtf?.token.symbol}</Trans>
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
            <Trans>Watch {dtf?.token.symbol}</Trans>
          </Button>
        )}
      </div>
    </div>
  )
}

export default DtfCover
