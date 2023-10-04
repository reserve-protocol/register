import { Trans, t } from '@lingui/macro'
import { LoadingButton, SmallButton } from 'components/button'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import TransactionButton from 'components/button/TransactionButton'
import ConfirmProposalActionIcon from 'components/icons/ConfirmProposalActionIcon'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chainIdAtom } from 'state/atoms'
import { Box, BoxProps, Container, Flex, Spinner, Text } from 'theme-ui'
import { shortenString } from 'utils'
import { ROUTES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { UsePrepareContractWriteConfig } from 'wagmi'
import { isProposalEditingAtom } from '../atoms'
import useRToken from 'hooks/useRToken'
import IssuanceIcon from 'components/icons/IssuanceIcon'

interface Props extends BoxProps {
  tx: UsePrepareContractWriteConfig
}

const ProposalStatus = () => {
  const navigate = useNavigate()
  const [isLoading, setLoading] = useState<boolean>(false)
  const chainId = useAtomValue(chainIdAtom)
  const rToken = useRToken()

  useEffect(() => {
    if (status === 'success') {
      navigate(
        `${ROUTES.GOVERNANCE}?token=${rToken?.address}&chainId=${chainId}`
      )
    }
  }, [status])

  if (isLoading) {
    return (
      <>
        <Spinner mt={3} size={24} mb={2} />
        <Text as="p" variant="legend">
          <Trans>Please wait while the simulation executes</Trans>
        </Text>
      </>
    )
  }

  return (
    <LoadingButton
      text={t`Simulate proposal`}
      mt={4}
      fullWidth
      disabled={!isLoading}
      //   onClick={write}
    />
  )
}

const SimulateProposal = ({ tx, ...props }: Props) => {
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
          <IssuanceIcon />
          <Text variant="title" mb={2}>
            <Trans>Simulate Proposal</Trans>
          </Text>
          <Text variant="legend" as="p">
            Simulate your proposal on a forked environment to see the outcome of
            its execution
          </Text>
          <ProposalStatus />
        </Flex>
      </Box>
    </Container>
  )
}

export default SimulateProposal
