import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { useAtom } from 'jotai'
import { Box, Divider, Text } from 'theme-ui'
import { isNewBasketProposedAtom } from '../atoms'
import ProposedParametersPreview from './ProposedParametersPreview'

const ProposalPreview = () => {
  const [isNewBasketProposed, setProposeNewBasket] = useAtom(
    isNewBasketProposedAtom
  )

  return (
    <Box>
      {isNewBasketProposed && (
        <>
          <Divider mx={-4} my={4} />
          <Box mt={3} variant="layout.verticalAlign">
            <Text variant="strong">New primary basket </Text>
            <SmallButton
              ml="auto"
              variant="muted"
              onClick={() => setProposeNewBasket(false)}
            >
              <Trans>Revert</Trans>
            </SmallButton>
          </Box>
        </>
      )}
      <ProposedParametersPreview />
    </Box>
  )
}

export default ProposalPreview
