import CMSUpdater from './cms'
import RTokenUpdater from './rtoken/updater'
import CollateralYieldUpdater from './updaters/CollateralYieldUpdater'
import DevModeUpdater from './updaters/DevModeUpdater'
import IndexDTFIconsUpdater from './updaters/index-dtf-icons-updater'
import PricesUpdater from './updaters/PriceUpdater'
import AccountUpdater from './wallet/updaters/AccountUpdater'
import { TokenBalancesUpdater } from './wallet/updaters/TokenBalancesUpdater'

/**
 * Updater
 */
const Updater = () => {
  return (
    <>
      <DevModeUpdater />
      <CMSUpdater />
      <PricesUpdater />
      <RTokenUpdater />
      <CollateralYieldUpdater />
      <AccountUpdater />
      <TokenBalancesUpdater />
      <IndexDTFIconsUpdater />
    </>
  )
}

export default Updater
