import { useLingui } from '@lingui/react/macro'

// Zero-height wrapper: the bar rides on the border under the toolbar and moves no content.
const LoadingBar = ({ active }: { active: boolean }) => {
  const { t } = useLingui()

  if (!active) return null

  return (
    <div className="relative h-0">
      <div
        role="progressbar"
        aria-label={t`Loading...`}
        className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden"
        data-testid="explorer-progress"
      >
        <div className="h-full w-1/3 rounded-full bg-primary/70 animate-[explorer-progress_1.4s_ease-in-out_infinite] motion-reduce:w-full motion-reduce:animate-pulse" />
      </div>
    </div>
  )
}

export default LoadingBar
