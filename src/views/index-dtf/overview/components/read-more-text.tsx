import { useState } from 'react'

const DEFAULT_MAX_LENGTH = 280

const truncateAtWord = (text: string, maxLength: number) => {
  const truncated = text.slice(0, maxLength).trimEnd()
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > maxLength * 0.75) {
    return truncated.slice(0, lastSpace)
  }

  return truncated
}

const ReadMoreText = ({
  text,
  className,
  maxLength = DEFAULT_MAX_LENGTH,
}: {
  text: string
  className?: string
  maxLength?: number
}) => {
  const [expanded, setExpanded] = useState(false)
  const shouldTruncate = text.length > maxLength
  const displayText =
    shouldTruncate && !expanded ? truncateAtWord(text, maxLength) : text

  return (
    <p className={className}>
      {displayText}
      {shouldTruncate && !expanded && (
        <>
          ...{' '}
          <button
            type="button"
            className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
            onClick={() => setExpanded(true)}
          >
            Read more...
          </button>
        </>
      )}
    </p>
  )
}

export default ReadMoreText
