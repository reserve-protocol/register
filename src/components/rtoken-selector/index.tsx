import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import TokenLogo from 'components/icons/TokenLogo'
import Popup from 'components/popup'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useLocation, useNavigate } from 'react-router-dom'
import rtokens from 'rtokens'
import { rTokenAtom, selectedRTokenAtom } from 'state/atoms'
import { transition } from 'theme'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { CHAIN_ID } from 'utils/chains'
import { DEFAULT_TOKENS } from 'utils/constants'

// TODO: Separate component
const ActionItem = styled(Flex)`
  transition: ${transition};
  padding: 16px;
  border-bottom: 1px solid var(--theme-ui-colors-border);
  cursor: pointer;

  &:first-of-type {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  &:last-of-type {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    border-bottom: none;
  }

  &:hover {
    background-color: var(--theme-ui-colors-secondary);
  }
`

const TokenItem = ({ symbol, logo }: { symbol: string; logo: string }) => (
  <Flex sx={{ alignItems: 'center' }}>
    <TokenLogo size="1.2em" mr={2} src={require(`rtokens/images/${logo}`)} />
    <Text>{symbol}</Text>
  </Flex>
)

const TokenList = ({ onSelect }: { onSelect(address: string): void }) => (
  <Box>
    {DEFAULT_TOKENS[CHAIN_ID].map((address) => (
      <ActionItem key={address} onClick={() => onSelect(address)}>
        <TokenItem
          symbol={rtokens[CHAIN_ID][address].symbol}
          logo={rtokens[CHAIN_ID][address].logo}
        />
      </ActionItem>
    ))}
  </Box>
)

const SelectedToken = () => {
  const selectedAddress = useAtomValue(selectedRTokenAtom)
  const selected =
    useAtomValue(rTokenAtom) ?? rtokens[CHAIN_ID][selectedAddress]

  if (!selectedAddress) {
    return (
      <Text>
        <Trans>Select RToken</Trans>
      </Text>
    )
  }

  const { symbol = shortenAddress(selectedAddress), logo = 'rsv.png' } =
    selected ?? {}

  return <TokenItem logo={logo} symbol={symbol} />
}

const RTokenSelector = (props: BoxProps) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [isVisible, setVisible] = useState(false)
  const [selected, setSelected] = useAtom(selectedRTokenAtom)

  const handleSelect = useCallback(
    (token: string) => {
      if (token !== selected) {
        setSelected(token)
        navigate(`${pathname}?token=${token}`)
        setVisible(false)
      }
    },
    [setSelected, selected]
  )

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={<TokenList onSelect={handleSelect} />}
    >
      <Flex
        {...props}
        sx={{ alignItems: 'center', cursor: 'pointer', minWidth: 100 }}
        onClick={() => setVisible(!isVisible)}
      >
        <SelectedToken />
        <Box mx="auto" />
        {isVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </Flex>
    </Popup>
  )
}

export default RTokenSelector
