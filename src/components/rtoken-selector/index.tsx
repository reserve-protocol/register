import { Box, BoxProps, Flex, Text } from 'theme-ui'
import TokenLogo from 'components/icons/TokenLogo'
import Popup from 'components/popup'
import { atom, useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { reserveTokensAtom, rTokenAtom, selectedRTokenAtom } from 'state/atoms'
import styled from '@emotion/styled'
import { transition } from 'theme'

const tokensAtom = atom((get) => Object.values(get(reserveTokensAtom) || []))

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

const RTokenSelector = (props: BoxProps) => {
  const [isVisible, setVisible] = useState(false)
  const tokens = useAtomValue(tokensAtom)
  const selected = useAtomValue(rTokenAtom)
  const setSelected = useUpdateAtom(selectedRTokenAtom)

  if (!tokens.length) {
    return <span>Loading...</span>
  }

  const handleSelect = (token: string) => {
    setSelected(token)
    setVisible(false)
  }

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={
        <Box>
          {(!tokens || !tokens.length) && <Text>Loading...</Text>}
          {tokens.map((token) => (
            <ActionItem
              key={token.token.address}
              onClick={() => handleSelect(token.id)}
            >
              <TokenLogo size="1.5em" mr={2} symbol={token.token.symbol} />
              {token.token.symbol}
            </ActionItem>
          ))}
        </Box>
      }
    >
      <Flex
        {...props}
        sx={{ alignItems: 'center', cursor: 'pointer', minWidth: 100 }}
        onClick={() => setVisible(!isVisible)}
      >
        {selected ? (
          <Flex sx={{ alignItems: 'center' }}>
            <TokenLogo size="1.5em" mr={2} symbol={selected.token.symbol} />
            {selected.token.symbol}
          </Flex>
        ) : (
          <Text>Select RToken...</Text>
        )}
        <Box mx="auto" />
        {isVisible ? <ChevronUp /> : <ChevronDown />}
      </Flex>
    </Popup>
  )
}

export default RTokenSelector
