import { t, Trans } from '@lingui/macro'
import { Container } from 'components'
import { SmallButton } from 'components/button'
import { ContentHead } from 'components/info-box'
import ListedTokensTable from 'components/tables/ListedTokensTable'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { selectedRTokenAtom } from 'state/atoms'
import { Flex, Divider } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import UnlistedTokensTable from './components/UnlistedTokensTable'

const Tokens = () => {
  const navigate = useNavigate()
  const updateToken = useSetAtom(selectedRTokenAtom)

  const handleDeploy = () => {
    navigate(ROUTES.DEPLOY)
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  useEffect(() => {
    updateToken(null)
  }, [])

  return (
    <Container>
      <ContentHead
        title={t`Register listed RTokens`}
        subtitle={t`RTokens in this list is not an endorsement or audited by us. It’s simply RTokens that have gone through our listing process and don’t seem like clear scams.`}
        mb={4}
        ml={4}
        mt={5}
      />
      <ListedTokensTable />
      <Divider my={8} mx={-5} />
      <ContentHead
        title={t`All unlisted RTokens`}
        subtitle={t`Be aware that anyone can create an RToken that ends up on this list. We don't apply any standards beyond what can be done with the Reserve Protocol.`}
        mb={4}
        mt={4}
        ml={4}
      />
      <UnlistedTokensTable />
      <Flex mt={6} mb={8} sx={{ justifyContent: 'center' }}>
        <SmallButton
          mr={3}
          variant="muted"
          onClick={() =>
            window.open('https://github.com/lc-labs/rtokens', '_blank')
          }
        >
          <Trans>Apply for listing</Trans>
        </SmallButton>
        <SmallButton onClick={handleDeploy}>
          <Trans>Deploy RToken</Trans>
        </SmallButton>
      </Flex>
    </Container>
  )
}

export default Tokens
