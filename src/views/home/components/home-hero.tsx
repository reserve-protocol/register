import { Trans } from '@lingui/react/macro'
import EusdGlobe from './eusd-globe'

const HomeHero = () => (
  <div className="flex w-full max-w-[520px] flex-col items-center text-center">
    <div className="mb-4 w-full">
      <EusdGlobe />
    </div>
    <h1 className="mb-3 text-balance text-[28px] font-normal leading-[1.25] text-primary dark:text-foreground md:text-[32px]">
      <Trans>
        eUSD lets fintechs monetize their user balances at the DeFi rate
      </Trans>
    </h1>
    <p className="text-lg leading-[1.25] md:text-xl">
      <Trans>
        User balances remain in eUSD while underlying collateral yield is
        directed to the fintech, simplifying the UX for the customer and the
        business.
      </Trans>
    </p>
  </div>
)

export default HomeHero
