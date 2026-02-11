import { useAtomValue } from 'jotai'
import { chainIdAtom, rTokenStateAtom } from 'state/atoms'
import DisabledByGeolocationMessage from 'state/geolocation/DisabledByGeolocationMessage'
import { Separator } from '@/components/ui/separator'
import About from './components/about'
import Balances from './components/balances'
import Issue from './components/issue'
import IssuanceInfo from './components/issue/IssuanceInfo'
import Redeem from './components/redeem'
import {
  CollateralizationBanner,
  DisabledArbitrumBanner,
  MaintenanceBanner,
} from './components/warnings'
import WrapSidebar from './components/wrapping/WrapSidebar'
import RTokenZapIssuance from './components/zapV2/RTokenZapIssuance'
import ZapToggle from './components/zapV2/ZapToggle'
import ZapToggleBottom from './components/zapV2/ZapToggleBottom'
import { ZapProvider, useZap } from './components/zapV2/context/ZapContext'
import { ChainId } from '@/utils/chains'

const IssuanceMethods = () => {
  const chainId = useAtomValue(chainIdAtom)
  const { zapEnabled, setZapEnabled } = useZap()
  const { isCollaterized } = useAtomValue(rTokenStateAtom)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-0 lg:gap-4 xl:gap-5">
      {zapEnabled && chainId !== ChainId.Arbitrum ? (
        <div className="flex flex-col gap-6">
          <CollateralizationBanner className="ml-6 -mb-6 mt-6" />
          <MaintenanceBanner className="ml-6 -mb-6 mt-6" />
          <RTokenZapIssuance disableRedeem={!isCollaterized} />
          <ZapToggleBottom setZapEnabled={setZapEnabled} />
        </div>
      ) : (
        <div>
          <CollateralizationBanner className="mb-4" />
          <MaintenanceBanner className="mb-4" />
          <DisabledArbitrumBanner className="mb-4" />
          {chainId !== ChainId.Arbitrum && (
            <ZapToggle zapEnabled={zapEnabled} setZapEnabled={setZapEnabled} />
          )}
          <DisabledByGeolocationMessage className="mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-6 mb-1 sm:mb-6">
            <Issue />
            <Redeem />
          </div>
          <Balances />
        </div>
      )}
      <div className="border-l-0 xl:border-l xl:border-border min-h-auto xl:min-h-[calc(100vh-73px)]">
        <IssuanceInfo className="mb-1 sm:mb-0" />
        {!zapEnabled && (
          <>
            <Separator className="my-0 border-secondary" />
            <About />
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Mint & Redeem view
 */
const Issuance = () => {
  return (
    <ZapProvider>
      <WrapSidebar />
      <div className="container py-1 md:py-6 px-0 sm:px-2">
        <IssuanceMethods />
      </div>
    </ZapProvider>
  )
}

export default Issuance
