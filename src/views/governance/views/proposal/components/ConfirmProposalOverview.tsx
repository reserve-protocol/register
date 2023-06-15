import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { SmallButton } from 'components/button'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import ConfirmProposalActionIcon from 'components/icons/ConfirmProposalActionIcon'
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
          <Trans>Transaction submitted</Trans>
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
      <Button
        onClick={propose}
        variant="primary"
        disabled={!isValid || !fee}
        mt={4}
        sx={{ width: '100%' }}
      >
        <Trans>Submit proposal on-chain</Trans>
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
    <Container variant="layout.sticky" p={0} {...props}>
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
            mr="auto"
          >
            <Trans>Edit</Trans>
          </SmallButton>
          <ConfirmProposalActionIcon />
          <Text variant="title" mb={2}>
            <Trans>Confirm & Submit</Trans>
          </Text>
          <Text variant="legend" as="p">
            Submit the proposal to be voted on by [stRSR] holders. Note this is
            an on-chain action and will require gas to propose.
          </Text>
          <ProposalStatus transactionState={tx} />
        </Flex>
      </Box>
    </Container>
  )
}

export default ConfirmProposalOverview
