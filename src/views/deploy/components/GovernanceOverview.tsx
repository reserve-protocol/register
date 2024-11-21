import { Trans, t } from '@lingui/macro'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import TransactionButton from 'components/button/TransactionButton'
import GovernanceActionIcon from 'components/icons/GovernanceActionIcon'
import useRToken from 'hooks/useRToken'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chainIdAtom } from 'state/atoms'
import { Box, BoxProps, Divider, Flex, Spinner, Text } from 'theme-ui'
import { getTokenRoute, shortenString } from 'utils'
import { ROUTES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Hex } from 'viem'
import useGovernance from '../useGovernance'
import TransactionError from 'components/transaction-error/TransactionError'

const Pending = () => (
  <>
    <Spinner mt={3} size={24} mb={2} />
    <Text sx={{ fontWeight: 500, display: 'block' }}>
      <Trans>Pending, sign in wallet</Trans>
    </Text>
    <Text as="p" variant="legend">
      <Trans>
        Please sign the transaction in your wallet to continue with the
        government configuration process.
      </Trans>
    </Text>
  </>
)

const Mining = ({ hash }: { hash: Hex }) => (
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
        href={getExplorerLink(
          hash,
          useAtomValue(chainIdAtom),
          ExplorerDataType.TRANSACTION
        )}
      />
    </Box>
  </>
)

const GovernanceStatus = () => {
  const navigate = useNavigate()
  const rToken = useRToken()
  const chainId = useAtomValue(chainIdAtom)
  const { write, isReady, isLoading, gas, hash, validationError, error } =
    useGovernance()
  const { status } = useWatchTransaction({
    hash,
    label: 'Setup Governance',
  })

  useEffect(() => {
    if (status === 'success' && rToken?.address) {
      // TODO: Get addresses from logs and manually update governance and dont wait for theGraph to catch up
      navigate(getTokenRoute(rToken.address, chainId, ROUTES.SETTINGS))
    }
  }, [status])

  if (isLoading && !hash) {
    return <Pending />
  }

  if (hash) {
    return <Mining hash={hash} />
  }

  return (
    <>
      <Text variant="legend" as="p" sx={{ textAlign: 'center' }}>
        <Trans>
          RToken will be ready to use after this TX if you choose to unpause.
        </Trans>
      </Text>

      <TransactionButton
        text={t`Deploy Governance`}
        mt={4}
        fullWidth
        disabled={!isReady}
        onClick={write}
        gas={gas}
      />

      <TransactionError mt={3} error={validationError || error} />
    </>
  )
}

const GovernanceOverview = (props: BoxProps) => (
  <Box sx={{ height: 'fit-content' }} variant="layout.borderBox" {...props}>
    <Flex
      sx={{
        alignItems: 'center',
        flexDirection: 'column',
        textAlign: 'center',
      }}
      py={2}
    >
      <GovernanceActionIcon />
      <Text variant="title" mt={2} mb={1}>
        <Trans>Tx2. Governance</Trans>
      </Text>
      <GovernanceStatus />
    </Flex>
    <Divider my={4} mx={-4} />
    <Box>
      <Text variant="strong" mb={2}>
        <Trans>Not ready to set up governance?</Trans>
      </Text>
      <Text as="p" variant="legend">
        <Trans>
          You can leave your RToken paused and come back to setting up
          governance later.
        </Trans>
      </Text>
    </Box>
  </Box>
)

export default GovernanceOverview
