import { walletAtom } from '@/state/atoms'
import { ChainId } from '@/utils/chains'
import {
  portfolioLastUpdatedAtom,
  portfolioLoadingAtom,
  portfolioRefreshFnAtom,
  resetPortfolioAtom,
} from '@/views/portfolio/atoms'
import RewardsUpdater from '@/views/portfolio/rewards-updater'
import IndexDTFIconsUpdater from '@/views/portfolio/updaters/index-dtf-icons-updater'
import IndexDTFPricesUpdater from '@/views/portfolio/updaters/index-dtf-prices-updater'
import IndexDTFUpdater from '@/views/portfolio/updaters/index-dtf-updater'
import RSRBalancesUpdater from '@/views/portfolio/updaters/rsr-balances-updater'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import CMSUpdater from './cms'
import RTokenUpdater from './rtoken/updater'
import CollateralYieldUpdater from './updaters/CollateralYieldUpdater'
import DevModeUpdater from './updaters/DevModeUpdater'
import PricesUpdater from './updaters/PriceUpdater'
import AccountUpdater from './wallet/updaters/AccountUpdater'
import { TokenBalancesUpdater } from './wallet/updaters/TokenBalancesUpdater'

export const PortfolioUpdater = () => {
  const wallet = useAtomValue(walletAtom)
  const setLastUpdated = useSetAtom(portfolioLastUpdatedAtom)
  const setRefreshFn = useSetAtom(portfolioRefreshFnAtom)
  const resetPortfolio = useSetAtom(resetPortfolioAtom)
  const setLoading = useSetAtom(portfolioLoadingAtom)
  const [manualRefreshKey, setManualRefreshKey] = useState(0)

  const refreshPortfolio = () => {
    setManualRefreshKey((k) => k + 1)
    setLastUpdated(Date.now())
  }

  useEffect(() => {
    setRefreshFn(() => refreshPortfolio)
    setLastUpdated(Date.now())
  }, [])

  useEffect(() => {
    resetPortfolio()
    const timeout = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timeout)
  }, [wallet])

  const compositeKey = `${wallet ?? 'disconnected'}-${manualRefreshKey}`

  return (
    <div key={compositeKey}>
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
      <DevModeUpdater />
      <CMSUpdater />
      <PricesUpdater />
      <RTokenUpdater />
      <CollateralYieldUpdater />
      <PortfolioUpdater />
    </>
  )
}

export default Updater
