import { MouseoverTooltip } from '@/components/old/tooltip'
import { Separator } from '@/components/ui/separator'
import { Trans, t } from '@lingui/macro'
import HelpIcon from 'components/icons/CustomHelpIcon'
import { Coins, LockKeyholeOpen, ShieldCheck, Zap } from 'lucide-react'

const Hero = () => (
  <div className="relative">
    <div className="mx-auto flex flex-col items-center relative max-w-[95em] pt-4 mt-2 md:mt-3 pb-0 px-2 md:px-3">
      <div className="max-w-[900px] text-center mt-2 md:mt-7">
        <h1 className="text-[2rem] md:text-[3.5rem] text-primary leading-9 md:leading-[62px]">
          Vote-Lock on Index DTFs
        </h1>
        <p className="text-base md:text-lg mt-3 md:mt-4 px-2 md:px-0">
          Use any ERC20 to govern an Index DTF in exchange for a portion of the
          Mint and TVL fees. There is smart contract risk associated with vote
          locking your ERC20, but there is no slashing risk associated. 
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
          <ShieldCheck className="w-4 h-4" />
          <span>No Slashing Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <LockKeyholeOpen className="w-4 h-4" />
          <span>Always 7-day unlock delays</span>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4" />
          <span>Payouts in DTF</span>
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
