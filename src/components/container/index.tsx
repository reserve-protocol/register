import { Box, BoxProps } from 'theme-ui'

/**
 * Wraps the page content
 *
 * @param {ReactNode} children
 * @returns
 */
const Container = ({ sx = {}, ...props }: BoxProps) => (
  <Box
    sx={{ boxSizing: 'border-box', flexShrink: 0, padding: [4, 5], ...sx }}
    {...props}
  />
)

export default Container
