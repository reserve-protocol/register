import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const MAX_ROWS = 5

export const useExpandable = <T,>(data: T[], limit = MAX_ROWS) => {
  const [expanded, setExpanded] = useState(false)
  return {
    displayData: expanded ? data : data.slice(0, limit),
    expanded,
    toggle: () => setExpanded((e) => !e),
    hasMore: data.length > limit,
    total: data.length,
  }
}

export const ExpandToggle = ({
  expanded,
  total,
  onToggle,
}: {
  expanded: boolean
  total: number
  onToggle: () => void
}) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center justify-center gap-1 py-3 text-sm text-primary font-medium border-t border-border hover:bg-muted/50 transition-colors"
  >
    {expanded ? (
      <>
        Show less <ChevronUp size={16} />
      </>
    ) : (
      <>
        Show all ({total}) <ChevronDown size={16} />
      </>
    )}
  </button>
)
