import { t } from '@lingui/macro'
import { MouseoverTooltip } from '@/components/old/tooltip'
import { useState } from 'react'
import CopyIcon from 'components/icons/CopyIcon'
import { ButtonProps, IconButton } from 'theme-ui'
import { Placement } from '@popperjs/core'

interface Props extends ButtonProps {
  text?: string
  value: string
  size?: number
  placement?: Placement
}

const CopyValue = ({
  text,
  value,
  size = 16,
  placement = 'left',
  ...props
}: Props) => {
  const copyText = text || t`Copy to clipboard`
  const confirmText = t`Copied to clipboard!`
  const [displayText, setDisplayText] = useState(copyText)

  const handleClose = () => {
    setDisplayText(copyText)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setDisplayText(confirmText)
  }

  return (
    <MouseoverTooltip
      onClose={handleClose}
      text={displayText}
      placement={placement}
    >
      <IconButton
        p={0}
        variant="layout.verticalAlign"
        sx={{ cursor: 'pointer', width: 'auto', height: 'auto' }}
        onClick={(e) => {
          e.stopPropagation()
          handleCopy()
        }}
        {...props}
      >
        <CopyIcon />
      </IconButton>
    </MouseoverTooltip>
  )
}

export default CopyValue
