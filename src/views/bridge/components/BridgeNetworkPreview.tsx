import { Trans, t } from '@lingui/macro'
import { chainIcons } from 'components/chain-selector/ChainSelector'
import { useAtomValue } from 'jotai'
import { ArrowRight } from 'react-feather'
import { Box, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { isBridgeWrappingAtom } from '../atoms'

const chains = {
  [ChainId.Mainnet]: { label: 'Ethereum' },
  [ChainId.Base]: { label: 'Base' },
}

const NetworkInfo = ({ id, label }: { id: number; label: string }) => (
  <Box variant="layout.verticalAlign">
    {chainIcons[id]({ fontSize: 20 })}
    <Box ml={2}>
      <Text variant="legend" sx={{ display: 'block' }}>
        {label}
      </Text>
      <Text>{chains[id].label}</Text>
    </Box>
  </Box>
)

const BridgeNetworkPreview = () => {
  const isWrapping = useAtomValue(isBridgeWrappingAtom)

  return (
    <Box>
      <Text>
        <Trans>Network</Trans>
      </Text>
      <Box mt={2} variant="layout.verticalAlign">
        <NetworkInfo
          id={isWrapping ? ChainId.Mainnet : ChainId.Base}
          label={t`From`}
        />
        <ArrowRight size={18} style={{ marginLeft: 16, marginRight: 16 }} />
        <NetworkInfo
          id={isWrapping ? ChainId.Base : ChainId.Mainnet}
          label={t`to`}
        />
      </Box>
    </Box>
  )
}

export default BridgeNetworkPreview
