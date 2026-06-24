import EarnHero from '@/views/earn/components/earn-hero'
import { Trans } from '@lingui/react/macro'
import { Coins, LockKeyholeOpen, ShieldAlert } from 'lucide-react'

const Hero = () => (
  <EarnHero
    title={<Trans>Stake RSR on Yield DTFs</Trans>}
    subtitle={
      <Trans>
        Stake RSR to govern a Yield DTF and protect it from depegging in
        exchange for a cut of the underlying yield. There is smart contract and
        slashing risk associated with staking your RSR.
      </Trans>
    }
  />
)

const Benefits = () => {
  return (
    <div className="mt-4 flex justify-center md:mt-6">
      <div className="mx-4 flex w-full max-w-[680px] flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t px-3 py-4 text-sm md:mx-0 md:gap-6 md:px-6 md:py-6 md:text-base">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>
            <Trans>Slashing Risk</Trans>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LockKeyholeOpen className="w-4 h-4" />
          <span>
            <Trans>14-day unlock delays</Trans>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4" />
          <span>
            <Trans>Payouts in RSR</Trans>
          </span>
        </div>
      </div>
    </div>
  )
}

const Header = () => (
  <div>
    <Hero />
    <Benefits />
  </div>
)

export default Header
