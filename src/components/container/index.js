import PropTypes from 'prop-types'
import { Box } from 'rebass'

/**
 * Wraps the page content
 *
 * @param {ReactNode} children
 * @returns
 */
const Container = ({ children, ...props }) => (
  <Box
    sx={{
      maxWidth: 1024,
      mx: 'auto',
      px: 3,
    }}
    {...props}
  >
    {children}
  </Box>
)

export default Container
