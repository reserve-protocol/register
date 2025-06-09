import { ChainId } from '@/utils/chains'
import {
  portfolioLastUpdatedAtom,
  portfolioRefreshFnAtom,
} from '@/views/portfolio/atoms'
import RewardsUpdater from '@/views/portfolio/rewards-updater'
import IndexDTFIconsUpdater from '@/views/portfolio/updaters/index-dtf-icons-updater'
import IndexDTFPricesUpdater from '@/views/portfolio/updaters/index-dtf-prices-updater'
import IndexDTFUpdater from '@/views/portfolio/updaters/index-dtf-updater'
import RSRBalancesUpdater from '@/views/portfolio/updaters/rsr-balances-updater'
import { useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import CMSUpdater from './cms'
import RTokenUpdater from './rtoken/updater'
import CollateralYieldUpdater from './updaters/CollateralYieldUpdater'
import PricesUpdater from './updaters/PriceUpdater'
import AccountUpdater from './wallet/updaters/AccountUpdater'
import { TokenBalancesUpdater } from './wallet/updaters/TokenBalancesUpdater'

export const PortfolioUpdater = () => {
  const setLastUpdated = useSetAtom(portfolioLastUpdatedAtom)
  const setRefreshFn = useSetAtom(portfolioRefreshFnAtom)
  const [key, setKey] = useState(0)

  const refreshPortfolio = () => {
    setKey((k) => k + 1)
    setLastUpdated(Date.now())
  }

  useEffect(() => {
    setRefreshFn(() => refreshPortfolio)
    setLastUpdated(Date.now())
  }, [])

  return (
    <div key={key}>
      <AccountUpdater />
      <TokenBalancesUpdater />
      <IndexDTFUpdater chainId={ChainId.Mainnet} />
      <IndexDTFUpdater chainId={ChainId.Base} />
      <IndexDTFUpdater chainId={ChainId.BSC} />
      <IndexDTFPricesUpdater />
      <RSRBalancesUpdater />
      <RewardsUpdater />
      <IndexDTFIconsUpdater />
    </div>
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
