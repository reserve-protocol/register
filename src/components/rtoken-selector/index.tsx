import styled from '@emotion/styled'
import TokenLogo from 'components/icons/TokenLogo'
import Popup from 'components/popup'
import { useAtom, useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useSearchParams } from 'react-router-dom'
import rtokens from 'rtokens'
import { selectedRTokenAtom, rTokenAtom } from 'state/atoms'
import { transition } from 'theme'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
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
  <>
    <TokenLogo size="1.5em" mr={2} src={require(`rtokens/images/${logo}`)} />
    {symbol}
  </>
)

const TokenList = ({ onSelect }: { onSelect(address: string): void }) => (
  <Box>
    {DEFAULT_TOKENS.map((address) => (
      <ActionItem key={address} onClick={() => onSelect(address)}>
        <TokenItem
          symbol={rtokens[address].symbol}
          logo={rtokens[address].logo}
        />
      </ActionItem>
    ))}
  </Box>
)

const SelectedToken = () => {
  const selectedAddress = useAtomValue(selectedRTokenAtom)
  const selected = useAtomValue(rTokenAtom) ?? rtokens[selectedAddress]

  if (!selectedAddress) {
    return <Text>Select RToken...</Text>
  }

  const { symbol = shortenAddress(selectedAddress), logo = 'rsv.png' } =
    selected ?? {}

  return <TokenItem logo={logo} symbol={symbol} />
}

const RTokenSelector = (props: BoxProps) => {
  const [, setSearchParams] = useSearchParams()
  const [isVisible, setVisible] = useState(false)
  const [selected, setSelected] = useAtom(selectedRTokenAtom)

  const handleSelect = useCallback(
    (token: string) => {
      setSelected(token)
      setSearchParams({ token })
      setVisible(false)
    },
    [setSelected]
  )

  useEffect(() => {
    if (selected) {
      setSearchParams({ token: selected })
    }
  }, [])

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
        {isVisible ? <ChevronUp /> : <ChevronDown />}
      </Flex>
    </Popup>
  )
}

export default RTokenSelector
