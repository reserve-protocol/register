import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Trans } from '@lingui/react/macro'
import { ArrowUpRight, BadgeCheck } from 'lucide-react'

// Quiet verification badge above the holdings table. Links to Ondo (the
// custodian of the underlying tokenized stocks) as substantiation; URL
// should deep-link to their tokenized-stocks page once we settle on the
// destination. Copy is PLACEHOLDER pending compliance sign-off ("100%
// backed" is a strong claim).
const OndoBackedBadge = () => {
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')

  return (
    <div className="px-5 pt-5 sm:px-6 sm:pt-6">
      <a
        href="https://ondo.finance"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          trackClick('ondo-backed-badge', { url: 'https://ondo.finance' })
        }}
        className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring"
      >
        <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
        <Trans>Reserve equity DTFs are 100% backed by real stocks.</Trans>
        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:transition-none" />
      </a>
    </div>
  )
}

export default OndoBackedBadge
