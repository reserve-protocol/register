import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { Input } from 'components'
import Help from 'components/help'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { isAddress } from 'utils'

const NewRoleAddress = ({
  onSave,
  onDismiss,
  addresses,
}: {
  onSave(value: string): void
  onDismiss(): void
  addresses: string[]
}) => {
  const [address, setAddress] = useState('')
  const isValid = !!isAddress(address)
  const isExisting =
    isValid &&
    addresses.findIndex((a) => a.toLowerCase() === address.toLowerCase()) !== -1

  return (
    <div>
      <Input
        className="my-3"
        autoFocus
        value={address}
        placeholder="Input address"
        onChange={(e) => setAddress(e.target.value)}
      />
      {((address && !isValid) || isExisting) && (
        <span className="block text-destructive text-xs -mt-2 mb-3 ml-3">
          {isExisting ? (
            <Trans>This address already holds this role</Trans>
          ) : (
            <Trans>Invalid address</Trans>
          )}
        </span>
      )}
      <Button
        size="sm"
        disabled={!isValid || isExisting}
        onClick={() => onSave(address)}
        className="ml-4"
      >
        <Trans>Save</Trans>
      </Button>
      <Button size="sm" onClick={() => onDismiss()} variant="muted" className="ml-4">
        <Trans>Dismiss</Trans>
      </Button>
    </div>
  )
}

interface RoleEditProps {
  title: string
  onChange(addresses: string[]): void
  addresses: string[]
  help?: string
  compact?: boolean
  className?: string
}

const RolesEdit = ({
  title,
  onChange,
  help,
  addresses,
  compact = false,
  className,
}: RoleEditProps) => {
  const [isCreating, setCreate] = useState(false)

  const handleAdd = (address: string) => {
    setCreate(false)
    onChange([...addresses, address])
  }

  const handleRemove = (index: number) => {
    onChange([...addresses.slice(0, index), ...addresses.slice(index + 1)])
  }

  return (
    <div className={className}>
      <div className="flex items-center">
        <span className={cn(compact ? 'ml-3 font-semibold' : 'text-xl font-medium')}>
          {title}
        </span>
        {!!help && <Help content={help} ml={2} />}
      </div>
      {!addresses.length && !isCreating && (
        <span className="block text-legend italic mt-3 ml-3">
          <Trans>No holders for this role...</Trans>
        </span>
      )}
      {addresses.map((addr, index) => (
        <div className="flex items-center flex-wrap mt-3" key={addr}>
          <div className="flex items-center mr-2">
            <div
              className={cn(
                'h-1 w-1 rounded-full bg-foreground mr-3',
                compact ? '' : 'ml-1'
              )}
            />
            <div>
              <span className="block text-legend text-xs">
                <Trans>Current holder</Trans>
              </span>
              <span className="break-all">{addr}</span>
            </div>
          </div>

          <Button
            size="sm"
            variant="destructive"
            className="ml-auto bg-input"
            onClick={() => handleRemove(index)}
          >
            <Trans>Remove</Trans>
          </Button>
        </div>
      ))}
      {isCreating ? (
        <NewRoleAddress
          onSave={handleAdd}
          onDismiss={() => setCreate(false)}
          addresses={addresses}
        />
      ) : (
        <Button
          size="sm"
          className={cn('ml-4', compact ? 'mt-4' : 'mt-6')}
          onClick={() => setCreate(true)}
          variant="muted"
        >
          Add new {title.substring(0, title.length - 1).toLowerCase()}
        </Button>
      )}
    </div>
  )
}

export default RolesEdit
