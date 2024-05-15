import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { ContentHead } from 'components/info-box'
import ListedTokensTable from 'components/tables/ListedTokensTable'
import { useNavigate } from 'react-router-dom'
import { Box, BoxProps, Flex } from 'theme-ui'
import { ROUTES } from 'utils/constants'

const TokenList = (props: BoxProps) => {
  const navigate = useNavigate()

  const handleViewAll = () => {
    navigate(ROUTES.TOKENS)
  }

  return (
    <Box {...props}>
      <ContentHead
        pl={[3, 4]}
        mb={5}
        title={t`Compare RTokens`}
        subtitle={t`Including off-chain in-app transactions of RToken in the Reserve App.`}
      />
      <ListedTokensTable />
      <Flex mt={4} sx={{ justifyContent: 'center' }}>
        <SmallButton variant="transparent" onClick={handleViewAll}>
          <Trans>View All</Trans>
        </SmallButton>
      </Flex>
    </Box>
  )
}

export default TokenList
