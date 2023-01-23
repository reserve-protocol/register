import { Trans } from '@lingui/macro'
import GovernanceActionIcon from 'components/icons/GovernanceActionIcon'
import useRToken from 'hooks/useRToken'
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
  const rToken = useRToken()

  return (
    <Box variant="layout.sticky">
      <Box variant="layout.borderBox" mb={4}>
        <Flex
          sx={{
            alignItems: 'center',
            flexDirection: 'column',
            textAlign: 'center',
          }}
        >
          <GovernanceActionIcon />
          <Text variant="title" sx={{ fontSize: 4 }} mt={2}>
            <Trans>Governance setup required</Trans>
          </Text>
          <Text variant="legend" as="p" mt={2} sx={{ textAlign: 'center' }}>
            <Trans>
              Please complete the required governance configuration to start
              using your RToken
            </Trans>
          </Text>
          <Button
            onClick={() =>
              navigate(ROUTES.GOVERNANCE_SETUP + `?token=${rToken?.address}`)
            }
            mt={4}
            sx={{ width: '100%' }}
          >
            <Trans>Setup Governance</Trans>
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}

export default GovernancePrompt
