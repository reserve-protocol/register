import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import EarnHero from '@/views/earn/components/earn-hero'
import { Trans, useLingui } from '@lingui/react/macro'
import HelpIcon from 'components/icons/CustomHelpIcon'
import { Zap } from 'lucide-react'

const Hero = () => (
  <EarnHero
    title={
      <Trans>Provide liquidity across DeFi & earn more with your DTFs</Trans>
    }
    subtitle={
      <Trans>
        DeFi yield opportunities for DTFs in Aerodrome, Convex, Beefy, Yearn &
        Others
      </Trans>
    }
  />
)

const Info = () => {
  const { t } = useLingui()
  return (
    <div className="flex justify-center mt-4 mb-7 pb-0 md:pb-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 rounded-[50px] border-[3px] border-border w-fit bg-card-alternative py-2 px-3 cursor-pointer">
            <Zap strokeWidth={1.5} size={18} className="text-primary" />
            <span className="font-bold text-primary text-sm md:text-base">
              <Trans>How are APYs so high?</Trans>
            </span>
            <HelpIcon />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[340px]">
          {t`DeFi protocols oftentimes have incentives for liquidity that are paid in their token or a combination of tokens. By providing liquidity for trading or lending or other activities on these protocols, you can earn rewards that are sometimes quite high! Note that there are always risks (smart contract risks, impermanent loss risks, etc), in providing liquidity on these protocols so please make sure you understand things before blindly diving in.`}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

const EarnHeading = () => (
  <div>
    <Hero />
    <Info />
  </div>
)

export default EarnHeading
