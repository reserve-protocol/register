import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import Popup from 'components/popup'
import TokenItem from 'components/token-item'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { memo, useCallback, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { accountRTokensAtom, rTokenAtom, selectedRTokenAtom } from 'state/atoms'
import { transition } from 'theme'
import { Box, BoxProps, Divider, Flex, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { DEFAULT_TOKENS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { ROUTES } from 'utils/constants'
import rtokens from 'utils/rtokens'

interface TokenDisplay {
  address: string
  symbol: string
  logo: string
}

const DEFAULT_LOGO = '/svgs/default.svg'

const availableTokensAtom = atom((get) => {
  const defaultTokens = DEFAULT_TOKENS[CHAIN_ID]
  const owned = get(accountRTokensAtom)
  const tokenList: {
    [x: string]: TokenDisplay
  } = {}

  for (const tokenAddress of defaultTokens) {
    const token = rtokens[tokenAddress]

    if (token) {
      tokenList[tokenAddress] = {
        address: tokenAddress,
        symbol: token.symbol,
        logo: token.logo
          ? require(`@lc-labs/rtokens/images/${token.logo}`)
          : DEFAULT_LOGO,
      }
    }
  }

  for (const token of owned) {
    if (!tokenList[token.address]) {
      tokenList[token.address] = {
        address: token.address,
        symbol: token.symbol,
        logo: DEFAULT_LOGO,
      }
    }
  }

  return tokenList
})

// TODO: Separate component
const ActionItem = styled(Flex)`
  transition: ${transition};
  padding: 16px;
  cursor: pointer;

  &:hover {
    background-color: var(--theme-ui-colors-secondary);
  }
`

const TokenList = memo(
  ({
    onSelect,
    onHome,
  }: {
    onSelect(address: string): void
    onHome(): void
  }) => {
    const tokens = useAtomValue(availableTokensAtom)

    return (
      <Box
        sx={{
          maxHeight: 320,
          overflow: 'auto',
          backgroundColor: 'contentBackground',
          borderRadius: '8px',
        }}
      >
        <Box p={3}>
          <SmallButton variant="muted" onClick={onHome}>
            <Trans>Go to Dashboard</Trans>
          </SmallButton>
        </Box>
        {!!Object.values(tokens).length && (
          <Divider sx={{ border: 'darkBorder' }} my={0} />
        )}
        {Object.values(tokens).map(({ address, logo, symbol }) => (
          <ActionItem key={address} onClick={() => onSelect(address)}>
            <TokenItem symbol={symbol} logo={logo} />
          </ActionItem>
        ))}
      </Box>
    )
  }
)

const SelectedToken = () => {
  const selectedAddress = useAtomValue(selectedRTokenAtom)
  const rToken = useAtomValue(rTokenAtom)
  const tokenList = useAtomValue(availableTokensAtom)
  const { symbol, logo } = useMemo(() => {
    if (tokenList[selectedAddress]) {
      return tokenList[selectedAddress]
    }

    if (rToken) {
      return {
        symbol: rToken.symbol,
        logo: DEFAULT_LOGO,
      }
    }

    return {
      symbol: shortenAddress(selectedAddress),
      logo: DEFAULT_LOGO,
    }
  }, [selectedAddress, rToken?.symbol])

  if (!selectedAddress) {
    return (
      <Text>
        <Trans>Select RToken</Trans>
      </Text>
    )
  }

  return (
    <TokenItem
      sx={{ overflow: 'hidden', width: [60, 'auto'], textOverflow: 'ellipsis' }}
      logo={logo}
      symbol={symbol}
    />
  )
}

const RTokenSelector = (props: BoxProps) => {
  const navigate = useNavigate()
  const [isVisible, setVisible] = useState(false)
  const [selected, setSelected] = useAtom(selectedRTokenAtom)
  const updateToken = useUpdateAtom(selectedRTokenAtom)

  const handleSelect = useCallback(
    (token: string) => {
      if (token !== selected) {
        setSelected(token)
        navigate(`${ROUTES.OVERVIEW}?token=${token}`)
        setVisible(false)
      }
    },
    [setSelected, selected]
  )

  const handleHome = useCallback(() => {
    updateToken('')
    navigate('/')
    setVisible(false)
  }, [setVisible, updateToken, navigate])

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={<TokenList onSelect={handleSelect} onHome={handleHome} />}
    >
      <Flex
        {...props}
        sx={{ alignItems: 'center', cursor: 'pointer', minWidth: 100 }}
        onClick={() => setVisible(!isVisible)}
      >
        <SelectedToken />
        <Box mr="2" />
        {isVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </Flex>
    </Popup>
  )
}

export default RTokenSelector
