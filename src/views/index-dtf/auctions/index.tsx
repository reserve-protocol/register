import { Outlet } from 'react-router-dom'
import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'
import Updater from './updater'

const IndexDTFAuctions = () => {
  useTrackIndexDTFPage('auctions')

  return (
    <div className="container">
      <div className="flex flex-col items-center sm:justify-start md:justify-center gap-2 bg-secondary/70 border-2 border-secondary min-h-[calc(100vh-80px)] dark:bg-card rounded-4xl lg:mr-2 py-4">
        <Outlet />
        <Updater />
      </div>
    </div>
  )
}

export default IndexDTFAuctions
