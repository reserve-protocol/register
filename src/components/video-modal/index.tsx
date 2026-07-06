import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { getYouTubeEmbedUrl } from '@/utils/youtube'
import { Trans, useLingui } from '@lingui/react/macro'
import { X } from 'lucide-react'
import { type ReactElement, type ReactNode } from 'react'

export {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  getYouTubeVideoId,
} from '@/utils/youtube'

const VideoModal = ({
  video,
  title,
  iframeTitle,
  // Match the source video's ratio so YouTube doesn't letterbox it. Defaults to
  // 16:9 (most DTF videos); pass an override for differently-sized ones.
  aspectClassName = 'aspect-video',
  children,
}: {
  video: string
  title?: ReactNode
  iframeTitle?: string
  aspectClassName?: string
  children: ReactElement
}) => {
  const { t } = useLingui()
  const embedUrl = getYouTubeEmbedUrl(video)

  if (!embedUrl) {
    return children
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-[960px] max-w-[95vw] p-0 gap-0 overflow-hidden"
        showClose={false}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            {title ?? iframeTitle ?? <Trans>Video</Trans>}
          </DialogTitle>
          <DialogClose className="rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring">
            <X className="h-5 w-5" />
            <span className="sr-only">
              <Trans>Close</Trans>
            </span>
          </DialogClose>
        </div>
        <div className={cn(aspectClassName, 'w-full bg-black')}>
          <iframe
            src={embedUrl}
            title={iframeTitle ?? t`Video`}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VideoModal
