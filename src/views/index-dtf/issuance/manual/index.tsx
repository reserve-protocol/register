import { useSetAtom } from 'jotai'
import AssetList from './components/asset-list'
import IndexManualIssuance from './components/index-manual-issuance'
import Updater from './updater'
import { amountAtom } from './atoms'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const IndexDTFManualIssuance = () => {
  const setAmount = useSetAtom(amountAtom)
  const [searchParams] = useSearchParams()
  const amountIn = searchParams.get('amountIn')

  useEffect(() => {
    if (amountIn) {
      setAmount(amountIn)
    }
  }, [])

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
