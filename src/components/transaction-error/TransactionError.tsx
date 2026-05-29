import { cn } from '@/lib/utils'
import { useLingui } from '@lingui/react/macro'

interface Props {
  error?: Error | null
  withName?: boolean
  className?: string
}

const TransactionError = ({ error, withName = true, className }: Props) => {
  const { t } = useLingui()
  if (!error) {
    return null
  }
  let parsed = false

  const messageSplit = error.message.split('\n')
  let message =
    messageSplit.length > 1
      ? messageSplit[0] + ' ' + messageSplit[1]
      : (messageSplit[0] ?? '')

  if (message.includes('0x168cdd18')) {
    parsed = true
    message = t`Proposal cannot be executed while another auction is currently running`
  }

  return (
    <div className={className}>
      <span
        className={cn(
          'text-sm text-destructive whitespace-break-spaces',
          parsed ? 'break-words' : 'break-all'
        )}
      >
        {withName && `${error.name}:`}
        {withName && <br />}
        {message}
      </span>
    </div>
  )
}

export default TransactionError
