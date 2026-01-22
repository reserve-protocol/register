import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  isNew: boolean
  label: string
  onRevert?(): void
  className?: string
}

const ListItemPreview = ({ isNew, label, onRevert, className }: Props) => (
  <div className={cn('flex items-center', className)}>
    {isNew ? (
      <Plus color="#11BB8D" size={18} />
    ) : (
      <X color="#FF0000" size={18} />
    )}
    <div className="ml-2">
      <span className="text-legend text-xs block">
        {isNew ? <Trans>Add</Trans> : <Trans>Remove</Trans>}
      </span>
      <span>{label}</span>
    </div>
    {!!onRevert && (
      <Button size="sm" variant="ghost" onClick={onRevert} className="ml-auto">
        <Trans>Revert</Trans>
      </Button>
    )}
  </div>
)

export default ListItemPreview
