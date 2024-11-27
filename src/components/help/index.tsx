import { Placement } from '@popperjs/core'
import HelpIcon from 'components/icons/HelpIcon'
import { MouseoverTooltip } from 'components/tooltip'
import { ReactNode } from 'react'
import { Box, BoxProps } from 'theme-ui'

interface Props extends Omit<BoxProps, 'content'> {
  content: ReactNode
  size?: number
  color?: string
  placement?: Placement
}

const Help = ({
  content,
  color,
  size = 16,
  sx = {},
  placement,
  ...props
}: Props) => {
  const defaultColor = 'secondaryText'
  return (
    <MouseoverTooltip text={content} placement={placement}>
      <Box
        variant="layout.verticalAlign"
        sx={{ cursor: 'pointer', ...sx }}
        {...props}
      >
        <HelpIcon color={color ? color : defaultColor} />
      </Box>
    </MouseoverTooltip>
  )
}

export default Help
