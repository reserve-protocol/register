import { Modal } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { SearchInput } from 'components/input'
import { useAtom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { ArrowUpRight, X } from 'react-feather'
import { chainIdAtom } from 'state/atoms'
import { colors } from 'theme'
import { Box, Button, Divider, Link, Text } from 'theme-ui'
import { shortenString } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { ui } from '../zap/state/ui-atoms'

const ZapTokenList = ({ onSelect }: { onSelect: () => void }) => {
  const chainId = useAtomValue(chainIdAtom)
  const [tokens, setZapToken] = useAtom(ui.input.tokenSelector.tokenSelector)
  const entries = useMemo(
    () =>
      tokens.map((token) => ({
        token,
        selectToken: () => {
          setZapToken(token)
          onSelect()
        },
        balance: '0.00', //TODO: Fix token balances
      })),
    [setZapToken, tokens]
  )

  return (
    <Box
      sx={{
        background: 'background',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '140px',
        overflow: 'auto',
      }}
    >
      {entries.map(({ token, selectToken, balance }) => (
        <Box
          key={token.symbol}
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
          <TokenLogo symbol={token.symbol} width={24} />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Text variant="body" sx={{ fontWeight: 'bold' }}>
              {token.symbol}
            </Text>
            <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
              <Text variant="contentTitle" sx={{ color: 'darkGrey' }}>
                {shortenString(token.address.address)}
              </Text>
              <Link
                href={getExplorerLink(
                  token.address.address,
                  chainId,
                  ExplorerDataType.TOKEN
                )}
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
      ))}
    </Box>
  )
}

const ZapTokensModal = ({ onClose }: { onClose: () => void }) => {
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
            onClick={onClose}
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
            value={''} // TODO: Add search functionality
            onChange={() => undefined} // TODO: Add search functionality
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
          <ZapTokenList onSelect={onClose} />
        </Box>
      </Box>
    </Modal>
  )
}

export default ZapTokensModal
