import { Outlet } from 'react-router-dom'
import { Box } from 'theme-ui'

const Navigation = () => {
  return <Box>test</Box>
}

const Explorer = () => (
  <Box
    variant="layout.wrapper"
    sx={{
      display: 'flex',
      flexDirection: ['column-reverse', 'row'],
      marginBottom: [72, 72, 0],
    }}
  >
    <Navigation />
    <Box sx={{ flexGrow: 1 }}>
      <Outlet />
    </Box>
  </Box>
)
export default Explorer
