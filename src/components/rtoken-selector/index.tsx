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
import rtokens from 'rtokens'
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

const RTokenSelector = (props: BoxProps) => {
  const [isVisible, setVisible] = useState(false)
  const selected = useAtomValue(rTokenAtom)
  const setSelected = useUpdateAtom(selectedRTokenAtom)

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
          {DEFAULT_TOKENS.map((address) => (
            <ActionItem key={address} onClick={() => handleSelect(address)}>
              <TokenLogo size="1.5em" mr={2} src={rtokens[address].logo} />
              {rtokens[address].symbol}
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
