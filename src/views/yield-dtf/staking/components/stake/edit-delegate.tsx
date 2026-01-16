import { Trans } from '@lingui/macro'
import { Input } from 'components'
import { useState } from 'react'
import { isAddress } from 'utils'
import { Button } from '@/components/ui/button'

const EditDelegate = ({
  onSave,
  onDismiss,
  current,
}: {
  onSave(value: string): void
  onDismiss(): void
  current: string
}) => {
  const [address, setAddress] = useState(current)
  const isValid = !!isAddress(address)

  return (
    <div>
      <div className="flex items-center">
        <span className="text-legend">
          <Trans>Delegate voting power</Trans>
        </span>
        <Button
          size="sm"
          disabled={!isValid}
          onClick={() => onSave(address)}
          className="ml-auto"
        >
          <Trans>Save</Trans>
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onDismiss()}
          className="ml-2"
        >
          <Trans>Cancel</Trans>
        </Button>
      </div>
      <Input
        className="mt-2 mb-3"
        autoFocus
        value={address}
        placeholder="Input address"
        onChange={setAddress}
      />
      {address && !isValid && (
        <span className="text-destructive text-xs block -mt-2 mb-3 ml-3">
          <Trans>Invalid address</Trans>
        </span>
      )}
    </div>
  )
}

export default EditDelegate
