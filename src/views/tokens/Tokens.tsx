import { t } from '@lingui/macro'
import { Container } from 'components'
import { ContentHead } from '@/components/old/info-box'
import ListedTokensTable from 'components/tables/ListedTokensTable'
import { Divider } from 'theme-ui'
import DeployHero from 'views/compare/components/DeployHero'
import RegisterAbout from 'views/compare/components/RegisterAbout'
import UnlistedTokensTable from './components/UnlistedTokensTable'

const Tokens = () => {
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
