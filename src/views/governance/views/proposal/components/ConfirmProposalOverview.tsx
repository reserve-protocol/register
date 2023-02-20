import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { SmallButton } from 'components/button'
import useTransactionCost from 'hooks/useTransactionCost'
import { useSetAtom } from 'jotai'
import { Box, BoxProps, Container, Flex, Text } from 'theme-ui'
import { TransactionState } from 'types'
import { isProposalEditingAtom } from '../atoms'

interface Props extends BoxProps {
  tx: TransactionState
}

// TODO: Display gas estimate
const ConfirmProposalOverview = ({ tx, ...props }: Props) => {
  const setProposalEditing = useSetAtom(isProposalEditingAtom)
  const [fee, gasError, gasLimit] = useTransactionCost([tx])

  console.log('fee', fee)

  // Change to confirmation screen
  const handleProposal = () => {
    setProposalEditing(true)
  }

  return (
    <Container sx={{ position: 'sticky', top: 0 }} p={0} {...props}>
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
          <SmallButton
            onClick={handleProposal}
            variant="muted"
            mb={3}
            mr="auto"
          >
            <Trans>Edit</Trans>
          </SmallButton>
          <Text variant="title" mb={2}>
            <Trans>Confirm Proposal</Trans>
          </Text>
          <Text variant="legend" as="p">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
            maxisss nunc iaculis vitae.
          </Text>
          <Button
            onClick={handleProposal}
            variant="primary"
            mt={4}
            sx={{ width: '100%' }}
          >
            <Trans>Execute proposal</Trans>
          </Button>
        </Flex>
      </Box>
    </Container>
  )
}

export default ConfirmProposalOverview
