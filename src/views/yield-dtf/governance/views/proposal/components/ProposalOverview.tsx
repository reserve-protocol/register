import { Trans } from '@lingui/macro'
import { useAtomValue, useSetAtom } from 'jotai'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { Button } from '@/components/ui/button'
import { isProposalEditingAtom, isProposalValidAtom } from '../atoms'
import CreateProposalActionIcon from 'components/icons/CreateProposalActionIcon'
import ProposalPreview from './ProposalPreview'

const ProposalOverview = (props: BoxProps) => {
  const isValid = useAtomValue(isProposalValidAtom)
  const setProposalEditing = useSetAtom(isProposalEditingAtom)

  // Change to confirmation screen
  const handleProposal = () => {
    setProposalEditing(false)
  }

  return (
    <Box
      sx={{ height: 'fit-content' }}
      variant="layout.sticky"
      p={0}
      {...props}
    >
      <Box
        sx={{
          maxHeight: 'calc(100vh - 124px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Flex
          sx={{
            alignItems: 'center',
            flexDirection: 'column',
            textAlign: 'center',
          }}
          variant="layout.borderBox"
        >
          <CreateProposalActionIcon />
          <Text variant="title" mb={2}>
            <Trans>Confirm changes made</Trans>
          </Text>
          <Text variant="legend" as="p">
            Preview of function calls & adding of a proposal description is
            added in the next step.
          </Text>
          <Button
            onClick={handleProposal}
            disabled={!isValid}
            className="mt-6 w-full"
          >
            <Trans>Confirm & prepare proposal</Trans>
          </Button>
        </Flex>
        <ProposalPreview sx={{ flexGrow: 1, overflow: 'auto' }} />
      </Box>
    </Box>
  )
}

export default ProposalOverview
