import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Trans, useLingui } from '@lingui/react/macro'
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { VIDEO_CHAPTERS, type VideoChapter } from './video-chapters'

type Props = {
  chapterId: string | null
  onClose: () => void
}

const ChapterTab = ({
  chapter,
  index,
  active,
  onSelect,
}: {
  chapter: VideoChapter
  index: number
  active: boolean
  onSelect: () => void
}) => {
  const { t } = useLingui()

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={t`Play video: ${t(chapter.title)} (${chapter.duration})`}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'group flex min-w-0 flex-1 items-center gap-2 rounded-xl p-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active ? 'bg-muted' : 'hover:bg-muted/60'
      )}
    >
      <div className="relative aspect-video w-16 shrink-0 overflow-hidden rounded-md bg-muted sm:w-20">
        <img
          src={chapter.poster}
          alt=""
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover"
        />
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:transition-none">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background/80">
              <Play className="h-3 w-3 fill-current text-foreground" />
            </div>
          </div>
        )}
      </div>
      <div className="hidden min-w-0 sm:block">
        <p className="text-xs text-muted-foreground">
          {index + 1} · {chapter.duration}
        </p>
        <p
          className={cn(
            'truncate text-sm',
            active ? 'font-medium' : 'text-muted-foreground'
          )}
        >
          {t(chapter.title)}
        </p>
      </div>
    </button>
  )
}

// One modal for the whole series: plays the chapter that was clicked and lets
// the viewer step through the rest without closing. Chapter changes are
// tracked; the row click that opened the modal is tracked by the caller.
const VideoSeriesModal = ({ chapterId, onClose }: Props) => {
  const { t } = useLingui()
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!chapterId) return
    const initial = VIDEO_CHAPTERS.findIndex((c) => c.id === chapterId)
    setIndex(initial === -1 ? 0 : initial)
  }, [chapterId])

  const chapter = VIDEO_CHAPTERS[index]
  const hasPrev = index > 0
  const hasNext = index < VIDEO_CHAPTERS.length - 1

  const goTo = (next: number, reason: 'prev' | 'next' | 'tab' | 'ended') => {
    if (next < 0 || next >= VIDEO_CHAPTERS.length || next === index) return
    setIndex(next)
    trackClick('video_chapter', {
      video: VIDEO_CHAPTERS[next].id,
      from: chapter.id,
      reason,
    })
  }

  return (
    <Dialog
      open={!!chapterId}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        className="max-w-[95vw] gap-0 overflow-hidden p-0 sm:max-w-[960px]"
        showClose={false}
      >
        <div className="flex min-w-0 items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              <Trans>
                Video {index + 1} of {VIDEO_CHAPTERS.length}
              </Trans>
            </p>
            <DialogTitle className="truncate text-base font-semibold sm:text-lg">
              {t(chapter.title)}
            </DialogTitle>
          </div>
          <DialogClose className="shrink-0 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <X className="h-5 w-5" />
            <span className="sr-only">
              <Trans>Close</Trans>
            </span>
          </DialogClose>
        </div>
        <div className="aspect-video w-full min-w-0 bg-black">
          {/* key remounts the element so the new source autoplays cleanly
              instead of holding the previous chapter's playback state. */}
          <video
            key={chapter.id}
            src={chapter.src}
            poster={chapter.poster}
            controls
            autoPlay
            playsInline
            preload="metadata"
            onEnded={() => hasNext && goTo(index + 1, 'ended')}
            className="h-full w-full"
          />
        </div>
        <div className="flex min-w-0 items-center gap-2 border-t p-2 sm:p-3">
          <Button
            variant="ghost"
            size="icon-rounded"
            disabled={!hasPrev}
            aria-label={t`Previous video`}
            onClick={() => goTo(index - 1, 'prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex min-w-0 flex-1 gap-1">
            {VIDEO_CHAPTERS.map((c, i) => (
              <ChapterTab
                key={c.id}
                chapter={c}
                index={i}
                active={i === index}
                onSelect={() => goTo(i, 'tab')}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon-rounded"
            disabled={!hasNext}
            aria-label={t`Next video`}
            onClick={() => goTo(index + 1, 'next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VideoSeriesModal
