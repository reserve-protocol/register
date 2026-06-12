import { useLingui } from '@lingui/react/macro'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Link2 } from 'lucide-react'
import { useState } from 'react'

const SectionAnchor = ({ id }: { id: string }) => {
  const { t } = useLingui()
  const [isCopied, setIsCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const displayText = isCopied ? t`Copied!` : t`Copy link`

  const handleCopy = () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    navigator.clipboard.writeText(url)
    window.history.replaceState(null, '', `#${id}`)
    setIsCopied(true)
    setIsOpen(true)
    setTimeout(() => {
      setIsCopied(false)
      setIsOpen(false)
    }, 2000)
  }

  return (
    <Tooltip open={isOpen ? true : undefined} delayDuration={0}>
      <TooltipTrigger onClick={handleCopy}>
        <div className="opacity-0 group-hover/section:opacity-40 hover:!opacity-100 transition-opacity cursor-pointer p-1">
          <Link2 size={16} strokeWidth={1.5} />
        </div>
      </TooltipTrigger>
      <TooltipContent>{displayText}</TooltipContent>
    </Tooltip>
  )
}

export default SectionAnchor
