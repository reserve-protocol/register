import { Skeleton } from '@/components/ui/skeleton'
import VideoModal, { getYouTubeThumbnailUrl } from '@/components/video-modal'
import DownloadableResources from '../components/dtf-downloadable-resources'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Play } from 'lucide-react'

// The single explainer video, split into four digestible chapters. Copy is
// PLACEHOLDER and every chapter currently points at the DTF's one brand
// explainer video — swap in real per-chapter URLs (and copy) when the split
// videos are produced. Thumbnails derive from each chapter's YouTube URL, so
// they differentiate automatically once the URLs do.
type VideoChapter = {
  title: MessageDescriptor
  description: MessageDescriptor
  duration: string
  /** Chapter-specific YouTube URL; falls back to the brand explainer. */
  video?: string
}

const VIDEO_CHAPTERS: VideoChapter[] = [
  {
    title: msg`How do tokenized stock DTFs work?`,
    description: msg`Real shares held at a regulated US brokerage, on-chain.`,
    duration: '1:24',
  },
  {
    title: msg`Intro to $BUILDOUT`,
    description: msg`The basket, the thesis, and what one token represents.`,
    duration: '2:08',
  },
  {
    title: msg`What is Reserve?`,
    description: msg`The platform behind DTFs — and who's behind it.`,
    duration: '1:47',
  },
  {
    title: msg`Who can buy $BUILDOUT?`,
    description: msg`Availability, eligibility, and how to get started.`,
    duration: '2:31',
  },
]

const ChapterRow = ({
  chapter,
  video,
}: {
  chapter: VideoChapter
  video: string | undefined
}) => {
  const { t } = useLingui()
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')
  const source = chapter.video ?? video
  const thumbnail = source ? getYouTubeThumbnailUrl(source) : undefined

  const row = (
    <button
      type="button"
      disabled={!source}
      aria-label={t`Play video: ${t(chapter.title)} (${chapter.duration})`}
      className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:hover:bg-transparent"
    >
      <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            draggable={false}
            className="h-full w-full object-cover"
          />
        ) : (
          <Skeleton className="h-full w-full rounded-[inherit]" />
        )}
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

  if (!source) return row

  return (
    <VideoModal
      video={source}
      title={t(chapter.title)}
      iframeTitle={t(chapter.title)}
      onOpenChange={(open) => {
        trackClick(open ? 'video_open' : 'video_close', { video: source })
      }}
    >
      {row}
    </VideoModal>
  )
}

const StocksVideoLibrary = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)
  const video = brand?.dtf?.video?.trim() || undefined

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
        {dtf === undefined
          ? VIDEO_CHAPTERS.map((chapter) => (
              <div
                key={chapter.duration}
                className="flex items-center gap-3 p-2"
              >
                <Skeleton className="aspect-video w-32 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))
          : VIDEO_CHAPTERS.map((chapter) => (
              <ChapterRow
                key={chapter.duration}
                chapter={chapter}
                video={video}
              />
            ))}
      </div>
      <div className="mt-3">
        <DownloadableResources className="bg-transparent sm:p-2 sm:pt-5" />
      </div>
    </div>
  )
}

export default StocksVideoLibrary
