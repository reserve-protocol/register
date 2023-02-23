import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { useAtom } from 'jotai'
import { Box, BoxProps, Text } from 'theme-ui'
import { isNewBasketProposedAtom } from '../atoms'
import ProposedBackupPreview from './ProposedBackupPreview'
import ProposedParametersPreview from './ProposedParametersPreview'
import ProposedRevenueSplitPreview from './ProposedRevenueSplitPreview'
import ProposedRolesPreview from './ProposedRolesPreview'

const ProposalPreview = (props: BoxProps) => {
  const [isNewBasketProposed, setProposeNewBasket] = useAtom(
    isNewBasketProposedAtom
  )

  return (
    <Box {...props}>
      {isNewBasketProposed && (
        <Box variant="layout.borderBox" mt={4}>
          <Box variant="layout.verticalAlign">
            <Text variant="strong" sx={{ color: 'warning' }}>
              <Trans>New primary basket</Trans>
            </Text>
            <SmallButton
              ml="auto"
              variant="muted"
              onClick={() => setProposeNewBasket(false)}
            >
              <Trans>Revert</Trans>
            </SmallButton>
          </Box>
        </Box>
      )}
      <ProposedBackupPreview mt={4} />
      <ProposedRevenueSplitPreview mt={4} />
      <ProposedParametersPreview mt={4} />
      <ProposedRolesPreview mt={4} />
    </Box>
  )
}

export default ProposalPreview
