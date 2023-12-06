import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { useNavigate } from 'react-router-dom'
import { Box, Flex } from 'theme-ui'
import { ROUTES } from 'utils/constants'

const CompareTokens = () => {
  const navigate = useNavigate()

  const handleViewAll = () => {
    navigate(ROUTES.TOKENS)
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  return (
    <Box>
      <Flex mt={4} sx={{ justifyContent: 'center' }}>
        <Button small variant="transparent" onClick={handleViewAll}>
          <Trans>View All</Trans>
        </Button>
      </Flex>
    </Box>
  )
}

export default CompareTokens
