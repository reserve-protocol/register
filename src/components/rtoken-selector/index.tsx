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
            src={`/imgs/${tokenLogos[token.token.symbol] || 'default.png'}`}
            height={38}
            width={38}
            alt={token.token.name}
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
