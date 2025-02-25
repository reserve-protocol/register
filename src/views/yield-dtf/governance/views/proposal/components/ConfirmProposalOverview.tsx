import { Trans, t } from '@lingui/macro'
import { SmallButton } from '@/components/old/button'
import CopyValue from '@/components/old/button/CopyValue'
import GoTo from '@/components/old/button/GoTo'
import TransactionButton from '@/components/old/button/TransactionButton'
import ConfirmProposalActionIcon from 'components/icons/ConfirmProposalActionIcon'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chainIdAtom } from 'state/atoms'
import { Box, BoxProps, Flex, Spinner, Text } from 'theme-ui'
import { getTokenRoute, shortenString } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { isProposalEditingAtom } from '../atoms'
import useRToken from 'hooks/useRToken'
import { ROUTES } from 'utils/constants'
import { UseSimulateContractParameters } from 'wagmi'

interface Props extends BoxProps {
  tx: UseSimulateContractParameters
}

const ProposalStatus = ({
  transactionState,
}: {
  transactionState: UseSimulateContractParameters | undefined
}) => {
  const navigate = useNavigate()
  const { gas, write, isReady, isLoading, hash } =
    useContractWrite(transactionState)
  const { status } = useWatchTransaction({
    hash,
    label: 'Create proposal',
  })
  const token = useRToken()
  const chainId = useAtomValue(chainIdAtom)

  useEffect(() => {
    if (status === 'success') {
      navigate(
        token
          ? getTokenRoute(token.address, token.chainId, ROUTES.GOVERNANCE)
          : '../'
      )
    }
  }, [status])

  if (isLoading) {
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

  if (hash) {
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
          <Text variant="legend">{shortenString(hash)}</Text>
          <CopyValue ml={3} mr={2} value={hash} />
          <GoTo
            href={getExplorerLink(hash, chainId, ExplorerDataType.TRANSACTION)}
          />
        </Box>
      </>
    )
  }

  return (
    <TransactionButton
      text={t`Submit proposal on-chain`}
      mt={4}
      fullWidth
      disabled={!isReady}
      onClick={write}
      gas={gas}
    />
  )
}

const ConfirmProposalOverview = ({ tx, ...props }: Props) => {
  const setProposalEditing = useSetAtom(isProposalEditingAtom)

  return (
    <Box {...props}>
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
    </Box>
  )
}

export default ConfirmProposalOverview
