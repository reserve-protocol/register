import { NETWORKS } from '@/utils/constants'
import { useParams } from 'react-router-dom'
import IndexDTFOverview from './index'
import { isStocksDTF } from './dtf-categories'
import StocksIndexDTFOverview from './stocks'

// Routes category DTFs to their own overview layout; everything else keeps
// the standard one. Category membership is TEMPORARILY hardcoded in
// dtf-categories.ts until the backend provides it.
const IndexDTFOverviewSelector = () => {
  const { chain, tokenId } = useParams()
  const chainId = NETWORKS[chain ?? '']

  if (isStocksDTF(chainId, tokenId)) {
    return <StocksIndexDTFOverview />
  }

  return <IndexDTFOverview />
}

export default IndexDTFOverviewSelector
