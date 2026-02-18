import { t } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface InfoBoxProps {
  title: string
  subtitle: string
  className?: string
}

const InfoBox = ({ title, subtitle, className }: InfoBoxProps) => (
  <div className={className}>
    <span className="font-semibold text-sm block mb-2">{title}</span>
    <span className="text-legend text-xs">{subtitle}</span>
  </div>
)

const ListingInfo = ({ className }: { className?: string }) => (
  <div className={cn('border rounded-3xl p-4', className)}>
    <InfoBox
      title={t`Register Listing`}
      subtitle={t`Please read more about how Register manage tokens on our repository`}
    />
    <div className="flex mt-2 mb-3">
      <Button
        variant="muted"
        size="sm"
        className="mr-2"
        onClick={() =>
          window.open('https://github.com/lc-labs/register', '_blank')
        }
      >
        Github/lclabs
      </Button>
    </div>
    <InfoBox
      className="mb-3"
      title={t`What is Reserve Governor Alexios?`}
      subtitle={t`Alexios is standard token-voting adopted from Compound Governor Bravo, with adjustments accounting for RSR being staked across multiple RTokens.`}
    />
    <InfoBox
      className="mb-3"
      title={t`Unpausing`}
      subtitle={t`If your token is paused and you have the correct role, you can unpause it here.`}
    />
    <InfoBox
      title={t`Roles`}
      subtitle="Please read more about the different roles in Alexios and the Reserve protocol in the documentation."
    />
  </div>
)

export default ListingInfo
