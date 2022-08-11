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
        <Trans>Step 2 Required: Governance</Trans>
      </Text>
      <Text as="p" variant="legend" sx={{ maxWidth: 500 }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus
        facilisis velit, at venenatis nunc iaculis vitae. Vestibulum ante ipsum
        primis in faucibus orci luctus et posuere cubilia curae
      </Text>
      <Flex mt={4}>
        <Button px={4} variant="muted" mr={3}>
          <Trans>Learn more</Trans>
        </Button>
        <Button px={4} onClick={() => navigate(ROUTES.GOVERNANCE)}>
          <Trans>Configure Governance</Trans>
        </Button>
      </Flex>
    </Box>
  )
}

export default GovernanceHero
