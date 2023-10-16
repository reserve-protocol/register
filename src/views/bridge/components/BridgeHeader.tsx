import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { chainIdAtom } from 'state/atoms'
import { Box, Divider, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { useSwitchNetwork } from 'wagmi'
import { isBridgeWrappingAtom } from '../atoms'

const BridgeHeader = () => {
  const [isWrapping, setWrapping] = useAtom(isBridgeWrappingAtom)
  const { switchNetwork } = useSwitchNetwork()
  const chainId = useAtomValue(chainIdAtom)

  // Trigger wallet switch for users
  useEffect(() => {
    if (switchNetwork) {
      if (isWrapping && chainId !== ChainId.Mainnet) {
        switchNetwork(ChainId.Mainnet)
      }

      if (!isWrapping && chainId === ChainId.Mainnet) {
        switchNetwork(ChainId.Base)
      }
    }
  }, [isWrapping, switchNetwork])

  return (
    <>
      <Box variant="layout.verticalAlign">
        <Text as="h2" sx={{ fontSize: 3, fontWeight: 500 }}>
          <Trans>Bridge tokens</Trans>
        </Text>
        <Button
          variant="bordered"
          small
          sx={{ borderColor: isWrapping ? 'primary' : 'darkBorder' }}
          ml="auto"
          onClick={() => setWrapping(true)}
        >
          <Trans>Deposit</Trans>
        </Button>
        <Button
          variant="bordered"
          ml="3"
          small
          sx={{ borderColor: !isWrapping ? 'primary' : 'darkBorder' }}
          onClick={() => setWrapping(false)}
        >
          <Trans>Withdraw</Trans>
        </Button>
      </Box>
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
    </>
  )
}

export default BridgeHeader
