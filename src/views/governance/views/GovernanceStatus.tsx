import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { Box, Card, Spinner, Text } from 'theme-ui'
import { shortenString } from 'utils'
import { ROUTES, TRANSACTION_STATUS } from 'utils/constants'
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
        Lorem ipsum dolor sit amet, consectetur adipiscing elit adipiscing elit
        consectetur.
      </Trans>
    </Text>
  </Box>
)

const Mining = ({ hash }: { hash: string }) => (
  <Box sx={{ textAlign: 'center', width: 400 }}>
    <Spinner size={24} />
    <Text sx={{ fontWeight: 500, display: 'block' }}>
      <Trans>RToken governance is deploying</Trans>
    </Text>
    <Text as="p" variant="legend">
      <Trans>TODO TODO TODO</Trans>
    </Text>
    <Text mt={4} sx={{ display: 'block' }} variant="legend">
      Tx hash: {shortenString(hash)}
    </Text>
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
