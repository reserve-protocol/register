import EarnHero from '@/views/earn/components/earn-hero'
import { Trans } from '@lingui/react/macro'
import { Coins, LockKeyholeOpen, ShieldCheck } from 'lucide-react'

const Hero = () => (
  <div className="relative">
    <EarnHero
      title={<Trans>Vote-Lock on Index DTFs</Trans>}
      subtitle={
        <Trans>
          Use any ERC20 to govern an Index DTF in exchange for a portion of the
          Mint and TVL fees. There is smart contract risk associated with vote
          locking your ERC20, but there is no slashing risk associated.
        </Trans>
      }
    />
  </div>
)

const Benefits = () => {
  return (
    <div className="mt-4 flex justify-center md:mt-6">
      <div className="mx-4 flex w-full max-w-[680px] flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t px-3 py-4 text-sm md:mx-0 md:gap-6 md:px-6 md:py-6 md:text-base">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>
            <Trans>No Slashing Risk</Trans>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LockKeyholeOpen className="w-4 h-4" />
          <span>
            <Trans>7-day unlock delays</Trans>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4" />
          <span>
            <Trans>Payouts in DTF</Trans>
          </span>
        </div>
      </div>
    </div>
  )
}

const Header = () => (
  <>
    <Hero />
    <Benefits />
  </>
)

export default Header
