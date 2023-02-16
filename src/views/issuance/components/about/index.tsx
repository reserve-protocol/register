import { Trans } from '@lingui/macro'
import { Modal } from 'components'
import Button, { SmallButton } from 'components/button'
import { useState } from 'react'
import { Box, Divider, Input, Text } from 'theme-ui'
import { STAKE_AAVE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import collateralPlugins from 'utils/plugins'

const aavePlugins = collateralPlugins.filter(
  (p) => p.rewardToken === STAKE_AAVE_ADDRESS[CHAIN_ID]
)

const WrappingModal = ({ onClose }: { onClose(): void }) => {
  return (
    <Modal style={{ maxWidth: '390px' }}>
      <Text variant="title">
        <Trans>Wrap your Aave collaterals</Trans>
      </Text>
      <Divider mt={4} />
      {aavePlugins.map((plugin) => (
        <Box mt={3}>
          <Text ml={3} variant="legend">
            {plugin.symbol}
          </Text>
          <Input mt={2} placeholder="Token amount" />
        </Box>
      ))}
      <Divider my={4} />
      <Button sx={{ width: '100%' }}>Wrap tokens</Button>
    </Modal>
  )
}

const About = () => {
  const [isWrapping, setWrapping] = useState(false)

  return (
    <Box sx={{ height: 'fit-content' }}>
      <Box variant="layout.borderBox" p={4}>
        <Text variant="strong" mb={2}>
          <Trans>How does this work? </Trans>
        </Text>
        <Text as="p" variant="legend">
          <Trans>
            Minting requires a deposit of the defined collateral tokens in equal
            value amounts to the RToken smart contracts.
          </Trans>
        </Text>
      </Box>
      <Box variant="layout.borderBox" mt={4} p={4}>
        <Text variant="strong" mb={2}>
          <Trans>Wrapping your Aave tokens</Trans>
        </Text>
        <Text as="p" variant="legend">
          <Trans>... explanation about why and the progress...</Trans>
        </Text>
        <SmallButton mt={3} onClick={() => setWrapping(true)}>
          <Trans>Wrap tokens</Trans>
        </SmallButton>
      </Box>
      {isWrapping && <WrappingModal onClose={() => setWrapping(false)} />}
    </Box>
  )
}

export default About
