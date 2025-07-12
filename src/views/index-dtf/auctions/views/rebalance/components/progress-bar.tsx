interface ProgressBarProps {
  expectedProgress: number // 0-100
  currentProgress: number // 0-100
  className?: string
}

export default function ProgressBar({
  expectedProgress,
  currentProgress,
  className = '',
}: ProgressBarProps) {
  const segmentHeight = 12 // Height for thick elements
  const lineHeight = 2 // Height for thin lines
  const gapWidth = 2 // Gap between segments

  // Calculate total gaps and indicators width
  const indicatorWidth = 2 // width of each vertical indicator
  const dashedIndicatorWidth = 2 // dashed indicator width
  const showDashedIndicator = expectedProgress < 100

  // Adjust calculations based on whether dashed indicator is shown
  const totalGaps = showDashedIndicator ? gapWidth * 6 : gapWidth * 4 // 6 gaps with dashed, 4 without
  const totalIndicators = indicatorWidth * 2 // 2 indicators (start and end)
  const totalDashedIndicator = showDashedIndicator ? dashedIndicatorWidth : 0

  return (
    <div className={`relative w-full h-6 flex items-center ${className}`}>
      {/* Start indicator - black vertical line */}
      <div
        className="bg-foreground flex-shrink-0"
        style={{ width: `${indicatorWidth}px`, height: `${segmentHeight}px` }}
      />

      {/* Gap */}
      <div style={{ width: `${gapWidth}px` }} />

      {/* Current progress - thick blue block */}
      <div
        className="bg-primary flex-shrink-0"
        style={{
          width: `calc(${currentProgress}% - ${((totalGaps + totalIndicators + totalDashedIndicator) * currentProgress) / 100}px)`,
          height: `${segmentHeight}px`,
        }}
      />

      {/* Gap */}
      <div style={{ width: `${gapWidth}px` }} />

      {/* Expected progress line - dark blue */}
      <div
        className="bg-primary flex-shrink-0"
        style={{
          width: `calc(${expectedProgress - currentProgress}% - ${((totalGaps + totalIndicators + totalDashedIndicator) * (expectedProgress - currentProgress)) / 100}px)`,
          height: `${lineHeight}px`,
        }}
      />

      {/* Conditional rendering based on expected progress */}
      {showDashedIndicator ? (
        <>
          {/* Gap */}
          <div style={{ width: `${gapWidth}px` }} />

          {/* Expected progress indicator - blue dashed vertical line */}
          <div
            className="flex-shrink-0 relative"
            style={{
              width: `${dashedIndicatorWidth}px`,
              height: `${segmentHeight}px`,
            }}
          >
            <div
              className="absolute inset-0 bg-primary"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, #2563eb 0px, #2563eb 2px, transparent 2px, transparent 4px)',
              }}
            />
          </div>

          {/* Gap */}
          <div style={{ width: `${gapWidth}px` }} />

          {/* Remaining progress line - gray */}
          <div
            className="bg-mutedSecondary flex-shrink-0"
            style={{
              width: `calc(${100 - expectedProgress}% - ${((totalGaps + totalIndicators + totalDashedIndicator) * (100 - expectedProgress)) / 100}px)`,
              height: `${lineHeight}px`,
            }}
          />

          {/* Gap */}
          <div style={{ width: `${gapWidth}px` }} />

          {/* End indicator - black vertical line */}
          <div
            className="bg-foreground flex-shrink-0"
            style={{
              width: `${indicatorWidth}px`,
              height: `${segmentHeight}px`,
            }}
          />
        </>
      ) : (
        <>
          {/* Gap */}
          <div style={{ width: `${gapWidth}px` }} />

          {/* End indicator - blue vertical line when expected progress is 100% */}
          <div
            className="bg-primary flex-shrink-0"
            style={{
              width: `${indicatorWidth}px`,
              height: `${segmentHeight}px`,
            }}
          />
        </>
      )}
    </div>
  )
}
