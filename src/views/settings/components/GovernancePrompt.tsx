import { Trans } from '@lingui/macro'
import useRToken from 'hooks/useRToken'
import { AlertCircle } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Flex, Text } from 'theme-ui'
import { ROUTES } from 'utils/constants'

/**
 * Display "Configure governance" prompt to owners on settings
 *
 * ? Only required to finish RToken setup
 */
const GovernancePrompt = () => {
  const navigate = useNavigate()

  return (
    <Box variant="layout.sticky">
      <Box variant="layout.borderBox" mb={4}>
        <Flex
          pt={2}
          sx={{
            alignItems: 'center',
            flexDirection: 'column',
            textAlign: 'center',
          }}
        >
          <Flex
            sx={{
              color: 'warning',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <AlertCircle />
            <Text variant="legend" mt={2} sx={{ color: 'warning' }}>
              <Trans>Required setup:</Trans>
            </Text>
          </Flex>
          <Text variant="title" mt={1}>
            <Trans>Setup Governance</Trans>
          </Text>
          <Text variant="legend" as="p" mt={2} sx={{ textAlign: 'center' }}>
            <Trans>
              Please complete the required governance configuration to complete
              deployment.
            </Trans>
          </Text>
          <Button
            onClick={() => navigate(`../${ROUTES.GOVERNANCE_SETUP}`)}
            mt={4}
            sx={{ width: '100%' }}
          >
            <Trans>Begin governance setup</Trans>
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}

export default GovernancePrompt
