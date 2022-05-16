import { Box, BoxProps, Flex, Text } from 'theme-ui'
import TokenLogo from 'components/icons/TokenLogo'
import Popup from 'components/popup'
import { atom, useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { reserveTokensAtom, rTokenAtom, selectedRTokenAtom } from 'state/atoms'

const tokensAtom = atom((get) => Object.values(get(reserveTokensAtom) || []))

const RTokenSelector = (props: BoxProps) => {
  const [isVisible, setVisible] = useState(false)
  const tokens = useAtomValue(tokensAtom)
  const asdf = useAtomValue(selectedRTokenAtom)
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
        <Box p={2} pt={0} sx={{ minWidth: 150, cursor: 'pointer' }} my={2}>
          {(!tokens || !tokens.length) && <Text>Loading...</Text>}
          {tokens.map((token) => (
            <Flex
              mt={3}
              key={token.token.address}
              onClick={() => handleSelect(token.id)}
              sx={{ alignItems: 'center' }}
            >
              <TokenLogo size="1.5em" mr={2} symbol={token.token.symbol} />
              {token.token.symbol}
            </Flex>
          ))}
        </Box>
      }
    >
      <Flex
        {...props}
        sx={{ alignItems: 'center', cursor: 'pointer' }}
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
        <Box mr={2} />
        {isVisible ? <ChevronUp /> : <ChevronDown />}
      </Flex>
    </Popup>
  )
}

export default RTokenSelector
