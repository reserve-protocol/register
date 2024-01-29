import TokenNavigation from 'components/layout/navigation/TokenNavigation'
import useRTokenContext from 'hooks/useRTokenContext'
import { Outlet } from 'react-router-dom'
import { Box } from 'theme-ui'

const RTokenContainer = () => {
  useRTokenContext()

  return (
    <Box variant="layout.wrapper" sx={{ display: 'flex' }}>
      <TokenNavigation />
      <Outlet />
    </Box>
  )
}

export default RTokenContainer
