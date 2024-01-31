import { Button } from 'components'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import Base from 'components/icons/logos/Base'
import { useAtomValue } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { chainIdAtom } from 'state/atoms'
import { Box, BoxProps, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { ROUTES } from 'utils/constants'

const BridgeInfo = (props: BoxProps) => {
  const navigate = useNavigate()
  const chainId = useAtomValue(chainIdAtom)

  if (chainId !== ChainId.Base) {
    return null
  }

  return (
    <Box
      mb={[3, 4]}
      p={4}
      variant="layout.verticalAlign"
      sx={{ border: '1px dashed', borderColor: 'base', borderRadius: '14px' }}
      {...props}
    >
      <Base />
      <Box ml={3}>
        <Text variant="strong" sx={{ fontWeight: 500 }}>
          Base RSR Bridge
        </Text>
        <Text variant="legend">Deposit RSR to the Base network</Text>
      </Box>
      <Button
        ml="auto"
        small
        sx={{
          alignItems: 'center',
          display: 'flex',
          backgroundColor: 'base',
          color: 'white',
        }}
        onClick={() => navigate(ROUTES.BRIDGE)}
      >
        <Text mr={2}>Bridge</Text>
        <ExternalArrowIcon />
      </Button>
    </Box>
  )
}

export default BridgeInfo
