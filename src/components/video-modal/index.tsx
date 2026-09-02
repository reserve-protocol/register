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
import {
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

const YOUTUBE_EMBED_ORIGIN = 'https://www.youtube-nocookie.com'

const parsePlayerMessage = (data: unknown) => {
  if (typeof data === 'object' && data !== null) return data
  if (typeof data !== 'string') return undefined
  try {
    const parsed: unknown = JSON.parse(data)
    return typeof parsed === 'object' && parsed !== null ? parsed : undefined
  } catch {
    return undefined
  }
}

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
  onOpenChange,
  onPlay,
  children,
}: {
  video: string
  title?: ReactNode
  iframeTitle?: string
  aspectClassName?: string
  onOpenChange?: (open: boolean) => void
  onPlay?: () => void
  children: ReactElement
}) => {
  const { t } = useLingui()
  const embedUrl = getYouTubeEmbedUrl(video)
  const [open, setOpen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playedRef = useRef(false)
  const onPlayRef = useRef(onPlay)
  const hasOnPlay = Boolean(onPlay)
  onPlayRef.current = onPlay

  useEffect(() => {
    if (!open || !hasOnPlay || !iframeRef.current) return
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== YOUTUBE_EMBED_ORIGIN ||
        event.source !== iframeRef.current?.contentWindow
      )
        return
      const message = parsePlayerMessage(event.data) as
        | { event?: unknown; info?: unknown }
        | undefined
      if (
        message?.event === 'onStateChange' &&
        message.info === 1 &&
        !playedRef.current
      ) {
        playedRef.current = true
        onPlayRef.current?.()
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [open, embedUrl, hasOnPlay])

  if (!embedUrl) {
    return children
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (nextOpen) playedRef.current = false
        setOpen(nextOpen)
        onOpenChange?.(nextOpen)
      }}
    >
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
            ref={iframeRef}
            src={embedUrl}
            onLoad={() => {
              const player = iframeRef.current?.contentWindow
              player?.postMessage(
                JSON.stringify({ event: 'listening', id: 'reserve-video' }),
                YOUTUBE_EMBED_ORIGIN
              )
              player?.postMessage(
                JSON.stringify({
                  event: 'command',
                  func: 'addEventListener',
                  args: ['onStateChange'],
                  id: 'reserve-video',
                }),
                YOUTUBE_EMBED_ORIGIN
              )
            }}
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
