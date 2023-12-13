import { Trans } from '@lingui/macro'
import { Button } from 'components'
import useTokenList from 'hooks/useTokenList'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router-dom'
import { Box, Flex, Text } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import RTokenCard from './RTokenCard'
import { ArrowRight } from 'react-feather'
import DeployHero from './DeployHero'

const CompareTokens = () => {
  const navigate = useNavigate()
  const { list, isLoading } = useTokenList()

  const handleViewAll = () => {
    navigate(ROUTES.TOKENS)
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  return (
    <Box variant="layout.wrapper" p={[1, 4]} pt={0}>
      <Box
        sx={{
          textAlign: 'center',
        }}
        mb={6}
        mt={3}
      >
        <Text variant="sectionTitle" mb={2}>
          <Trans>Browse RToken Currencies</Trans>
        </Text>
        <Text variant="legend">
          <Trans>
            Inspect collateral backing, mint, stake & explore deeper
          </Trans>
        </Text>
      </Box>
      {isLoading && (
        <Skeleton count={3} height={320} style={{ marginBottom: 20 }} />
      )}
      {list.map((token) => (
        <RTokenCard key={token.id} token={token} mb={4} />
      ))}
      <Flex my={7} sx={{ justifyContent: 'center' }}>
        <Button medium variant="transparent" onClick={handleViewAll}>
          <Box variant="layout.verticalAlign">
            <Trans>View All, including unlisted</Trans>
            <ArrowRight style={{ marginLeft: 16 }} size={18} />
          </Box>
        </Button>
      </Flex>
      <DeployHero />
    </Box>
  )
}

export default CompareTokens