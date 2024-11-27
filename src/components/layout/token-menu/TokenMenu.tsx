import useIsSidebarVisible from 'hooks/useIsSidebarVisible'
import { Box } from 'theme-ui'
import Navigation from '../navigation/index'

/**
 * Application sidebar
 */
const TokenMenu = () => {
  if (!useIsSidebarVisible()) return null

  return (
    <Box
      sx={{
        flexShrink: 0,
        display: ['none', 'flex'],
        backgroundColor: 'background',
        borderBottom: '1px solid',
        borderColor: 'border',
        flexGrow: 0,
        boxSizing: 'border-box',
        flexDirection: 'column',
        position: 'fixed',
        top: '72px',
        width: '100%',
        height: '72px',
      }}
    >
      <Navigation />
    </Box>
  )
}

export default TokenMenu
