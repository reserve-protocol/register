import { BoxProps, Box, Flex, Text } from '@theme-ui/components'
import { tokenLogos } from 'constants/tokens'
import { useDispatch, useSelector } from 'react-redux'
import { selectTopTokens, setCurrent } from 'state/reserve-tokens/reducer'

const RTokenSelector = (props: BoxProps) => {
  const tokens = useSelector(selectTopTokens)
  const dispatch = useDispatch()

  if (!tokens.length) {
    return <span>Loading...</span>
  }

  const handleSelect = (token: string) => {
    console.log('select')
    dispatch(setCurrent(token))
  }

  return (
    <Flex {...props} sx={{ alignItems: 'center' }}>
      {tokens.map((token) => (
        <Box
          onClick={() => handleSelect(token.id)}
          sx={{ cursor: 'pointer' }}
          mr={3}
          key={token.id}
        >
          <img
            src={`/imgs/${token.token.symbol.toLowerCase()}.png`}
            style={{
              width: 'auto',
              height: 'auto',
              maxHeight: 38,
              maxWidth: 38,
              objectFit: 'scale-down',
            }}
            alt={token.token.symbol}
          />
        </Box>
      ))}
      <Text
        sx={{
          textDecoration: 'underline',
          cursor: 'pointer',
          position: 'relative',
          top: '-3px',
        }}
      >
        See all RTokens...
      </Text>
    </Flex>
  )
}

export default RTokenSelector
