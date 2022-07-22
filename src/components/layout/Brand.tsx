import Logo, { SmallLogo } from 'components/icons/Logo'
import { Link } from 'react-router-dom'
import { Box, BoxProps } from 'theme-ui'

const Brand = (props: BoxProps) => (
  <Link to="/" style={{ color: 'inherit' }}>
    <Box
      sx={{
        display: ['none', 'none', 'flex'],
        alignItems: 'center',
      }}
      {...props}
    >
      <Logo />
    </Box>
    <Box
      sx={{
        display: ['flex', 'flex', 'none'],
        alignItems: 'center',
        justifyContent: 'center',
      }}
      {...props}
    >
      <SmallLogo />
    </Box>
  </Link>
)

export default Brand
