import HelpIcon from 'components/icons/HelpIcon'
import { MouseoverTooltip } from 'components/tooltip'
import { Box, BoxProps } from 'theme-ui'

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
