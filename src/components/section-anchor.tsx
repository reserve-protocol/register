import { t } from '@lingui/macro'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Link2 } from 'lucide-react'
import { useState } from 'react'

const SectionAnchor = ({ id }: { id: string }) => {
  const copyText = t`Copy link`
  const confirmText = t`Copied!`
  const [displayText, setDisplayText] = useState(copyText)

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    navigator.clipboard.writeText(url)
    window.history.replaceState(null, '', `#${id}`)
    setDisplayText(confirmText)
    setTimeout(() => setDisplayText(copyText), 2000)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover/section:opacity-40 hover:!opacity-100 transition-opacity cursor-pointer p-1"
        >
          <Link2 size={16} strokeWidth={1.5} />
        </button>
      </TooltipTrigger>
      <TooltipContent>{displayText}</TooltipContent>
    </Tooltip>
  )
}

export default SectionAnchor
