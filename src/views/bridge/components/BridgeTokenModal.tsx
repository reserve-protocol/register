import { Trans, t } from '@lingui/macro'
import { Button, Modal } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { SearchInput } from 'components/input'
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
import { useSearchParams } from 'react-router-dom'

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
        ':hover': { backgroundColor: 'border' },
        backgroundColor: 'background',
        border: '1px solid',
        borderColor: 'darkBorder',
        display: 'flex',
        alignItems: 'center',
      }}
      px={[2, 3]}
      py={2}
      mb={2}
    >
      <TokenLogo width={24} src={token.logo} />
      <Box mr="auto">
        <Text ml={3} mb={-1} variant="title">
          {token.symbol}
        </Text>
        <Text ml={3} sx={{ fontSize: 1 }} variant="legend">
          {token.name}
        </Text>
      </Box>

      {!!token.formatted && <Text variant="legend">{token.formatted}</Text>}
      {isSelected && (
        <Box ml="1" mt={2} sx={{ width: '20px' }}>
          <Check size={18} />
        </Box>
      )}
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
    <Box variant="layout.verticalAlign" mb={3} mr={[3, 3]} ml={3}>
      {tokens.map((token) => (
        <Button
          key={token.L1symbol}
          onClick={() => onSelect(token)}
          variant="transparent"
          small
          mr={'10px'}
          sx={{
            borderColor: 'inputBorder',
            backgroundColor: 'backgroundNested',
          }}
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
      sx={{
        overflow: 'auto',
        height: ['auto', '360px'],
        borderTop: '1px solid',
        borderColor: 'darkBorder',
        background: 'backgroundNexted',
      }}
      className="hidden-scrollbar"
      px={[3, 3]}
      py={3}
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
  const [searchParams, setSearchParams] = useSearchParams()

  const handleSelect = useCallback(
    (token: BridgeAsset) => {
      setToken(token)
      searchParams.set('asset', token.L1symbol)
      setSearchParams(searchParams)
      onClose()
    },
    [setToken]
  )

  return (
    <Modal
      p={0}
      width={525}
      sx={{ border: '3px solid', borderColor: 'borderFocused' }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
          backgroundColor: 'background',
        }}
      >
        <Box variant="layout.verticalAlign" p={4} mb={[3, 0]} pb={0}>
          <Text variant="sectionTitle">
            <Trans>Select token</Trans>
          </Text>
          <Button
            variant="circle"
            onClick={onClose}
            sx={{ marginLeft: 'auto', backgroundColor: 'transparent' }}
          >
            <X />
          </Button>
        </Box>
        <Box p={[3, 3]} pt={0}>
          <SearchInput
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
