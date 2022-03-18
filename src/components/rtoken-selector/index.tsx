import { BoxProps, Box, Flex, Text } from '@theme-ui/components'
import TokenLogo from 'components/icons/TokenLogo'
import Popup from 'components/popup'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useDispatch } from 'react-redux'
import { useAppSelector } from 'state/hooks'
import {
  selectCurrentRToken,
  selectTopTokens,
  setCurrent,
} from 'state/reserve-tokens/reducer'
import { ReserveToken } from 'types'

const RTokenSelector = (props: BoxProps) => {
  const [isVisible, setVisible] = useState(false)
  const tokens = useAppSelector(selectTopTokens)
  const selected: ReserveToken | null = useAppSelector(selectCurrentRToken)
  const dispatch = useDispatch()

  if (!tokens.length) {
    return <span>Loading...</span>
  }

  const handleSelect = (token: string) => {
    dispatch(setCurrent(token))
    setVisible(false)
  }

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={
        <Box p={2} sx={{ minWidth: 150, cursor: 'pointer' }} my={2}>
          {(!tokens || !tokens.length) && <Text>Loading...</Text>}
          {tokens.map((token) => (
            <Flex
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
