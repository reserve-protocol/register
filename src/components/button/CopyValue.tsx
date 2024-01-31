import { t } from '@lingui/macro'
import { MouseoverTooltip } from 'components/tooltip'
import { useState } from 'react'
import CopyIcon from 'components/icons/CopyIcon'
import { ButtonProps, IconButton } from 'theme-ui'

interface Props extends ButtonProps {
  text?: string
  value: string
  size?: number
}

const CopyValue = ({ text, value, size = 16, ...props }: Props) => {
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
    <MouseoverTooltip onClose={handleClose} text={displayText}>
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
