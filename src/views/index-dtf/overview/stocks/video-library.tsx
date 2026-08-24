import DownloadableResources from '../components/dtf-downloadable-resources'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Trans, useLingui } from '@lingui/react/macro'
import { Play } from 'lucide-react'
import { useState } from 'react'
import { VIDEO_CHAPTERS, type VideoChapter } from './video-chapters'
import VideoSeriesModal from './video-series-modal'

const ChapterRow = ({
  chapter,
  onPlay,
}: {
  chapter: VideoChapter
  onPlay: () => void
}) => {
  const { t } = useLingui()

  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={t`Play video: ${t(chapter.title)} (${chapter.duration})`}
      className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        <h4 className="text-sm font-medium">{t(chapter.title)}</h4>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
          {t(chapter.description)}
        </p>
      </div>
    </button>
  )
}

const StocksVideoLibrary = () => {
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')
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
    <div data-testid="stocks-video-library" className="rounded-3xl bg-card p-4">
      <h3 className="mb-1 px-2 pt-2 font-medium">
        <Trans>About this DTF</Trans>
      </h3>
      {/* PLACEHOLDER basket summary, hardcoded for BUILDOUT — needs per-DTF
          sourcing (and a fact-check: the backend About copy describes
          semiconductors with a 10% cap) before another stocks DTF ships. */}
      <p className="mb-2 px-2 text-sm leading-relaxed text-muted-foreground">
        <Trans>
          $BUILDOUT is a basket of US-listed power companies at the center of
          the AI buildout weighted by market cap with a 20% cap and a $10B
          minimum market cap, rebalanced quarterly.
        </Trans>
      </p>
      <div className="flex flex-col">
        {VIDEO_CHAPTERS.map((chapter) => (
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

export default StocksVideoLibrary
