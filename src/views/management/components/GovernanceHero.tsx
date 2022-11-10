import { Trans } from '@lingui/macro'
import { AlertCircle } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { Box, BoxProps, Button, Flex, Text } from 'theme-ui'
import { ROUTES } from 'utils/constants'

const GovernanceHero = (props: BoxProps) => {
  const navigate = useNavigate()

  return (
    <Box {...props}>
      <AlertCircle size={28} />
      <Text variant="title" sx={{ fontSize: 4 }} mt={2} mb={2}>
        <Trans>RToken Deployed! Next: Configure Governance</Trans>
      </Text>
      <Text as="p" variant="legend" sx={{ maxWidth: 500 }}>
        <Trans>
          Your Rtoken has been deployed and the "owner" role is set to your
          wallet. Next, let's configure a robust governance module for your
          currency. We recommend the default Reserve Governor Alexios but it is
          a flexible platform.
        </Trans>
      </Text>
      <Flex mt={4}>
        <Button px={4} variant="muted" mr={3}>
          <Trans>Learn more</Trans>
        </Button>
        <Button px={4} onClick={() => navigate(ROUTES.GOVERNANCE_SETUP)}>
          <Trans>Configure Governance</Trans>
        </Button>
      </Flex>
    </Box>
  )
}

export default GovernanceHero
