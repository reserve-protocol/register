import TokenNavigation from 'components/layout/navigation/TokenNavigation'
import useRTokenContext from 'hooks/useRTokenContext'
import { Outlet } from 'react-router-dom'

// TODO: Hook currently re-renders a lot because of a wagmi bug, different component to avoid tree re-renders
const Updater = () => {
  useRTokenContext()

  return null
}

const RTokenContainer = () => (
  <div className="container flex flex-col-reverse md:flex-row mb-[72px] lg:mb-0">
    <Updater />
    <TokenNavigation />
    <div className="flex-grow">
      <Outlet />
    </div>
  </div>
)

export default RTokenContainer
