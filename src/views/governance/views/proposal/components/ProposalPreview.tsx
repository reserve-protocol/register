import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { useAtom } from 'jotai'
import { Box, BoxProps, Divider, Text } from 'theme-ui'
import { isNewBasketProposedAtom } from '../atoms'
import ProposedParametersPreview from './ProposedParametersPreview'

const ProposalPreview = (props: BoxProps) => {
  const [isNewBasketProposed, setProposeNewBasket] = useAtom(
    isNewBasketProposedAtom
  )

  return (
    <Box {...props} px={4}>
      {isNewBasketProposed && (
        <>
          <Divider mt={0} mx={-4} mb={4} />
          <Box mt={3} variant="layout.verticalAlign" mb={4}>
            <Text variant="strong" sx={{ color: 'warning' }}>
              New primary basket
            </Text>
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
