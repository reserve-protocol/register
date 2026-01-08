import ListedDTFTable from './components/listed-dtf-table'
import Updater from './updater'

const InternalDTFListed = () => {
  return (
    <div className="container px-1 md:px-4 py-6 sm:py-8">
      <Updater />

      <div className="mb-8 px-2">
        <h1 className="text-3xl font-bold mb-2">Listed DTFs</h1>
        <p className="text-muted-foreground">
          Whitelisted Index DTFs displayed on the discover page with their
          governance addresses
        </p>
      </div>

      <div className="space-y-4 px-2">
        <ListedDTFTable />
      </div>
    </div>
  )
}

export default InternalDTFListed
