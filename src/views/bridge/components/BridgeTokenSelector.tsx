import { useAtom } from 'jotai'
import { Box, BoxProps, Select } from 'theme-ui'
import { BRIDGEABLE_TOKENS, bridgeTokenAtom } from '../atoms'

const BridgeTokenSelector = (props: BoxProps) => {
  const [selected, setToken] = useAtom(bridgeTokenAtom)

  const handleChange = (e: any) => {
    setToken(e.target.value)
  }

  return (
    <Box {...props}>
      <Select value={selected} onChange={handleChange}>
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
