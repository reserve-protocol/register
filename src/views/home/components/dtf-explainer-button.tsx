import { Button } from '@/components/ui/button'
import VideoModal from '@/components/video-modal'
import { cn } from '@/lib/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { type ReactNode } from 'react'

const DTF_VIDEO_URL = 'https://www.youtube.com/watch?v=EL9OHjIab_w'

const DTFExplainerButton = ({
  className,
  children,
}: {
  className?: string
  children?: ReactNode
}) => {
  const { t } = useLingui()

  return (
    <VideoModal
      video={DTF_VIDEO_URL}
      title={
        <Trans>
          What is a <span className="text-primary">DTF</span>?
        </Trans>
      }
      iframeTitle={t`DTF Explainer`}
    >
      <Button
        variant="outline"
        className={cn('gap-1 text-legend p-6', className)}
      >
        {children ?? <Trans>Watch Explainer</Trans>}
      </Button>
    </VideoModal>
  )
}

export default DTFExplainerButton
