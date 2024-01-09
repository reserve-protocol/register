import { t } from '@lingui/macro'
import { Container } from 'components'
import { ContentHead } from 'components/info-box'
import ListedTokensTable from 'components/tables/ListedTokensTable'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { selectedRTokenAtom } from 'state/atoms'
import { Divider } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import DeployHero from 'views/home/components/DeployHero'
import RegisterAbout from 'views/home/components/RegisterAbout'
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
    <>
      <Container>
        <ContentHead
          title={t`Register listed RTokens`}
          subtitle={t`RTokens in this list is not an endorsement or audited by us. It’s simply RTokens that have gone through our listing process and don’t seem like clear scams.`}
          mb={4}
          ml={4}
        />
        <ListedTokensTable />
        <Divider my={7} />
        <ContentHead
          title={t`All unlisted RTokens`}
          subtitle={t`Be aware that anyone can create an RToken that ends up on this list. We don't apply any standards beyond what can be done with the Reserve Protocol.`}
          mb={4}
          mt={4}
          ml={4}
        />
        <UnlistedTokensTable />
        <DeployHero mt={8} />
      </Container>
      <RegisterAbout />
    </>
  )
}

export default Tokens
