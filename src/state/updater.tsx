import RpayFeed from './rpay/RpayFeed'
import RTokenUpdater from './rtoken/updater'
import CollateralYieldUpdater from './updaters/CollateralYieldUpdater'
import PricesUpdater from './updaters/PriceUpdater'
import AccountUpdater from './wallet/updaters/AccountUpdater'
import { TokenBalancesUpdater } from './wallet/updaters/TokenBalancesUpdater'

/**
 * Updater
 */
const Updater = () => (
  <>
    <PricesUpdater />
    <AccountUpdater />
    <RpayFeed />
    <RTokenUpdater />
    <CollateralYieldUpdater />
    <TokenBalancesUpdater />
  </>
)

export default Updater
