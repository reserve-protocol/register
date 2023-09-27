import { Trans } from '@lingui/macro'
import { Button, Card } from 'components'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { chainIdAtom } from 'state/atoms'
import { Box, Divider, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { useSwitchNetwork } from 'wagmi'
import { isBridgeWrappingAtom } from '../atoms'

const Header = () => {
  const [isWrapping, setWrapping] = useAtom(isBridgeWrappingAtom)

  return (
    <>
      <Box variant="layout.verticalAlign">
        <Text as="h2" sx={{ fontSize: 3, fontWeight: 500 }}>
          <Trans>Bridge tokens</Trans>
        </Text>
        <Button
          variant="bordered"
          small
          sx={{ borderColor: isWrapping ? 'primary' : 'muted' }}
          ml="auto"
          onClick={() => setWrapping(true)}
        >
          <Trans>Deposit</Trans>
        </Button>
        <Button
          variant="bordered"
          ml="3"
          small
          sx={{ borderColor: !isWrapping ? 'primary' : 'muted' }}
          onClick={() => setWrapping(false)}
        >
          <Trans>Withdraw</Trans>
        </Button>
      </Box>
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
    </>
  )
}

const BridgePreview = () => {
  return <Box variant="layout.verticalAlign"></Box>
}

const Bridge = () => {
  const [isWrapping, setWrapping] = useState(false)
  const { switchNetwork } = useSwitchNetwork()
  const chainId = useAtomValue(chainIdAtom)

  // Trigger wallet switch for users
  useEffect(() => {
    if (isWrapping && chainId !== ChainId.Mainnet && switchNetwork) {
      switchNetwork(ChainId.Mainnet)
    }
  }, [isWrapping])

  return (
    <Card p={4} sx={{ backgroundColor: 'contentBackground', maxWidth: 450 }}>
      <Header />
    </Card>
  )
}

export default Bridge
