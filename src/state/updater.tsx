import IndexDTFUpdater from '@/views/portfolio/updaters/index-dtf-updater'
import CMSUpdater from './cms'
import RTokenUpdater from './rtoken/updater'
import CollateralYieldUpdater from './updaters/CollateralYieldUpdater'
import PricesUpdater from './updaters/PriceUpdater'
import AccountUpdater from './wallet/updaters/AccountUpdater'
import { TokenBalancesUpdater } from './wallet/updaters/TokenBalancesUpdater'
import IndexDTFPricesUpdater from '@/views/portfolio/updaters/index-dtf-prices-updater'
import RSRBalancesUpdater from '@/views/portfolio/updaters/rsr-balances-updater'

/**
 * Updater
 */
const Updater = () => {
  return (
    <>
      <CMSUpdater />
      <PricesUpdater />
      <AccountUpdater />
      <RTokenUpdater />
      <CollateralYieldUpdater />
      <TokenBalancesUpdater />
      <IndexDTFUpdater />
      <IndexDTFPricesUpdater />
      <RSRBalancesUpdater />
    </>
  )
}

export default Updater
