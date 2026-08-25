import { Trans } from '@lingui/react/macro'
import { BadgeCheck } from 'lucide-react'

// Quiet verification badge above the holdings table. Copy is PLACEHOLDER
// pending compliance sign-off ("100% backed" is a strong claim).
const BackedBadge = () => (
  <div className="px-5 pt-5 sm:px-6 sm:pt-6">
    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
      <Trans>Reserve equity DTFs are 100% backed by real stocks.</Trans>
    </div>
  </div>
)

export default BackedBadge
