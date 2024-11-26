import { useAtomValue } from 'jotai'
import { Box, Text } from 'theme-ui'

import CollateralItem from './CollateralItem'
import { collateralsByProtocolAtom, isWrappingAtom } from './atoms'

const WrapCollateralList = () => {
  const wrapping = useAtomValue(isWrappingAtom)
  const collateralsByProtocol = useAtomValue(collateralsByProtocolAtom)

  return (
    <Box sx={{ flexGrow: 1, overflow: 'auto' }} px={4}>
      {Object.keys(collateralsByProtocol).map((protocol) => (
        <Box mb={4} key={protocol}>
          <Text variant="strong">{protocol}</Text>

          {collateralsByProtocol[protocol].map((c) => (
            <CollateralItem
              key={`${wrapping ? 'wrap' : 'unwrap'}-${c.address}`}
              mt={3}
              collateral={c}
              wrapping={wrapping}
            />
          ))}
        </Box>
      ))}
    </Box>
  )
}

export default WrapCollateralList
