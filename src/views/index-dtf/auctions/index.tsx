import { indexDTFVersionAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { Outlet } from 'react-router-dom'
import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'
import IndexDTFAuctionsLegacy from './legacy'
import Updater from './updater'

const IndexDTFAuctions = () => {
  const isV2 = useAtomValue(indexDTFVersionAtom) === '2.0.0'
  useTrackIndexDTFPage('auctions')

  if (isV2) {
    return (
      <>
        <IndexDTFAuctionsLegacy />
        <Updater />
      </>
    )
  }

  return (
    <div className="container">
      <div className="flex flex-col items-center sm:justify-start md:justify-center gap-2 bg-secondary  min-h-[calc(100vh-80px)] rounded-4xl lg:mr-2 py-4">
        <Outlet />
        <Updater />
      </div>
    </div>
  )
}

export default IndexDTFAuctions
