import Popup from 'components/popup'
import { MouseoverTooltip } from 'components/tooltip'
import { useState } from 'react'
import { HelpCircle } from 'react-feather'
import { Box, BoxProps } from 'theme-ui'
import HelpIcon from 'components/icons/HelpIcon'

interface Props extends BoxProps {
  content: any
  size?: number
}

const Help = ({ content, size = 16, sx = {}, ...props }: Props) => {
  return (
    <MouseoverTooltip text={content}>
      <Box
        variant="layout.verticalAlign"
        sx={{ cursor: 'pointer', ...sx }}
        {...props}
      >
        <HelpIcon />
      </Box>
    </MouseoverTooltip>
  )
}

export default Help
