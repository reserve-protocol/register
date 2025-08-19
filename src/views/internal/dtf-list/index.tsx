import { useAtomValue } from 'jotai'
import { walletAtom } from '@/state/atoms'
import DTFTable from './components/dtf-table'
import DTFFilters from './components/dtf-filters'
import DTFDateChainFilters from './components/dtf-date-chain-filters'
import DTFPagination from './components/dtf-pagination'
import Updater from './updater'

const InternalDTFList = () => {
  const wallet = useAtomValue(walletAtom)

  return (
    <div className="container px-1 md:px-4 py-6 sm:py-8">
      <Updater />
      
      <div className="mb-8 px-2">
        <h1 className="text-3xl font-bold mb-2">Internal DTF List</h1>
        <p className="text-muted-foreground">
          View all Index DTFs across networks for internal testing purposes
        </p>
      </div>

      <div className="mb-6 space-y-4 px-2">
        <DTFDateChainFilters />
        {wallet && <DTFFilters />}
      </div>

      <div className="space-y-4 px-2">
        <DTFTable />
        <DTFPagination />
      </div>
    </div>
  )
}

export default InternalDTFList