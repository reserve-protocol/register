import { Outlet } from 'react-router-dom'
import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'
import Updater from './updater'

const IndexDTFAuctions = () => {
  useTrackIndexDTFPage('auctions')

  return (
    <div className="container">
      <div className="flex flex-col items-center sm:justify-start md:justify-center gap-2 lg:bg-secondary/70 lg:border-2 border-secondary lg:min-h-[calc(100vh-80px)] dark:bg-card rounded-4xl sm:mr-2 py-4">
        <Outlet />
        <Updater />
      </div>
    </div>
  )
}

export default IndexDTFAuctions

{
  /* <div className="flex items-center justify-center lg:min-h-[calc(100vh-72px)] bg-secondary">
<div className="w-10 h-[1000px]">other thing</div>
container
</div> */
}
