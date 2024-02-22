import TokenNavigation from 'components/layout/navigation/TokenNavigation'
import useRTokenContext from 'hooks/useRTokenContext'
import { Outlet } from 'react-router-dom'
import { Box } from 'theme-ui'

// TODO: Hook currently re-renders a lot because of a wagmi bug, different component to avoid tree re-renders
const Updater = () => {
  useRTokenContext()

  return null
}

const RTokenContainer = () => (
  <Box
    variant="layout.wrapper"
    sx={{
      display: 'flex',
      flexDirection: ['column-reverse', 'row'],
      marginBottom: [72, 72, 0],
    }}
  >
    <Updater />
    <TokenNavigation />
    <Box sx={{ flexGrow: 1 }}>
      <Outlet />
    </Box>
  </Box>
)

export default RTokenContainer
