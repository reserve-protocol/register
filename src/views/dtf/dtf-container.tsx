import TokenNavigation from 'components/layout/navigation/TokenNavigation'
import { Outlet } from 'react-router-dom'
import { Box } from 'theme-ui'

// TODO: Hook currently re-renders a lot because of a wagmi bug, different component to avoid tree re-renders
const Updater = () => {
  // useRTokenContext()

  return null
}

const DTFContainer = () => (
  <div
    className="container flex flex-col-reverse md:flex-row mb-[72px] md:mb-0"
    // variant="layout.wrapper"
    // sx={{
    //   display: 'flex',
    //   flexDirection: ['column-reverse', 'row'],
    //   marginBottom: [72, 72, 0],
    // }}
  >
    <Updater />
    <TokenNavigation />
    <div className="flex-grow">
      <Outlet />
    </div>
  </div>
)

export default DTFContainer
