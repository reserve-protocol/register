import { ChainId } from '@/utils/chains'
import RewardsUpdater from '@/views/portfolio/rewards-updater'
import IndexDTFIconsUpdater from '@/views/portfolio/updaters/index-dtf-icons-updater'
import IndexDTFPricesUpdater from '@/views/portfolio/updaters/index-dtf-prices-updater'
import IndexDTFUpdater from '@/views/portfolio/updaters/index-dtf-updater'
import RSRBalancesUpdater from '@/views/portfolio/updaters/rsr-balances-updater'
import CMSUpdater from './cms'
import RTokenUpdater from './rtoken/updater'
import CollateralYieldUpdater from './updaters/CollateralYieldUpdater'
import PricesUpdater from './updaters/PriceUpdater'
import AccountUpdater from './wallet/updaters/AccountUpdater'
import { TokenBalancesUpdater } from './wallet/updaters/TokenBalancesUpdater'

export const PortfolioUpdater = () => {
  return (
    <>
      <AccountUpdater />
      <TokenBalancesUpdater />
      <IndexDTFUpdater chainId={ChainId.Mainnet} />
      <IndexDTFUpdater chainId={ChainId.Base} />
      <IndexDTFPricesUpdater />
      <RSRBalancesUpdater />
      <RewardsUpdater />
      <IndexDTFIconsUpdater />
    </>
  )
}

/**
 * Updater
 */
const Updater = () => {
  return (
    <>
      <CMSUpdater />
      <PricesUpdater />
      <RTokenUpdater />
      <CollateralYieldUpdater />
      <PortfolioUpdater />
    </>
  )
}

export default Updater
