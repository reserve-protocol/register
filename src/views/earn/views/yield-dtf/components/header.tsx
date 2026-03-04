import { Coins, LockKeyholeOpen, ShieldAlert, ShieldCheck } from 'lucide-react'

const Hero = () => (
  <div className="relative">
    <div className="mx-auto flex flex-col items-center relative max-w-[95em] pb-0 px-2 md:px-3">
      <div className="max-w-[900px] text-center">
        <h1 className="text-[2rem] md:text-[3.5rem] text-primary leading-9 md:leading-[62px]">
          Stake RSR on Yield DTFs
        </h1>
        <p className="text-base md:text-lg mt-3 md:mt-4 px-2 md:px-0">
          Stake RSR to govern a Yield DTF and protect it from depegging in
          exchange for a cut of the underlying yield. There is smart contract
          and slashing risk associated with staking your RSR.
        </p>
      </div>
    </div>
  </div>
)

const Benefits = () => {
  return (
    <div className="flex justify-center mt-6">
      <div className="flex items-center gap-6 py-6 flex-wrap px-6 border-t">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>Slashing Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <LockKeyholeOpen className="w-4 h-4" />
          <span>14-day unlock delays</span>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4" />
          <span>Payouts in RSR</span>
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
