import useRTokenContext from 'hooks/useRTokenContext'
import { Outlet } from 'react-router-dom'
import { Box } from 'theme-ui'

const RTokenContainer = () => {
  useRTokenContext()

  return (
    <Box variant="layout.wrapper">
      <Outlet />
    </Box>
  )
}

export default RTokenContainer
