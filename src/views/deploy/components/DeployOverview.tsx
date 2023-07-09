import { Trans, t } from '@lingui/macro'
import Deployer from 'abis/Deployer'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import TransactionButton from 'components/button/TransactionButton'
import DeployActionIcon from 'components/icons/DeployActionIcon'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chainIdAtom } from 'state/atoms'
import { Box, BoxProps, Flex, Spinner, Text } from 'theme-ui'
import { shortenString } from 'utils'
import { DEPLOYER_ADDRESS } from 'utils/addresses'
import { ROUTES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address, decodeEventLog } from 'viem'
import useDeploy from '../useDeploy'

const Pending = () => (
  <>
    <Spinner mt={3} size={24} mb={2} />
    <Text sx={{ fontWeight: 500, display: 'block' }}>
      <Trans>Pending, sign in wallet</Trans>
    </Text>
    <Text as="p" variant="legend">
      <Trans>
        Please sign the transaction in your wallet to continue with the
        deployment process.
      </Trans>
    </Text>
  </>
)

const Mining = ({ hash }: { hash: string }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <>
      <Spinner size={24} mt={3} mb={2} />
      <Text sx={{ fontWeight: 500, fontSize: 3, display: 'block' }} mb={2}>
        <Trans>Deploy transaction submitted</Trans>
      </Text>
      <Text as="p" variant="legend">
        <Trans>
          Meditate peacefully on the stability of a future asset backed reserve
          currency while your RToken deploys 🧘‍♂️
        </Trans>
      </Text>
      <Text as="p" variant="legend" mt={2}>
        <Trans>
          Please don't close this window to avoid issues finding your way back
          here.
        </Trans>
      </Text>
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'center' }}
        mt={4}
      >
        <Text>{shortenString(hash)}</Text>
        <CopyValue ml={3} mr={2} value={hash} />
        <GoTo
          href={getExplorerLink(hash, chainId, ExplorerDataType.TRANSACTION)}
        />
      </Box>
    </>
  )
}

interface Props extends BoxProps {
  onDeploy(rtoken: Address): void
}

const DeployOverview = ({ onDeploy, sx = {}, ...props }: Props) => {
  const navigate = useNavigate()
  const chainId = useAtomValue(chainIdAtom)
  const { gas, write, isReady, data: callData, reset, isLoading } = useDeploy()
  const { data, status } = useWatchTransaction(callData?.hash)

  const handleDeploySuccess = () => {
    const deployLog = data?.logs
      ? data.logs.find(
          (logs) => logs.address === DEPLOYER_ADDRESS[chainId].toLowerCase()
        )
      : undefined

    try {
      if (deployLog) {
        const {
          args: { rToken },
        } = decodeEventLog({
          abi: Deployer,
          ...deployLog,
        })

        onDeploy(rToken)
      } else {
        // In the weird case there is no token on the logs (most likely a bug)
        // Redirect the user to the token list so they can find their token and continue the process
        navigate(ROUTES.TOKENS)
      }
    } catch (e) {
      console.log('error', e)
    }
  }

  useEffect(() => {
    if (status === 'error') {
      reset()
    }

    if (status === 'success') {
      handleDeploySuccess()
    }
  }, [status])

  return (
    <Box
      variant="layout.borderBox"
      sx={{ ...sx, height: 'fit-content' }}
      {...props}
    >
      <Flex
        sx={{
          alignItems: 'center',
          flexDirection: 'column',
          textAlign: 'center',
        }}
        py={2}
      >
        <DeployActionIcon />
        <Text variant="title" mt={2} mb={1}>
          <Trans>Tx1. RToken Deploy</Trans>
        </Text>
        {(() => {
          if (isLoading && !callData?.hash) {
            return <Pending />
          }

          if (callData?.hash) {
            return <Mining hash={callData.hash} />
          }

          return (
            <>
              <Text variant="legend" as="p" sx={{ textAlign: 'center' }}>
                <Trans>
                  You will be the temporary owner until governance is deployed
                  in transaction 2.
                </Trans>
              </Text>

              <TransactionButton
                text={t`Deploy RToken`}
                mt={4}
                fullWidth
                disabled={!isReady}
                onClick={write}
                gas={gas}
              />
            </>
          )
        })()}
      </Flex>
    </Box>
  )
}

export default DeployOverview
