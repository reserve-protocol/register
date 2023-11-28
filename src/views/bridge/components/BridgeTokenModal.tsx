import { Input, Modal } from 'components'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useState } from 'react'
import {
  BridgeTokenDisplay,
  bridgeTokensSortedAtom,
  selectedBridgeToken,
} from '../atoms'
import { Box, Text } from 'theme-ui'
import Skeleton from 'react-loading-skeleton'
import TokenLogo from 'components/icons/TokenLogo'
import { BridgeAsset } from '../utils/assets'
import { t } from '@lingui/macro'

const TokenItem = ({
  token,
  onSelect,
}: {
  token: BridgeTokenDisplay
  onSelect(token: BridgeAsset): void
}) => (
  <Box
    onClick={() => onSelect(token.asset)}
    role="button"
    variant="layout.verticalAlign"
    key={token.symbol}
    sx={{ cursor: 'pointer' }}
    mb={3}
  >
    <TokenLogo width={24} src={token.logo} />
    <Text ml={3} variant="title">
      {token.symbol}
    </Text>
    {!!token.formatted && (
      <Text ml="auto" variant="legend">
        {token.formatted}
      </Text>
    )}
  </Box>
)

const BridgeTokenModal = ({ onClose }: { onClose(): void }) => {
  const [search, setSearch] = useState('')
  const list = useAtomValue(bridgeTokensSortedAtom)
  const setToken = useSetAtom(selectedBridgeToken)

  const handleSelect = useCallback(
    (token: BridgeAsset) => {
      setToken(token)
      onClose()
    },
    [setToken]
  )

  return (
    <Modal p={0} onClose={onClose} title="Select token">
      <Box>
        <Input
          placeholder={t`Search by token symbol`}
          value={search}
          onChange={setSearch}
        />
      </Box>

      {!list ? (
        <Skeleton height={20} style={{ marginBottom: 20 }} count={5} />
      ) : (
        <Box
          px={4}
          className="hidden-srollbar"
          sx={{ overflow: 'auto', maxHeight: 300 }}
        >
          {list.map((token) => (
            <TokenItem
              onSelect={handleSelect}
              token={token}
              key={token.symbol}
            />
          ))}
        </Box>
      )}
    </Modal>
  )
}

export default BridgeTokenModal
