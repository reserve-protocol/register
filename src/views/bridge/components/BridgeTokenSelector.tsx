import { useAtom } from 'jotai'
import { Box, BoxProps, Text, Select } from 'theme-ui'
import { bridgeTokenAtom } from '../atoms'
import { BRIDGEABLE_TOKENS } from '../utils/constants'

const BridgeTokenSelector = (props: BoxProps) => {
  const [selected, setToken] = useAtom(bridgeTokenAtom)

  const handleChange = (e: any) => {
    setToken(e.target.value)
  }

  return (
    <Box {...props}>
      <Text as="label" variant="legend" ml={3}>
        Token
      </Text>
      <Select mt={2} value={selected} onChange={handleChange}>
        {BRIDGEABLE_TOKENS.map((token, index) => (
          <option key={token.symbol} value={index.toString()}>
            {token.symbol}
          </option>
        ))}
      </Select>
    </Box>
  )
}

export default BridgeTokenSelector
