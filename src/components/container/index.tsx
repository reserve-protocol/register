import { Box, BoxProps } from 'theme-ui'

/**
 * Wraps the page content
 *
 * @param {ReactNode} children
 * @returns
 */
const Container = ({ sx = {}, ...props }: BoxProps) => (
  <Box variant="layout.wrapper">
    <Box
      sx={{
        boxSizing: 'border-box',
        flexShrink: 0,
        paddingX: [1, 3],
        paddingY: [1, 6],
        ...sx,
      }}
      {...props}
    />
  </Box>
)

export default Container
