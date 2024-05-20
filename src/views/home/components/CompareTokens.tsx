import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { Suspense, lazy } from 'react'
import { ArrowRight } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { Box, Flex } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import CompareSkeleton from './CompareSkeleton'
import CompareTokensTitle from './CompareTokensTitle'
import DeployHero from './DeployHero'

const RTokenList = lazy(() => import('./RTokenList'))

const CompareTokens = () => {
  const navigate = useNavigate()

  const handleViewAll = () => {
    navigate(ROUTES.TOKENS)
  }

  const handleExplore = () => {
    navigate(ROUTES.EXPLORER)
  }

  return (
    <Box variant="layout.wrapper" px={[2, 4]} pt={[0]}>
      <CompareTokensTitle />
      <Suspense fallback={<CompareSkeleton />}>
        <RTokenList />
      </Suspense>
      <Flex my={7} sx={{ justifyContent: 'center', gap: 3 }}>
        <Button medium variant="transparent" onClick={handleViewAll}>
          <Box variant="layout.verticalAlign">
            <Trans>View All, including unlisted</Trans>
            <ArrowRight style={{ marginLeft: 16 }} size={18} />
          </Box>
        </Button>
        <Button medium variant="transparent" onClick={handleExplore}>
          <Box variant="layout.verticalAlign">
            <Trans>Explore</Trans>
            <ArrowRight style={{ marginLeft: 16 }} size={18} />
          </Box>
        </Button>
      </Flex>
      <DeployHero />
    </Box>
  )
}

export default CompareTokens
