import AudioEqualizerIcon from '@/components/icons/AudioEqualizerIcon'
import { Button } from '@/components/ui/button'
import VideoModal from '@/components/video-modal'
import { trackClick } from '@/hooks/useTrackPage'
import { cn } from '@/lib/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import type { MutableRefObject } from 'react'
import { TRANSCRIPT_LINE_HEIGHT } from './constants'
import type { HighlightedDTFItem } from './types'

export const TranscriptPreview = ({
  highlightedWords,
  selectedVersion,
  transcriptScrollOffset,
  transcriptWordRefs,
  transcriptWords,
}: {
  highlightedWords: number
  selectedVersion: HighlightedDTFItem
  transcriptScrollOffset: number
  transcriptWordRefs: MutableRefObject<(HTMLSpanElement | null)[]>
  transcriptWords: string[]
}) => {
  const { t } = useLingui()

  return (
    <div className="flex flex-col items-start gap-2 px-5 py-4 pt-3">
      <div
        className="w-full min-w-0 shrink-0 overflow-hidden"
        style={{ height: TRANSCRIPT_LINE_HEIGHT * 2 }}
      >
        <div
          className="min-w-full transition-transform duration-500 ease-out"
          style={{
            transform: `translate3d(0, -${transcriptScrollOffset}px, 0)`,
          }}
        >
          <p className="text-xs leading-[18px] text-legend">
            <span>&ldquo;</span>
            {transcriptWords.map((word, index) => (
              <span
                key={`${word}-${index}`}
                ref={(node) => {
                  transcriptWordRefs.current[index] = node
                }}
                className={cn(
                  'transition-colors',
                  index < highlightedWords &&
                    'text-primary dark:text-foreground'
                )}
              >
                {word}
                {index === transcriptWords.length - 1 ? '' : ' '}
              </span>
            ))}
            <span>&rdquo;</span>
          </p>
        </div>
      </div>
      {selectedVersion.video && (
        <VideoModal
          video={selectedVersion.video}
          title={<Trans>{selectedVersion.symbol} Explainer</Trans>}
          iframeTitle={t`${selectedVersion.symbol} Explainer`}
          onOpenChange={(open) => {
            if (open)
              trackClick(
                window.location.pathname.startsWith('/discover')
                  ? 'discover'
                  : 'home',
                'video',
                selectedVersion.address,
                selectedVersion.symbol,
                selectedVersion.chainId
              )
          }}
        >
          <Button
            data-card-action="video"
            variant="none"
            size="inline"
            className="group/video inline-flex shrink-0 items-center gap-1 bg-transparent p-0 text-xs text-muted-foreground underline decoration-transparent underline-offset-4 transition-colors hover:bg-transparent hover:text-primary hover:decoration-primary focus-visible:text-primary focus-visible:decoration-primary"
            aria-label={t`Watch ${selectedVersion.symbol} explainer`}
          >
            <span>
              <Trans>Watch Video</Trans>
            </span>
            <AudioEqualizerIcon className="h-3 w-0 shrink-0 opacity-0 transition-[width,opacity] duration-150 group-hover/video:w-3 group-hover/video:opacity-100 group-focus-visible/video:w-3 group-focus-visible/video:opacity-100 lg:group-hover:w-3 lg:group-hover:opacity-100 lg:group-focus-within:w-3 lg:group-focus-within:opacity-100" />
          </Button>
        </VideoModal>
      )}
    </div>
  )
}
