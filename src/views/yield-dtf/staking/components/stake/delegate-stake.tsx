import { Trans } from '@lingui/macro'
import { Edit2 } from 'lucide-react'
import { shortenAddress } from 'utils'
import EditDelegate from './edit-delegate'
import { Button } from '@/components/ui/button'

const DelegateStake = ({
  editing,
  onEdit,
  value,
  onChange,
}: {
  value: string
  editing: boolean
  onEdit(value: boolean): void
  onChange(value: string): void
}) => (
  <>
    {editing ? (
      <EditDelegate
        current={value}
        onSave={onChange}
        onDismiss={() => onEdit(false)}
      />
    ) : (
      <div className="flex items-center">
        <span>
          <Trans>Voting power delegation</Trans>:
        </span>

        {value ? (
          <div className="ml-auto flex items-center">
            <span className="font-semibold">{shortenAddress(value)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => onEdit(true)}
            >
              <Edit2 size={14} />
            </Button>
          </div>
        ) : (
          <span className="ml-auto text-legend">
            <Trans>Connect your wallet</Trans>
          </span>
        )}
      </div>
    )}
  </>
)

export default DelegateStake
