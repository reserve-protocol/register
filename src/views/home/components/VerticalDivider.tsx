import { FC } from 'react'
import { Box, BoxProps } from 'theme-ui'

const VerticalDivider: FC<BoxProps> = ({ sx, ...props }) => (
  <Box
    sx={{
      height: '12px',
      border: 'none',
      borderRight: '1px solid',
      borderColor: '#4C4C4C',
      borderStyle: 'dashed',
      ...sx,
    }}
    {...props}
  />
)

export default VerticalDivider
