import CMSUpdater from './cms'
import { PoolTokensBalancesUpdater } from './pools/updaters/PoolTokensBalancesUpdater'
import RTokenUpdater from './rtoken/updater'
import CollateralYieldUpdater from './updaters/CollateralYieldUpdater'
import PricesUpdater from './updaters/PriceUpdater'
import AccountUpdater from './wallet/updaters/AccountUpdater'
import { TokenBalancesUpdater } from './wallet/updaters/TokenBalancesUpdater'

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
      <PoolTokensBalancesUpdater />
    </>
  )
}

export default Updater
