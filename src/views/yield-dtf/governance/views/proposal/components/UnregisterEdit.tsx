import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { useAtomValue } from 'jotai'
import { rTokenAssetsAtom } from 'state/atoms'

interface UnregisterEditProps {
  onChange(addresses: string): void
  addresses: string[]
  help?: string
  compact?: boolean
  className?: string
}

const UnregisterEdit = ({
  onChange,
  addresses,
  compact = false,
  className,
}: UnregisterEditProps) => {
  const allAssets = useAtomValue(rTokenAssetsAtom)

  const filteredAssets = Object.values(allAssets || {}).filter((asset) =>
    addresses.includes(asset.address)
  )

  const handleRemove = (asset: string) => {
    onChange(asset)
  }

  return (
    <div className={className}>
      {!addresses.length && (
        <span className="text-legend italic block mt-4 ml-4">
          <Trans>No assets to unregister...</Trans>
        </span>
      )}
      {filteredAssets.map((asset) => (
        <div
          className="flex items-center flex-wrap mt-4"
          key={asset.address}
        >
          <div className="mr-2 flex items-center">
            <div
              className={`${compact ? 'ml-0' : 'ml-1'} mr-4 h-1 w-1 rounded-full bg-foreground`}
            />
            <div>
              <span className="text-xs block text-legend">
                {asset.token.symbol}
              </span>
              <span className="break-all">{asset.address}</span>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            className="ml-auto bg-input"
            onClick={() => handleRemove(asset.address)}
          >
            <Trans>Unregister</Trans>
          </Button>
        </div>
      ))}
    </div>
  )
}

export default UnregisterEdit
