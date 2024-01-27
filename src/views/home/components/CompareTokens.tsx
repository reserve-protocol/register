import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { ArrowRight } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { Box, Flex } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import CompareTokensTitle from './CompareTokensTitle'
import DeployHero from './DeployHero'
import React, { Suspense, lazy } from 'react'
import CompareSkeleton from './CompareSkeleton'

const RTokenList = lazy(() => import('./RTokenList'))

const CompareTokens = () => {
  const navigate = useNavigate()

  const handleViewAll = () => {
    navigate(ROUTES.TOKENS)
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  return (
    <Box variant="layout.wrapper" p={[1, 4]} pt={0}>
      <CompareTokensTitle />
      <Suspense fallback={<CompareSkeleton />}>
        <RTokenList />
      </Suspense>
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
