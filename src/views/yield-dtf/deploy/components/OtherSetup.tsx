import { Trans } from '@lingui/macro'
import OtherForm from 'components/rtoken-setup/token/OtherForm'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface OtherSetupProps {
  className?: string
}

const OtherSetup = ({ className }: OtherSetupProps) => (
  <Card className={`p-4 bg-secondary ${className || ''}`}>
    <span className="text-xl font-medium">
      <Trans>Other parameters</Trans>
    </span>
    <Separator className="my-4 -mx-4 border-muted" />
    <OtherForm />
  </Card>
)

export default OtherSetup
