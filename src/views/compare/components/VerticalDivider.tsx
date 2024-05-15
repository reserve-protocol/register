import { FC } from 'react'
import { Box, BoxProps } from 'theme-ui'

const VerticalDivider: FC<BoxProps> = (props) => (
  <Box variant="layout.verticalAlign" {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" width={2} height={6} fill="none">
      <path
        stroke="currentColor"
        strokeDasharray="2 2"
        strokeWidth={2}
        d="M.613.25h.5v5.5h-.5z"
      />
    </svg>
  </Box>
)

export default VerticalDivider
