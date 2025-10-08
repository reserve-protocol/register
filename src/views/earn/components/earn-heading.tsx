import { MouseoverTooltip } from '@/components/old/tooltip'
import { Trans, t } from '@lingui/macro'
import HelpIcon from 'components/icons/CustomHelpIcon'
import { Zap } from 'lucide-react'

const Hero = () => (
  <div className="relative">
    <div className="mx-auto flex flex-col items-center relative max-w-[95em] pt-4 mt-2 md:mt-3 pb-0 px-2 md:px-3">
      <div className="max-w-[900px] text-center mt-2 md:mt-7">
        <h1 className="text-[2rem] md:text-[3.5rem] font-bold text-primary leading-9 md:leading-[62px]">
          <Trans>
            Provide liquidity across DeFi & earn more with your DTFs
          </Trans>
        </h1>
        <p className="text-base md:text-lg text-primary mt-3 md:mt-4 px-2 md:px-0">
          <Trans>
            DeFi yield opportunities for DTFs in Convex, Curve, Yearn & Beefy
          </Trans>
        </p>
      </div>
    </div>
  </div>
)

const Info = () => {
  return (
    <div className="flex justify-center mt-4 mb-7 pb-0 md:pb-2">
      <MouseoverTooltip
        placement="bottom"
        text={t`DeFi protocols oftentimes have incentives for liquidity that are paid in their token or a combination of tokens. By providing liquidity for trading or lending or other activities on these protocols, you can earn rewards that are sometimes quite high! Note that there are always risks (smart contract risks, impermanent loss risks, etc), in providing liquidity on these protocols so please make sure you understand things before blindly diving in.`}
      >
        <div className="flex items-center gap-2 rounded-[50px] border-[3px] border-border w-fit bg-card-alternative py-2 px-3">
          <Zap strokeWidth={1.5} size={18} className="text-primary" />
          <span className="font-bold text-primary text-sm md:text-base">
            How are APYs so high?
          </span>
          <HelpIcon />
        </div>
      </MouseoverTooltip>
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
