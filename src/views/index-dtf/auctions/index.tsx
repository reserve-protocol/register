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
    <div className="container" data-testid="dtf-auctions">
      <div className="flex flex-col items-center justify-start sm:justify-center gap-2 lg:bg-secondary sm:min-h-[calc(100vh-136px)] lg:min-h-[calc(100vh-80px)] rounded-4xl lg:mr-2 ">
        <Outlet />
        <Updater />
      </div>
    </div>
  )
}

export default IndexDTFAuctions
