import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import VideoModal from '@/components/video-modal'
import { cn } from '@/lib/utils'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '@/utils/youtube'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Play } from 'lucide-react'
import { useEffect, useState } from 'react'

export const DTF_COVER_WIDTH_CLASSNAME = 'w-[calc(100vw-900px)] max-w-[450px]'

const COVER_CLASSNAME = `${DTF_COVER_WIDTH_CLASSNAME} aspect-square rounded-4xl`

const tryLoadImage = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = url

    const timeoutId = setTimeout(() => {
      reject(new Error('Image load timeout'))
    }, 5000)

    img.onload = () => {
      clearTimeout(timeoutId)
      resolve(url)
    }

    img.onerror = () => {
      clearTimeout(timeoutId)
      reject()
    }
  })
}

const DtfCover = () => {
  const { t } = useLingui()
  const brand = useAtomValue(indexDTFBrandAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const [isLoading, setIsLoading] = useState(true)
  const [imageUrl, setImageUrl] = useState<string>()

  const hasBrand = Boolean(brand)
  const video = brand?.dtf?.video?.trim()
  const cover = brand?.dtf?.cover?.trim()
  const videoThumbnail = video ? getYouTubeThumbnailUrl(video) : undefined
  const primaryImageUrl = cover || videoThumbnail
  const fallbackImageUrl =
    cover && videoThumbnail && cover !== videoThumbnail
      ? videoThumbnail
      : undefined
  const playableVideo = video && getYouTubeEmbedUrl(video) ? video : undefined
  const videoTitle = dtf?.token.symbol ? (
    <Trans>{dtf.token.symbol} explainer</Trans>
  ) : (
    <Trans>Watch explainer</Trans>
  )
  const iframeTitle = dtf?.token.symbol
    ? t`${dtf.token.symbol} explainer`
    : t`DTF Explainer`

  useEffect(() => {
    if (!hasBrand) {
      setImageUrl(undefined)
      setIsLoading(true)
      return
    }

    let cancelled = false

    const loadImage = async () => {
      setIsLoading(true)
      setImageUrl(undefined)

      const imageCandidates = [primaryImageUrl, fallbackImageUrl].filter(
        (imageCandidate): imageCandidate is string => Boolean(imageCandidate)
      )

      for (const imageCandidate of imageCandidates) {
        try {
          const loadedImageUrl = await tryLoadImage(imageCandidate)

          if (!cancelled) setImageUrl(loadedImageUrl)
          break
        } catch {
          continue
        }
      }

      if (!cancelled) {
        setIsLoading(false)
      }
    }

    loadImage()

    return () => {
      cancelled = true
    }
  }, [hasBrand, primaryImageUrl, fallbackImageUrl])

  if (!hasBrand || isLoading) {
    return <Skeleton className={COVER_CLASSNAME} />
  }

  if (!imageUrl) {
    return null
  }

  const isVideoThumbnail = imageUrl === videoThumbnail

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        isVideoThumbnail && 'group',
        COVER_CLASSNAME
      )}
    >
      <img
        src={imageUrl}
        alt=""
        className={cn(
          'h-full w-full object-cover',
          isVideoThumbnail && 'scale-[1.35]'
        )}
        draggable={false}
      />
      {isVideoThumbnail && playableVideo && (
        <div className="pointer-events-none absolute inset-0 bg-black/35 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />
      )}
      {playableVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <VideoModal
            video={playableVideo}
            title={videoTitle}
            iframeTitle={iframeTitle}
          >
            <Button className="gap-2 rounded-full px-5 shadow-lg">
              <Play className="h-4 w-4 fill-current" />
              <Trans>Watch explainer</Trans>
            </Button>
          </VideoModal>
        </div>
      )}
    </div>
  )
}

export default DtfCover
