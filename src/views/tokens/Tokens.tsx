import { t, Trans } from '@lingui/macro'
import { Container } from 'components'
import { SmallButton } from 'components/button'
import { ContentHead } from 'components/info-box'
import ListedTokensTable from 'components/tables/ListedTokensTable'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { selectedRTokenAtom } from 'state/atoms'
import { Flex } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import UnlistedTokensTable from './components/UnlistedTokensTable'

const Tokens = () => {
  const navigate = useNavigate()
  const updateToken = useUpdateAtom(selectedRTokenAtom)

  const handleDeploy = () => {
    navigate(ROUTES.DEPLOY)
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  useEffect(() => {
    updateToken('')
  }, [])

  return (
    <Container>
      <ContentHead
        title={t`Register listed RTokens`}
        subtitle={t`RTokens in this list is not an endorsement or audited by us. It’s simply RTokens that have gone through our listing process and don’t seem like clear scams.`}
        mb={5}
        ml={3}
      />
      <ListedTokensTable />
      <ContentHead
        title={t`All unlisted RTokens`}
        subtitle={t`Be aware that anyone can create an RToken that ends up on this list. We don't apply any standards beyond what can be done with the Reserve Protocol.`}
        my={5}
        ml={3}
      />
      <UnlistedTokensTable />
      <Flex mt={3} sx={{ justifyContent: 'center' }}>
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
