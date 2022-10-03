import { Trans } from '@lingui/macro'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { Box, Card, Spinner, Text } from 'theme-ui'
import { shortenString } from 'utils'
import { ROUTES, TRANSACTION_STATUS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { deployStepAtom } from 'views/deploy/components/DeployHeader'
import { Steps } from 'views/deploy/components/DeployStep'
import { govTxIdAtom } from '../atoms'

const Pending = () => (
  <Box sx={{ textAlign: 'center', width: 400 }}>
    <Spinner size={24} />
    <Text sx={{ fontWeight: 500, display: 'block' }}>
      <Trans>Pending, sign in wallet</Trans>
    </Text>
    <Text as="p" variant="legend">
      <Trans>
        Please sign the transaction in your wallet to continue with the
        government configuration process.
      </Trans>
    </Text>
  </Box>
)

const Mining = ({ hash }: { hash: string }) => (
  <Box sx={{ textAlign: 'center', width: 420 }}>
    <Spinner size={24} />
    <Text sx={{ fontWeight: 500, display: 'block' }}>
      <Trans>RToken governance is deploying</Trans>
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
      <Text mr={3} variant="legend">
        {shortenString(hash)}
      </Text>
      <CopyValue ml={3} mr={2} value={hash} />
      <GoTo href={getExplorerLink(hash, ExplorerDataType.TRANSACTION)} />
    </Box>
  </Box>
)

const GovernanceSetup = () => {
  const txId = useAtomValue(govTxIdAtom)
  const tx = useTransaction(txId)
  const setStep = useUpdateAtom(deployStepAtom)
  const navigate = useNavigate()

  useEffect(() => {
    if (tx?.status === TRANSACTION_STATUS.CONFIRMED) {
      navigate(`${ROUTES.GOVERNANCE_INFO}/${txId}`)
    }
    if (tx?.status === TRANSACTION_STATUS.REJECTED) {
      setStep(Steps.GovernanceSummary)
    }
  }, [tx?.status])

  return (
    <Card
      mt={5}
      mx={5}
      sx={{
        height: 'calc(100vh - 180px)',
        minHeight: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {tx?.hash ? <Mining hash={tx.hash} /> : <Pending />}
    </Card>
  )
}

export default GovernanceSetup
