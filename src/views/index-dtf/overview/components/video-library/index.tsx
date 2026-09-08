import { Button } from '@/components/ui/button'
import DownloadableResources from '../dtf-downloadable-resources'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Trans, useLingui } from '@lingui/react/macro'
import { Play } from 'lucide-react'
import { useState } from 'react'
import { useVideoChapters, type VideoChapter } from './chapters'
import VideoSeriesModal from './series-modal'

const ChapterRow = ({
  chapter,
  onPlay,
}: {
  chapter: VideoChapter
  onPlay: () => void
}) => {
  const { t } = useLingui()

  return (
    <Button
      variant="ghost"
      size="inline"
      onClick={onPlay}
      aria-label={t`Play video: ${t(chapter.title)} (${chapter.duration})`}
      className="group flex w-full items-center justify-start gap-3 whitespace-normal rounded-xl p-2 text-left font-normal hover:bg-muted"
    >
      <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
        <img
          src={chapter.poster}
          alt=""
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:transition-none">
            <Play className="h-3.5 w-3.5 fill-current text-foreground" />
          </div>
        </div>
        <span className="absolute bottom-1 right-1 rounded-md bg-background/80 px-1.5 py-0.5 text-xs font-medium tabular-nums text-foreground">
          {chapter.duration}
        </span>
      </div>
      <div className="min-w-0">
        <h4 className="text-base font-medium">{t(chapter.title)}</h4>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
          {t(chapter.description)}
        </p>
      </div>
    </Button>
  )
}

const VideoLibrary = () => {
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')
  const chapters = useVideoChapters()
  const [openChapter, setOpenChapter] = useState<string | null>(null)

  const play = (id: string) => {
    setOpenChapter(id)
    trackClick('video_open', { video: id })
  }

  const close = () => {
    if (openChapter) trackClick('video_close', { video: openChapter })
    setOpenChapter(null)
  }

  return (
    <div
      data-testid="overview-video-library"
      className="rounded-3xl bg-card p-4"
    >
      <h3 className="px-2 pt-2 font-medium">
        <Trans>About this DTF</Trans>
      </h3>
      <p className="mb-2 px-2 text-sm leading-relaxed text-muted-foreground">
        <Trans>Learn more by watching these short videos.</Trans>
      </p>
      <div className="flex flex-col">
        {chapters.map((chapter) => (
          <ChapterRow
            key={chapter.id}
            chapter={chapter}
            onPlay={() => play(chapter.id)}
          />
        ))}
      </div>
      <div className="mt-3">
        <DownloadableResources className="bg-transparent sm:p-2 sm:pt-5" />
      </div>
      <VideoSeriesModal chapterId={openChapter} onClose={close} />
    </div>
  )
}

export default VideoLibrary
