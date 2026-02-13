import { Trans } from '@lingui/macro'
import { Input } from 'components'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { isAddress } from 'utils'

const NewAssetAddress = ({
  onSave,
  addresses,
}: {
  onSave(value: string): void
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
        className="my-4"
        value={address}
        placeholder="Input address"
        onChange={(e) => setAddress(e.target.value)}
      />
      {((address && !isValid) || isExisting) && (
        <span className="text-destructive -mt-2 mb-4 ml-4 text-xs block">
          {isExisting ? (
            <Trans>This asset is already (being) registered</Trans>
          ) : (
            <Trans>Invalid asset</Trans>
          )}
        </span>
      )}
      <Button
        size="sm"
        disabled={!isValid || isExisting}
        onClick={() => {
          setAddress('')
          onSave(address)
        }}
        className="ml-6"
      >
        <Trans>Save</Trans>
      </Button>
    </div>
  )
}

interface RoleEditProps {
  onChange(address: string): void
  addresses: string[]
  className?: string
}

const RegisterEdit = ({ onChange, addresses }: RoleEditProps) => {
  const handleAdd = (address: string) => {
    onChange(address)
  }

  return <NewAssetAddress onSave={handleAdd} addresses={addresses} />
}

export default RegisterEdit
