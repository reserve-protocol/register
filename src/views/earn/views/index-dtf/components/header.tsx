import { Trans } from '@lingui/react/macro'
import { Coins, LockKeyholeOpen, ShieldCheck } from 'lucide-react'

const Hero = () => (
  <div className="relative mb-6 md:mb-0">
    <div className="mx-auto flex flex-col items-center relative max-w-[95em] pb-0 px-2 md:px-3">
      <div className="max-w-[900px] text-center">
        <h1 className="text-[2rem] md:text-[3.5rem] text-primary leading-9 md:leading-[62px]">
          <Trans>Vote-Lock on Index DTFs</Trans>
        </h1>
        <p className="text-base md:text-lg mt-3 md:mt-4 px-2 md:px-0">
          <Trans>
            Use any ERC20 to govern an Index DTF in exchange for a portion of
            the Mint and TVL fees. There is smart contract risk associated with
            vote locking your ERC20, but there is no slashing risk associated.
          </Trans>
        </p>
      </div>
    </div>
  </div>
)

const Benefits = () => {
  return (
    <div className="hidden md:flex justify-center mt-6">
      <div className="flex items-center gap-6 py-6 flex-wrap px-6 border-t">
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
