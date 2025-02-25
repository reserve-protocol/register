import { Trans } from '@lingui/macro'
import { SmallButton } from '@/components/old/button'
import { useAtomValue } from 'jotai'
import { rTokenAssetsAtom } from 'state/atoms'
import { Box, BoxProps, Text } from 'theme-ui'

interface UnregisterEditProps extends Omit<BoxProps, 'onChange'> {
  onChange(addresses: string): void
  addresses: string[]
  help?: string
  compact?: boolean
}

const UnregisterEdit = ({
  onChange,
  help,
  addresses,
  compact = false,
  ...props
}: UnregisterEditProps) => {
  const allAssets = useAtomValue(rTokenAssetsAtom)

  const filteredAssets = Object.values(allAssets || {}).filter((asset) =>
    addresses.includes(asset.address)
  )

  const handleRemove = (asset: string) => {
    onChange(asset)
  }

  return (
    <Box {...props}>
      {!addresses.length && (
        <Text
          variant="legend"
          sx={{ fontStyle: 'italic', display: 'block' }}
          mt={3}
          ml={3}
        >
          <Trans>No assets to unregister...</Trans>
        </Text>
      )}
      {filteredAssets.map((asset) => (
        <Box
          variant="layout.verticalAlign"
          sx={{ flexWrap: 'wrap' }}
          key={asset.address}
          mt={3}
        >
          <Box mr={2} variant="layout.verticalAlign">
            <Box
              ml={compact ? 0 : 1}
              mr={3}
              sx={{
                height: '4px',
                width: '4px',
                borderRadius: '100%',
                backgroundColor: 'text',
              }}
            />
            <Box>
              <Text sx={{ fontSize: 1, display: 'block' }} variant="legend">
                {asset.token.symbol}
              </Text>
              <Text sx={{ wordBreak: 'break-word' }}>{asset.address}</Text>
            </Box>
          </Box>
          <SmallButton
            ml="auto"
            variant="danger"
            sx={{ backgroundColor: 'inputBorder' }}
            onClick={() => handleRemove(asset.address)}
          >
            <Trans>Unregister</Trans>
          </SmallButton>
        </Box>
      ))}
    </Box>
  )
}

export default UnregisterEdit
