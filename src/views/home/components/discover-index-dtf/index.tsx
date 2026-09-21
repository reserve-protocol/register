import IndexDTFTable from './index-dtf-table'
import useFilteredDTFIndex from '../../hooks/use-filtered-index-dtf'
import {
  CollateralAssetAnimationStyles,
  IndexDTFFeatureCardPlaceholder,
} from '../highlighted-dtfs'
import { DiscoverIndexDTFCard } from './discover-index-dtf-card'
export { DiscoverIndexDTFCard } from './discover-index-dtf-card'

const DiscoverIndexDTF = () => {
  const { data, isLoading } = useFilteredDTFIndex()

  return (
    <>
      <div className="overflow-auto hidden lg:block">
        <IndexDTFTable data={data} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:hidden">
        <CollateralAssetAnimationStyles />
        {isLoading ? (
          <IndexDTFFeatureCardPlaceholder
            chartPlacement="header"
            showTranscript={false}
          />
        ) : (
          data.map((dtf) => (
            <DiscoverIndexDTFCard
              key={`${dtf.chainId}-${dtf.address}`}
              dtf={dtf}
            />
          ))
        )}
      </div>
    </>
  )
}

export default DiscoverIndexDTF
