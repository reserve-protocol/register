import { Trans, t } from '@lingui/macro'
import { Button, Input, Modal } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import { Check, X } from 'react-feather'
import Skeleton from 'react-loading-skeleton'
import { Box, Card, Flex, Text } from 'theme-ui'
import {
  BridgeTokenDisplay,
  bridgeTokensAtom,
  bridgeTokensSortedAtom,
  selectedBridgeToken,
} from '../atoms'
import { BridgeAsset } from '../utils/assets'

const searchAtom = atom('')
const recordsAtom = atom((get) => {
  const records = get(bridgeTokensSortedAtom)
  const search = get(searchAtom)

  if (!records || !search) return records

  return records.filter((asset) =>
    asset.symbol.toLowerCase().includes(search.trim().toLowerCase())
  )
})

const TokenItem = ({
  token,
  onSelect,
}: {
  token: BridgeTokenDisplay
  onSelect(token: BridgeAsset): void
}) => {
  const selected = useAtomValue(selectedBridgeToken)
  const isSelected = useMemo(
    () => token.asset.L1symbol === selected.L2symbol,
    [selected]
  )

  return (
    <Card
      onClick={() => onSelect(token.asset)}
      role="button"
      sx={{
        cursor: 'pointer',
        ':hover': { backgroundColor: 'background' },
        display: 'flex',
        alignItems: 'center',
      }}
      p={[2, 3]}
    >
      <TokenLogo width={24} src={token.logo} />
      <Box mr="auto">
        <Text ml={3} variant="title">
          {token.symbol}
        </Text>
        <Text ml={3} sx={{ fontSize: 1 }} variant="legend">
          {token.name}
        </Text>
      </Box>

      {!!token.formatted && <Text variant="legend">{token.formatted}</Text>}
      <Box ml="1" sx={{ width: '20px' }}>
        {isSelected && <Check size={18} />}
      </Box>
    </Card>
  )
}

const favoriteTokensAtom = atom((get) => get(bridgeTokensAtom).slice(0, 3))

const ShortHandTokens = ({
  onSelect,
}: {
  onSelect(token: BridgeAsset): void
}) => {
  const tokens = useAtomValue(favoriteTokensAtom)

  return (
    <Box variant="layout.verticalAlign" mb={3} mr={[3, 4]} ml={[4, 5]}>
      {tokens.map((token) => (
        <Button
          onClick={() => onSelect(token)}
          variant="transparent"
          sx={{ borderRadius: '32px', borderColor: 'darkBorder' }}
          small
          mr={3}
        >
          <Box variant="layout.verticalAlign">
            <TokenLogo width={16} src={token.L1icon} />
            <Text ml="2">{token.L1symbol}</Text>
          </Box>
        </Button>
      ))}
    </Box>
  )
}

const TokenList = ({ onSelect }: { onSelect(token: BridgeAsset): void }) => {
  const records = useAtomValue(recordsAtom)
  const search = useAtomValue(searchAtom)

  return (
    <Box
      sx={{ overflow: 'auto', height: ['auto', '360px'] }}
      className="hidden-scrollbar"
      px={[3, 4]}
    >
      {!search && !records && (
        <Skeleton height={30} style={{ marginBottom: 20 }} count={6} />
      )}
      {!!records?.length &&
        records.map((token) => (
          <TokenItem onSelect={onSelect} token={token} key={token.symbol} />
        ))}
      {!!search && !records?.length && (
        <Flex
          sx={{
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text variant="legend">No results</Text>
        </Flex>
      )}
    </Box>
  )
}

const BridgeTokenModal = ({ onClose }: { onClose(): void }) => {
  const [search, setSearch] = useAtom(searchAtom)
  const setToken = useSetAtom(selectedBridgeToken)

  const handleSelect = useCallback(
    (token: BridgeAsset) => {
      setToken(token)
      onClose()
    },
    [setToken]
  )

  return (
    <Modal p={0} width={500}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
          background: 'contentBackground',
        }}
      >
        <Box variant="layout.verticalAlign" p={4} mb={[3, 0]} pb={0}>
          <Text variant="sectionTitle">
            <Trans>Select token</Trans>
          </Text>
          <Button ml="auto" variant="circle" onClick={onClose}>
            <X />
          </Button>
        </Box>
        <Box p={[3, 4]} pt={0}>
          <Input
            placeholder={t`Search by token symbol`}
            value={search}
            autoFocus
            onChange={setSearch}
          />
        </Box>
        <ShortHandTokens onSelect={handleSelect} />
        <TokenList onSelect={handleSelect} />
      </Box>
    </Modal>
  )
}

export default BridgeTokenModal
