import EarnBenefits from '@/views/earn/components/earn-benefits'
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

const Header = () => (
  <div>
    <Hero />
    <EarnBenefits
      items={[
        {
          icon: <ShieldAlert className="w-4 h-4" />,
          label: <Trans>Slashing Risk</Trans>,
        },
        {
          icon: <LockKeyholeOpen className="w-4 h-4" />,
          label: <Trans>14-day unlock delays</Trans>,
        },
        {
          icon: <Coins className="w-4 h-4" />,
          label: <Trans>Payouts in RSR</Trans>,
        },
      ]}
    />
  </div>
)

export default Header
