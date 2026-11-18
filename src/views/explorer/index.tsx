import { Outlet } from 'react-router-dom'
import ExplorerNav from './components/kit/explorer-nav'

const Explorer = () => (
  <div data-testid="explorer-page" className="relative">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-secondary via-secondary/40 to-transparent"
    />
    <div className="container relative flex flex-col gap-5 px-0 pb-10 pt-1 sm:gap-7 sm:px-4 sm:pt-4">
      <ExplorerNav />
      <Outlet />
    </div>
  </div>
)

export default Explorer
