import AssetList from './components/asset-list'
import IndexManualIssuance from './components/index-manual-issuance'
import Updater from './updater'

const IndexDTFManualIssuance = () => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 pl-2 pr-2 lg:pl-0 mb-4">
        <IndexManualIssuance />
        <AssetList />
      </div>
      <Updater />
    </>
  )
}

export default IndexDTFManualIssuance
