import { Button } from '@/components/ui/button'
import VideoModal from '@/components/video-modal'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '@/utils/youtube'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Play } from 'lucide-react'

export const DTF_COVER_WIDTH_CLASSNAME = 'w-[calc(100vw-900px)] max-w-[450px]'


const DtfCover = () => {
  const { t } = useLingui()
  const brand = useAtomValue(indexDTFBrandAtom)
  const dtf = useAtomValue(indexDTFAtom)

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


  return (
    <div className="relative overflow-hidden  rounded-4xl">
      <img
        src="/imgs/dtf-cover.webp"
        alt="dtf-cover"
        className="h-[283px] w-full object-cover dark:opacity-90"
        draggable={false}
      />
      {playableVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <VideoModal
            video={playableVideo}
            title={videoTitle}
            iframeTitle={iframeTitle}
          >
            <Button className="gap-2 rounded-full px-5 border-2 bg-[#D5DBE7] text-primary border-white hover:text-primary-foreground">
              <Play className="h-4 w-4 " />
              <Trans>Watch {dtf?.token.symbol}</Trans>
            </Button>
          </VideoModal>
        </div>
      )}
    </div>
  )
}

export default DtfCover
