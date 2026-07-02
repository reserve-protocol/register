import EarnBenefits from '@/views/earn/components/earn-benefits'
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

const Header = () => (
  <>
    <Hero />
    <EarnBenefits
      items={[
        {
          icon: <ShieldCheck className="w-4 h-4" />,
          label: <Trans>No Slashing Risk</Trans>,
        },
        {
          icon: <LockKeyholeOpen className="w-4 h-4" />,
          label: <Trans>7-day unlock delays</Trans>,
        },
        {
          icon: <Coins className="w-4 h-4" />,
          label: <Trans>Payouts in DTF</Trans>,
        },
      ]}
    />
  </>
)

export default Header
