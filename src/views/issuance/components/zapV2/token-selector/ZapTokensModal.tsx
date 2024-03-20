import { Modal } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { SearchInput } from 'components/input'
import { useMemo, useState } from 'react'
import { ArrowUpRight, X } from 'react-feather'
import { colors } from 'theme'
import { Box, Button, Divider, Link, Text } from 'theme-ui'
import { shortenString } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address } from 'viem'
import { useZap } from '../context/ZapContext'
import ZapManualMint from './ZapManualMint'

const ZapTokenList = ({
  entries,
}: {
  entries: {
    address: Address
    symbol: string
    selectToken: () => void
    explorerLink: string
    balance: string
  }[]
}) => {
  return (
    <Box
      sx={{
        height: ['auto', '360px'],
        background: 'background',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '140px',
        overflow: 'auto',
      }}
    >
      {entries.map(
        ({ address, symbol, selectToken, explorerLink, balance }) => (
          <Box
            key={symbol}
            variant="layout.verticalAlign"
            px="12px"
            py={2}
            sx={{
              gap: '12px',
              cursor: 'pointer',
              borderRadius: '10px',
              ':hover': {
                backgroundColor: 'lightGrey',
              },
            }}
            onClick={selectToken}
          >
            <TokenLogo symbol={symbol} width={24} />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Text variant="body" sx={{ fontWeight: 'bold' }}>
                {symbol}
              </Text>
              <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                <Text variant="contentTitle" sx={{ color: 'darkGrey' }}>
                  {shortenString(address)}
                </Text>
                <Link
                  href={explorerLink}
                  target="_blank"
                  sx={{ display: 'flex', alignItems: 'center' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ArrowUpRight color={colors.secondaryText} size={14} />
                </Link>
              </Box>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <Text>{balance}</Text>
            </Box>
          </Box>
        )
      )}
    </Box>
  )
}

const ZapTokensModal = () => {
  const { chainId, tokens, setSelectedToken, setOpenTokenSelector } = useZap()
  const [search, setSearch] = useState<string>('')

  const entries = useMemo(
    () =>
      tokens
        .map((token) => ({
          address: token.address as Address,
          symbol: token.symbol,
          selectToken: () => {
            setSelectedToken(token)
            setOpenTokenSelector(false)
          },
          explorerLink: getExplorerLink(
            token.address,
            chainId,
            ExplorerDataType.TOKEN
          ),
          balance: token.balance ?? '0',
        }))
        .filter(
          (entry) =>
            entry.symbol.toLowerCase().includes(search.toLowerCase()) ||
            entry.address.toLowerCase().includes(search.toLowerCase())
        ),
    [setSelectedToken, tokens, chainId, search, setOpenTokenSelector]
  )

  return (
    <Modal
      p={0}
      width={420}
      sx={{ border: '3px solid', borderColor: 'borderFocused' }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
          backgroundColor: 'backgroundNested',
        }}
      >
        <Box variant="layout.verticalAlign" p={4} mb={[3, 0]} pt={3} pb={0}>
          <Text variant="sectionTitle">Mint using</Text>
          <Button
            variant="circle"
            onClick={() => setOpenTokenSelector(false)}
            sx={{ marginLeft: 'auto', backgroundColor: 'transparent' }}
          >
            <X />
          </Button>
        </Box>
        <Box
          p={['12px', '12px']}
          pt={0}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <SearchInput
            placeholder="Search by token name or address"
            autoFocus
            value={search}
            onChange={setSearch}
            backgroundColor="focusedBackground"
            sx={{
              '&:focus': {
                backgroundColor: 'focusedBackground',
              },
              '&:hover': {
                backgroundColor: 'focusedBackground',
              },
            }}
          />
          <Divider sx={{ mx: '-12px', my: 0 }} />
          <ZapTokenList entries={entries} />
          <Divider sx={{ mx: '-12px', my: 0 }} />
          <ZapManualMint />
        </Box>
      </Box>
    </Modal>
  )
}

export default ZapTokensModal
