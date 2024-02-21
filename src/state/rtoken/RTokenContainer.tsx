import TokenNavigation from 'components/layout/navigation/TokenNavigation'
import useRTokenContext from 'hooks/useRTokenContext'
import { Outlet } from 'react-router-dom'
import { Box } from 'theme-ui'

const RTokenContainer = () => {
  useRTokenContext()

  return (
    <Box
      variant="layout.wrapper"
      sx={{
        display: 'flex',
        flexDirection: ['column-reverse', 'row'],
        marginBottom: [72, 72, 0],
      }}
    >
      <TokenNavigation />
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default RTokenContainer
