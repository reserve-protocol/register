import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { SmallButton } from 'components/button'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { Box, BoxProps, Container, Flex, Spinner, Text } from 'theme-ui'
import { TransactionState } from 'types'
import { formatCurrency, shortenString } from 'utils'
import { ROUTES, TRANSACTION_STATUS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { isProposalEditingAtom, proposalTxIdAtom } from '../atoms'
import useProposal from '../hooks/useProposal'

interface Props extends BoxProps {
  tx: TransactionState
}

const ProposalStatus = ({
  transactionState,
}: {
  transactionState: TransactionState
}) => {
  const txId = useAtomValue(proposalTxIdAtom)
  const navigate = useNavigate()
  const { fee, propose, isValid } = useProposal(transactionState)
  const tx = useTransaction(txId)

  useEffect(() => {
    if (tx?.status === TRANSACTION_STATUS.CONFIRMED) {
      navigate(ROUTES.GOVERNANCE)
    }
  }, [tx?.status])

  if (
    tx?.status === TRANSACTION_STATUS.PENDING ||
    tx?.status === TRANSACTION_STATUS.SIGNING
  ) {
    return (
      <>
        <Spinner mt={3} size={24} mb={2} />
        <Text sx={{ fontWeight: 500, display: 'block' }}>
          <Trans>Pending, sign in wallet</Trans>
        </Text>
        <Text as="p" variant="legend">
          <Trans>
            Please sign the transaction in your wallet to continue with the
            governance process.
          </Trans>
        </Text>
      </>
    )
  }

  if (
    tx?.status === TRANSACTION_STATUS.MINING ||
    tx?.status === TRANSACTION_STATUS.CONFIRMED
  ) {
    return (
      <>
        <Spinner size={24} mt={3} mb={2} />
        <Text sx={{ fontWeight: 500, fontSize: 3, display: 'block' }} mb={2}>
          <Trans>Deploy transaction submitted</Trans>
        </Text>
        <Text as="p" variant="legend">
          <Trans>
            Stay patient while the transaction is in progress & don’t close this
            window to avoid issues finding your way back here.
          </Trans>
        </Text>
        <Box
          variant="layout.verticalAlign"
          sx={{ justifyContent: 'center' }}
          mt={4}
        >
          <Text variant="legend">{shortenString(tx?.hash ?? '')}</Text>
          <CopyValue ml={3} mr={2} value={tx?.hash ?? ''} />
          <GoTo
            href={getExplorerLink(tx?.hash ?? '', ExplorerDataType.TRANSACTION)}
          />
        </Box>
      </>
    )
  }

  return (
    <>
      <Text variant="legend" as="p" sx={{ textAlign: 'center' }}>
        You can come back to this page later through the settings nav item if
        you need time.
      </Text>
      <Button
        onClick={propose}
        variant="primary"
        disabled={!isValid || !fee}
        mt={4}
        sx={{ width: '100%' }}
      >
        <Trans>Submit proposal</Trans>
      </Button>
      <Box mt={3} sx={{ fontSize: 1, textAlign: 'center' }}>
        <Text variant="legend" mr={1}>
          <Trans>Estimated gas cost:</Trans>
          {!isValid && ' --'}
        </Text>
        {isValid && !fee && <Spinner color="black" size={12} />}
        {isValid && !!fee && (
          <Text sx={{ fontWeight: 500 }}>${formatCurrency(fee)}</Text>
        )}
      </Box>
    </>
  )
}

const ConfirmProposalOverview = ({ tx, ...props }: Props) => {
  const setProposalEditing = useSetAtom(isProposalEditingAtom)

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
            onClick={() => setProposalEditing(true)}
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
          <ProposalStatus transactionState={tx} />
        </Flex>
      </Box>
    </Container>
  )
}

export default ConfirmProposalOverview
