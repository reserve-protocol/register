import ExportAnalyticsButton from './components/export-analytics-button'
import YieldDTFTable from './components/yield-dtf-table'
import Updater from './updater'

const InternalYieldDTF = () => {
  return (
    <div className="container px-1 md:px-4 py-6 sm:py-8">
      <Updater />

      <div className="mb-8 px-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Listed Yield DTFs</h1>
            <p className="text-muted-foreground">
              Yield DTFs (RTokens) across Ethereum, Base, and Arbitrum with
              monthly analytics export
            </p>
          </div>
          <ExportAnalyticsButton />
        </div>
      </div>

      <div className="space-y-4 px-2">
        <YieldDTFTable />
      </div>
    </div>
  )
}

export default InternalYieldDTF
