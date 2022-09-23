import { t } from '@lingui/macro'
import { MouseoverTooltip } from 'components/tooltip'
import { useState } from 'react'
import { Copy } from 'react-feather'
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
        onClick={handleCopy}
        {...props}
      >
        <Copy color="#666666" size={size} />
      </IconButton>
    </MouseoverTooltip>
  )
}

export default CopyValue
