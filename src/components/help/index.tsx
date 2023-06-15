import HelpIcon from 'components/icons/HelpIcon'
import { MouseoverTooltip } from 'components/tooltip'
import { Box, BoxProps } from 'theme-ui'

interface Props extends BoxProps {
  content: any
  size?: number
  color?: string
}

const Help = ({ content, color, size = 16, sx = {}, ...props }: Props) => {
  const defaultColor = 'secondaryText'
  return (
    <MouseoverTooltip text={content}>
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
