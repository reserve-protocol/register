import { Trans } from '@lingui/macro'
import BackingForm from 'components/rtoken-setup/token/BackingForm'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface BackingManagerProps {
  className?: string
}

const BackingManager = ({ className }: BackingManagerProps) => {
  return (
    <Card className={`p-4 bg-secondary ${className || ''}`}>
      <span className="text-xl font-medium">
        <Trans>Backing Manager</Trans>
      </span>
      <Separator className="my-4 -mx-4 border-muted" />
      <BackingForm />
    </Card>
  )
}

export default BackingManager
